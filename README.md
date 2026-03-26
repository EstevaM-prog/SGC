# SGC - Sistema de Gestão de Chamados 🚀

O **SGC** é uma plataforma fullstack moderna, segura e de alta performance, projetada para centralizar a gestão de chamados, compras, fretes e processos operacionais. Com uma arquitetura de monorepo e foco em conformidade de dados (**LGPD**), o sistema oferece uma experiência profissional com estética **Dark Glassmorphism**.

---

## ✨ Novidades v2.1

O sistema foi atualizado para uma arquitetura mais robusta e transparente:

- **Auditoria Estruturada**: Implementação de logs de auditoria (Winston) com rotação diária para monitorar login, falhas de segurança e alterações de permissão.
- **Sistema de Lixeira (Soft Delete)**: Recuperação inteligente de chamados, compras e fretes excluídos, permitindo restauração ou exclusão permanente.
- **Gestão de Times v2**: Painel administrativo para membros da equipe com controle de *Feature Flags* e permissões dinâmicas via JSON.
- **Onboarding Premium**: Nova página de boas-vindas (*Welcome Page*) e tela de carregamento (*Loading Screen*) com micro-animações e feedback visual.
- **Central de Suporte**: Interface redesenhada para abertura de tickets com categorização inteligente e busca em base de conhecimento.

---

## 🏗️ Arquitetura e Tech Stack

O projeto utiliza **NPM Workspaces** para gerenciar o monorepo:

### **Frontend** (`/client`)
- **React 19** + **Vite**: Interface ultra-rápida e moderna.
- **Estética Dark Glassmorphism**: Design premium com transparências, blurs e animações fluidas.
- **Lucide React**: Biblioteca de ícones vetoriais.
- **Recharts**: Painéis e dashboards dinâmicos orientados a dados.
- **React Hot Toast**: Notificações em tempo real com feedback visual imediato.

### **Backend** (`/server`)
- **Node.js** + **Express**: API REST escalável.
- **Prisma Client**: ORM com extensões para criptografia transparente.
- **Neon DB**: PostgreSQL serverless de baixa latência.
- **Swagger**: Documentação interativa completa (OpenAPI v3).
- **Audit Logging**: Winston + Winston Daily Rotate File para rastreabilidade.

---

## 🔒 Segurança e Privacidade (LGPD)

O SGC foi construído com foco em **Proteção de Dados** e **Segurança em Camadas**:

- **Identidade**: Hashing de senhas com `Bcrypt` (cost factor 10).
- **Sessão**: Autenticação via `JWT` (JSON Web Tokens) com expiração controlada.
- **Criptografia em Repouso (TDE)**: Extensão Prisma para criptografia `AES-256-GCM` de campos sensíveis (E-mails, CNPJ, Razão Social) diretamente no banco de dados.
- **Verificação em Duas Etapas (2FA)**: Fluxo de registro e recuperação de senha via códigos de segurança de 6 dígitos enviados por e-mail.
- **RBAC (Role-Based Access Control)**: Permissões granulares para administradores e membros de equipe.

---

## ⚠️ Sistema de Tratamento de Erros

Interface amigável para todos os estados críticos:
- **401/403**: Tratamento de sessões expiradas e acessos não autorizados.
- **404**: Página customizada para rotas inexistentes.
- **500/Offline**: Detecção inteligente de queda de servidor e perda de conexão local.
- **503**: Página de manutenção para migrações críticas de banco de dados.
- **Token Error**: Aviso específico para links de recuperação de senha expirados.

---

## 🚀 Como Iniciar

### Variáveis de Ambiente (`/server/.env`)
```env
DATABASE_URL='postgresql://...'
JWT_SECRET='sua_chave_secreta'
ENCRYPTION_KEY='chave_hex_de_32_bytes' # Requerido para LGPD
MAIL_HOST='smtp.seuservidor.com'
MAIL_USER='seu_usuario'
MAIL_PASS='sua_senha'
```

### Comandos Principais
```bash
npm install     # Instala dependências em todo o monorepo
npm run dev     # Inicia Cliente (5173) e Servidor (3001) simultaneamente
```

- **Documentação da API:** [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

---

Desenvolvido com ❤️ por [Estevam](https://github.com/EstevaM-prog)
