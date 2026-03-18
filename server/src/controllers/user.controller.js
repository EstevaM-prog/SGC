import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    // 1. VALIDAÇÕES (Sempre antes de qualquer operação no banco)
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "As senhas não coincidem" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
    }

    const validRoles = ["ADMIN", "USER"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Role inválida" });
    }

    // 2. VERIFICAR SE O USUÁRIO JÁ EXISTE
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: "Este e-mail já está cadastrado" });
    }

    // 3. CRIPTOGRAFIA
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. SALVAR NO BANCO (Note que não salvamos o confirmPassword no banco)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER"
      }
    });

    // 5. GERAR O TOKEN JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 6. RESPOSTA (Não enviamos a senha de volta por segurança)
    res.status(201).json({
      message: "Usuário criado com sucesso!",
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno ao criar usuário" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true } // Proteção de dados: oculta senhas
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

    // Se o usuário enviou uma nova senha, criptografamos
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: Number(id) }, // Certifique-se que o ID é número se for Int no Prisma
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
    await prisma.user.delete({
      where: { id: Number(id) }
    });
    res.status(200).json({ message: "Usuário deletado!" });
  } catch (error) {
    res.status(400).json({ error: "Erro ao deletar usuário" });
  }
};