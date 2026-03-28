import prisma from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, generateSecurityCode } from '../utils/mailer.js';
import auditLogger from '../utils/audit.logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

/**
 * REGISTRO (Passo 1): Cria usuário pendente e envia código
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "As senhas não coincidem" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
    }

    // OPTIMIZING: Só trazemos o necessário do banco de dados para economizar memória e IO.
    const userExists = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true, isVerified: true, email: true }
    });
    
    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ error: "Este e-mail já está cadastrado" });
      }
      console.log(`[DEBUG] Usuário pendente detectado (${email}). Reenviando token...`);
      const verificationCode = generateSecurityCode();
      const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.authToken.deleteMany({ where: { userId: userExists.id, tokenType: "REGISTRATION" } });
      await prisma.authToken.create({
        data: {
          code: hashedVerificationCode,
          tokenType: "REGISTRATION",
          userId: userExists.id,
          expiresAt: expiresAt
        }
      });

      console.log(`[DEBUG] Código reenviado para terminal e e-mail.`);
      sendVerificationEmail(email, verificationCode, 'REGISTRATION');
      return res.status(200).json({
        message: "E-mail pendente detectado! Reenviamos o código de verificação para você.",
        email: userExists.email
      });
    }
    
    console.log(`[DEBUG] Gerando código para: ${email}`);
    
    // OPTIMIZING: Rodamos os dois Hashings (senha e token) EM PARALELO.
    // O Bcrypt é pesado. Se fizermos juntos usando Promise.all, economizamos cerca de 100ms a 150ms de Event Loop.
    const verificationCode = generateSecurityCode();
    const [hashedPassword, hashedVerificationCode] = await Promise.all([
      bcrypt.hash(password, 10),
      bcrypt.hash(verificationCode, 10)
    ]);
    
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    console.log(`[DEBUG] Criando registro de usuário no banco...`);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        isVerified: false
      }
    });

    console.log(`[DEBUG] Criando token de verificação para userId: ${user.id}`);
    await prisma.authToken.create({
      data: {
        code: hashedVerificationCode,
        tokenType: "REGISTRATION",
        userId: user.id,
        expiresAt: expiresAt
      }
    });

    console.log(`[DEBUG] Chamando serviço de e-mail...`);
    // Enviar E-mail em background
    sendVerificationEmail(email, verificationCode, 'REGISTRATION');

    res.status(201).json({
      message: "Registro iniciado! Enviamos um código para seu e-mail.",
      email: user.email
    });

  } catch (error) {
    console.error('[ERRO FATAL - createUser]:', error);
    res.status(500).json({ error: "Erro interno ao criar usuário. Verifique logs do servidor." });
  }
};

/**
 * VERIFICAÇÃO (Passo 2): Valida código de registro ou recuperação
 */
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // OPTIMIZING: Select mínimo, apenas ID para buscar o token
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true }
    });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // Busca o token mais recente do tipo REGISTRATION para este usuário
    const tokenRecord = await prisma.authToken.findFirst({
      where: { 
        userId: user.id, 
        tokenType: "REGISTRATION" 
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!tokenRecord) {
      return res.status(400).json({ error: "Nenhum código gerado para este usuário" });
    }

    const isCodeValid = await bcrypt.compare(code, tokenRecord.code);
    if (!isCodeValid) {
      return res.status(400).json({ error: "Código de segurança incorreto" });
    }

    if (new Date() > tokenRecord.expiresAt) {
      return res.status(400).json({ error: "Código expirado. Solicite um novo." });
    }

    // Ativa o usuário
    await prisma.user.update({
      where: { email },
      data: { isVerified: true }
    });

    // Remove o token utilizado
    await prisma.authToken.delete({ where: { id: tokenRecord.id } });

    res.status(200).json({ message: "Código validado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao validar código" });
  }
};

