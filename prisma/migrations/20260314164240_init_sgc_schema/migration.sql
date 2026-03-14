-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Chamado" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "situacao" TEXT,
    "numero" TEXT,
    "dataEmissao" TEXT,
    "pedido" TEXT,
    "notaFiscal" TEXT,
    "vencimento" TEXT,
    "valor" REAL DEFAULT 0,
    "forma" TEXT,
    "razao" TEXT,
    "cnpj" TEXT,
    "setor" TEXT,
    "codEtica" TEXT DEFAULT 'nao',
    "requisitante" TEXT,
    "obs" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ShoppingTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "situacao" TEXT,
    "numero" TEXT,
    "solicitacao" TEXT,
    "pedido" TEXT,
    "prazoEntrega" TEXT,
    "valor" REAL DEFAULT 0,
    "prazoPagto" TEXT,
    "razao" TEXT,
    "cnpj" TEXT,
    "requisitante" TEXT,
    "obs" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FreightTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "situacao" TEXT,
    "numero" TEXT,
    "solicitacao" TEXT,
    "pedido" TEXT,
    "prazoEntrega" TEXT,
    "valor" REAL DEFAULT 0,
    "prazoPagto" TEXT,
    "razao" TEXT,
    "cnpj" TEXT,
    "requisitante" TEXT,
    "obs" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Chamado_cnpj_idx" ON "Chamado"("cnpj");

-- CreateIndex
CREATE INDEX "ShoppingTicket_cnpj_idx" ON "ShoppingTicket"("cnpj");

-- CreateIndex
CREATE INDEX "FreightTicket_cnpj_idx" ON "FreightTicket"("cnpj");
