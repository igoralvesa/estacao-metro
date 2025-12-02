# 🚇 Sistema de Monitoramento de Estação de Metrô

Sistema completo para monitoramento de estações de metrô com backend Node.js + Socket.IO + MQTT e frontend React + Vite.

## � Início Rápido

### Pré-requisitos

- Docker
- Docker Compose

### Como Usar

1. **Clone o repositório**:

   ```bash
   git clone https://github.com/igoralvesa/estacao-metro.git
   ```

2. **Suba a aplicação** (isso vai instalar todas as dependências automaticamente):

   ```bash
   docker compose up --build
   ```

   > **Nota**: Na primeira vez pode demorar alguns minutos para baixar as imagens e instalar as dependências.

3. **Acesse a aplicação**:

   - **Frontend**: http://localhost:5173
   - **Backend**: http://localhost:3001

4. **Para parar**:
   ```bash
   # Pressione Ctrl+C se estiver rodando em foreground
   # Ou use:
   docker compose down
   ```

### Modo Background

Para rodar em background (sem ocupar o terminal):

```bash
docker compose up -d --build
```

Ver logs:

```bash
docker compose logs -f
```

## 📋 Estrutura do Projeto

```
estacao-metro/
├── backend/              # Servidor Node.js com Socket.IO e MQTT
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── frontend/             # Aplicação React com Vite
│   ├── src/
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml    # Orquestração dos serviços
```

## 🔧 Desenvolvimento Local (sem Docker)

Se preferir rodar sem Docker para desenvolvimento:

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

> **Nota**: Você precisará ter Node.js 20+ e pnpm instalados.

## 📡 Arquitetura

- **Backend** (porta 3001):

  - Servidor Socket.IO para comunicação em tempo real com o frontend
  - Cliente MQTT para receber dados do ESP32
  - Processa e distribui dados das estações de metrô

- **Frontend** (porta 5173):

  - Interface React para visualização dos dados
  - Conexão WebSocket com o backend
  - Atualização em tempo real das informações

- **Comunicação**:
  - ESP32 → MQTT → Backend → Socket.IO → Frontend

## 🌐 Variáveis de Ambiente

### Backend

- `PORT`: Porta do servidor (padrão: 3001)
- `MQTT_URL`: URL do broker MQTT
- `MQTT_USER`: Usuário MQTT
- `MQTT_PASS`: Senha MQTT
- `MQTT_TOPIC`: Tópico MQTT para receber mensagens
- `FRONTEND_URL`: URL do frontend para configuração de CORS

### Frontend

- `VITE_BACKEND_URL`: URL do backend (padrão: http://localhost:3001)
- `VITE_SOCKET_CONNECT_TIMEOUT_MS`: Timeout de conexão do Socket.IO (padrão: 10000ms)

## 🛠️ Comandos Úteis

```bash
# Ver logs em tempo real
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f backend
docker compose logs -f frontend

# Ver status dos serviços
docker compose ps

# Reiniciar serviços
docker compose restart

# Parar e remover tudo (containers, networks, volumes)
docker compose down -v

# Rebuild sem cache (útil quando atualizar dependências)
docker compose build --no-cache
docker compose up
```

## 🐛 Troubleshooting

1. **Erro de conexão entre frontend e backend**:

   - Verifique se os serviços estão rodando: `docker-compose ps`
   - Verifique os logs: `docker-compose logs`

2. **Porta já em uso**:

   - Altere as portas no `docker-compose.yml`
   - Ou pare o serviço que está usando a porta

3. **Problemas com MQTT**:

   - Verifique as credenciais no arquivo `.env` ou `docker-compose.yml`
   - Verifique os logs do backend: `docker-compose logs backend`

4. **Frontend não carrega**:
   - Aguarde o build completo (pode demorar na primeira vez)
   - Verifique se o backend está acessível
   - Verifique a variável `VITE_BACKEND_URL`

## 📄 Licença

Este projeto é parte de um trabalho acadêmico do 6º período do curso de Sistemas Embarcados.
