# SGC - Sistema de Gestão de Chamados 🚀

O **SGC** é uma plataforma fullstack moderna projetada para centralizar e otimizar o gerenciamento de chamados, compras, fretes e processos internos. Construído com uma arquitetura de monorepo, o sistema oferece uma experiência fluida, segura e escalável.

---

## 🏗️ Arquitetura do Projeto

O projeto utiliza a estrutura de **Monorepo** com `npm workspaces`, dividindo-se em:

-   **/client**: Interface do usuário desenvolvida com React e Vite.
-   **/server**: API REST robusta utilizando Node.js, Express e Prisma ORM.

---

## 🛠️ Tecnologias Utilizadas

### Frontend (`/client`)
-   **React 19** + **Vite** (HMR ultra-rápido)
-   **Lucide React** (Ícones modernos)
-   **Recharts** (Visualização de dados e dashboards)
-   **XLSX (SheetJS)** (Importação/Exportação de planilhas)
-   **CSS Vanilla** (Design modular e responsivo)

### Backend (`/server`)
-   **Node.js** + **Express**
-   **Prisma ORM** (Modelagem de dados e Migrations)
-   **Neon DB** (Banco de dados PostgreSQL na nuvem)
-   **JWT & Bcryptjs** (Autenticação e segurança de senhas)
-   **Swagger** (Documentação interativa da API)
-   **Jest & Supertest** (Testes de integração)

---

## 🚀 Como Iniciar

### Pré-requisitos
-   Node.js instalado
-   Conta no Neon DB (ou outro PostgreSQL)

### Instalação
Clone o repositório e instale todas as dependências (raiz, cliente e servidor) com um único comando:

```bash
npm install
```

### Desenvolvimento
Inicie o Frontend e o Backend simultaneamente:

```bash
npm run dev
```

-   **Frontend:** [http://localhost:5173](http://localhost:5173)
-   **Backend:** [http://localhost:3001](http://localhost:3001)
-   **API Docs (Swagger):** [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

---

## 📦 Scripts Disponíveis

Na raiz do projeto, você pode executar:

-   `npm run dev`: Inicia cliente e servidor juntos.
-   `npm run client`: Inicia apenas o frontend.
-   `npm run server`: Inicia apenas o backend.
-   `npm run build`: Gera a build de produção do frontend.
-   `npm test --workspace=server`: Executa os testes automatizados da API.

---

## 🔒 Variáveis de Ambiente

Crie um arquivo `.env` dentro da pasta `/server` com sua URL de conexão:

```env
DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"
PORT=3001
```

---

## 📄 Funcionalidades Principais
-   ✅ **Dashboard**: Gráficos e indicadores de desempenho.
-   ✅ **Gestão de Chamados**: Fluxo completo de situações (Aberto, Processando, Solucionado).
-   ✅ **Compras e Fretes**: Módulos especializados para logística e suprimentos.
-   ✅ **Gerenciamento de Empresas**: Banco de dados de CNPJs inteligente com Upsert.
-   ✅ **Procedimentos**: Documentação interna do sistema integrada.
-   ✅ **Lixeira Segura**: Sistema de exclusão suave (soft-delete) com restauração.
-   ✅ **Notificações**: Sistema de notificações em tempo real.

---

Desenvolvido por [Estevam](https://github.com/EstevaM-prog) 💻
