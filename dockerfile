# Estágio 1: Build do Frontend (Vite)
FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
# A variável do Netlify/Vercel vai aqui se for build estático
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Estágio 2: Setup do Servidor (Node.js)
FROM node:22-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./

# Copia o build do frontend para dentro do server (opcional, se quiser servir tudo junto)
COPY --from=client-build /app/client/dist ./public

# Configurações do Prisma
RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "start"]