/**
 * LOGIN: Agora bloqueia usuários não verificados
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        teams: {
          include: {
            team: {
              include: { permissions: true }
            }
          }
        }
      }
    });

    if (!user) {
      auditLogger.warn(`Falha de login: Usuário não encontrado para e-mail ${email}`);
      return res.status(401).json({ error: "E-mail ou senha incorretos" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Sua conta ainda não foi verificada. Verifique seu e-mail." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      auditLogger.warn(`Falha de login: Senha incorreta para e-mail ${email}`);
      return res.status(401).json({ error: "E-mail ou senha incorretos" });
    }

    const accessToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '60m' }
    );

    const refreshTokenString = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt: expiresAt
      }
    });

    res.json({
      message: "Login realizado com sucesso!",
      accessToken,
      refreshToken: refreshTokenString,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        avatarUrl: user.avatarUrl,
        role: user.role,
        teams: user.teams
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        teams: {
          include: {
            team: {
              include: {
                members: {
                  include: {
                    user: {
                      select: { id: true, name: true, avatarUrl: true, role: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: "Erro interno ao buscar perfil" });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let dataToUpdate = { name, email };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: dataToUpdate
    });

    res.json({ message: "Perfil atualizado com sucesso!", user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Erro ao atualizar seu perfil:', error);
    res.status(500).json({ error: "Erro interno ao atualizar perfil" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ error: "Refresh token não fornecido" });
    }

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!tokenRecord || tokenRecord.revoked || new Date() > tokenRecord.expiresAt) {
      return res.status(401).json({ error: "Refresh token inválido ou expirado" });
    }

    const accessToken = jwt.sign(
      { userId: tokenRecord.userId },
      JWT_SECRET,
      { expiresIn: '60m' }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(500).json({ error: "Erro interno ao processar refresh" });
  }
};

/**
 * RECUPERAÇÃO (Passo 1): Solicita código para trocar senha
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // OPTIMIZING: Select mínimo
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true } 
    });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const code = generateSecurityCode();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Limpa tokens antigos de recuperação antes de criar um novo
    await prisma.authToken.deleteMany({
      where: { userId: user.id, tokenType: "PASSWORD_RESET" }
    });

    await prisma.authToken.create({
      data: {
        code: hashedCode,
        tokenType: "PASSWORD_RESET",
        userId: user.id,
        expiresAt: expiresAt
      }
    });

    sendVerificationEmail(email, code, 'PASSWORD_RESET');

    res.status(200).json({ message: "Código de recuperação enviado!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar recuperação" });
  }
};

/**
 * RECUPERAÇÃO (Passo 2): Troca a senha após validação do código
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const tokenRecord = await prisma.authToken.findFirst({
      where: { 
        userId: user.id, 
        tokenType: "PASSWORD_RESET" 
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!tokenRecord) {
      return res.status(400).json({ error: "Código inválido ou não solicitado" });
    }

    const isCodeValid = await bcrypt.compare(code, tokenRecord.code);
    if (!isCodeValid) {
      return res.status(400).json({ error: "Código inválido" });
    }

    if (new Date() > tokenRecord.expiresAt) {
      return res.status(400).json({ error: "Código expirado" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        isVerified: true 
      }
    });

    // Limpa o token após o uso
    await prisma.authToken.delete({ where: { id: tokenRecord.id } });

    res.status(200).json({ message: "Senha redefinida com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao resetar senha" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    await prisma.user.update({
      where: { id: req.userId },
      data: { avatarUrl }
    });

    res.json({ message: 'Avatar atualizado com sucesso!', avatarUrl });
  } catch (error) {
    console.error('Erro no uploadAvatar:', error);
    res.status(500).json({ error: 'Erro ao processar upload do avatar' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isVerified: true, avatarUrl: true }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
};

export const updateUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, avatarUrl } = req.body;

    // Check permissions: User can only update themselves OR must be ADMIN
    if (req.userId !== id && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: "Você não tem permissão para atualizar este usuário" });
    }

    let dataToUpdate = { name, email };
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);
    if (avatarUrl) dataToUpdate.avatarUrl = avatarUrl;

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate
    });

    res.status(200).json({ message: "Usuário atualizado!", id: user.id });
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar usuário" });
  }
};

export const deleteUsers = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "Usuário deletado!" });
  } catch (error) {
    res.status(400).json({ error: "Erro ao deletar usuário" });
  }
};