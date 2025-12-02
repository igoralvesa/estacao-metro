FROM node:20-alpine

WORKDIR /app

# Argumentos de build para variáveis de ambiente do Vite
ARG VITE_BACKEND_URL=http://localhost:3001
ARG VITE_SOCKET_CONNECT_TIMEOUT_MS=10000

# Define as variáveis de ambiente para o build
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_SOCKET_CONNECT_TIMEOUT_MS=$VITE_SOCKET_CONNECT_TIMEOUT_MS

# Copia arquivos de dependências
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Instala pnpm e dependências
RUN npm install -g pnpm
RUN pnpm install

# Copia o resto dos arquivos
COPY . .

# Build do frontend com as variáveis de ambiente
RUN pnpm run build

# Instala servidor estático para servir o build usando npm
RUN npm install -g serve

EXPOSE 5173

# Serve o build do frontend
CMD ["serve", "-s", "dist", "-l", "5173"]
