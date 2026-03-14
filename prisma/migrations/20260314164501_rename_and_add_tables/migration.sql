/*
  Warnings:

  - You are about to drop the `Chamado` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FreightTicket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShoppingTicket` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Chamado";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "FreightTicket";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ShoppingTicket";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CNpj" (
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
CREATE TABLE "Shopping" (
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
CREATE TABLE "Frete" (
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
CREATE TABLE "Procedimento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lixeira" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "deletedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "CNpj_cnpj_idx" ON "CNpj"("cnpj");

-- CreateIndex
CREATE INDEX "Shopping_cnpj_idx" ON "Shopping"("cnpj");

-- CreateIndex
CREATE INDEX "Frete_cnpj_idx" ON "Frete"("cnpj");
