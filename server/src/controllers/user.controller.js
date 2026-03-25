import prisma from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail, generateSecurityCode } from '../utils/mailer.js';

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

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ error: "Este e-mail já está cadastrado" });
      }
      console.log(`[DEBUG] Usuário pendente detectado (${email}). Reenviando token...`);
      const verificationCode = generateSecurityCode();
      const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.token.deleteMany({ where: { userId: userExists.id, type: "REGISTRATION" } });
      await prisma.token.create({
        data: {
          token: hashedVerificationCode,
          type: "REGISTRATION",
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateSecurityCode();
    const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
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
    // Gerenciar token na tabela específica
    await prisma.token.create({
      data: {
        token: hashedVerificationCode,
        type: "REGISTRATION",
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

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // Busca o token mais recente do tipo REGISTRATION para este usuário
    const tokenRecord = await prisma.token.findFirst({
      where: { 
        userId: user.id, 
        type: "REGISTRATION" 
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!tokenRecord) {
      return res.status(400).json({ error: "Nenhum código gerado para este usuário" });
    }

    const isCodeValid = await bcrypt.compare(code, tokenRecord.token);
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
    await prisma.token.delete({ where: { id: tokenRecord.id } });

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
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(401).json({ error: "E-mail ou senha incorretos" });

    if (!user.isVerified) {
      return res.status(403).json({ error: "Sua conta ainda não foi verificada. Verifique seu e-mail." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "E-mail ou senha incorretos" });

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: "Login realizado com sucesso!",
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: "Erro interno no servidor" });
  }
};

/**
 * RECUPERAÇÃO (Passo 1): Solicita código para trocar senha
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const code = generateSecurityCode();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Limpa tokens antigos de recuperação antes de criar um novo
    await prisma.token.deleteMany({
      where: { userId: user.id, type: "PASSWORD_RESET" }
    });

    await prisma.token.create({
      data: {
        token: hashedCode,
        type: "PASSWORD_RESET",
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

    const tokenRecord = await prisma.token.findFirst({
      where: { 
        userId: user.id, 
        type: "PASSWORD_RESET" 
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!tokenRecord) {
      return res.status(400).json({ error: "Código inválido ou não solicitado" });
    }

    const isCodeValid = await bcrypt.compare(code, tokenRecord.token);
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
    await prisma.token.delete({ where: { id: tokenRecord.id } });

    res.status(200).json({ message: "Senha redefinida com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao resetar senha" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isVerified: true }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
};

export const updateUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    let dataToUpdate = { name, email };
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);

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