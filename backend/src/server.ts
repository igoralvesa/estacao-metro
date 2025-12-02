import { Server } from 'socket.io';
import mqtt, { MqttClient } from 'mqtt';
import { config } from 'dotenv';

config();

// CloudAMQP usa AMQP (não MQTT para o backend Node.js)
// MQTT settings (esp32 publishes to this topic)
const MQTT_URL = process.env.MQTT_URL || 'mqtt://jackal.rmq.cloudamqp.com:1883';
const MQTT_USER = process.env.MQTT_USER || 'czeerhjr:czeerhjr';
const MQTT_PASS = process.env.MQTT_PASS || 'uWTrByb5tyInpDfBtyjEus9-OqiP4Kh3';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'metro/state';
const PORT = parseInt(process.env.PORT || '3001');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Tipos baseados no JSON do ESP32
interface EmbarcadoMessage {
  metro_count: number;        // pessoas no vagão
  platform1_count: number;     // pessoas na plataforma (Estação Central)
  platform2_count: number;     // pessoas na plataforma (Estação Norte)
  daily_total: number;        // total do dia
  timestamp: number;          // segundos desde boot do ESP32
  event: 'train_board' | 'train_unboard' | 'platform_enter_cat1' | 'platform_enter_cat2' | 'platform_exit_cat1' | 'platform_exit_cat2' | 'none';
}

// Formato enviado para o frontend
interface FrontendData {
  estacaoCentral: {
    aguardando: number;
    totalHoje: number;
  };
  proximoTrem: {
    ocupados: number;
    total: number;
  };
  estacaoNorte: {
    aguardando: number;
    totalHoje: number;
  };
  ultimaAtualizacao: string;
}

// Estado atual (dados das duas estações)
let currentState: FrontendData = {
  estacaoCentral: {
    aguardando: 0,      // platform1_count do ESP32
    totalHoje: 0,       // daily_total do ESP32
  },
  proximoTrem: {
    ocupados: 0,        // metro_count do ESP32
    total: 300,         // capacidade máxima (fixo, conforme seu código ESP32)
  },
  estacaoNorte: {
    aguardando: 0,      // platform2_count do ESP32
    totalHoje: 0,       // daily_total do ESP32 (compartilhado)
  },
  ultimaAtualizacao: new Date().toLocaleTimeString('pt-BR'),
};

// Configura Socket.io
const io = new Server(PORT, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

let mqttClient: MqttClient | null = null;

// Processa mensagem do embarcado e atualiza estado
function processarMensagem(msg: EmbarcadoMessage): void {
  console.log('\n📨 Mensagem recebida do embarcado:');
  console.log(JSON.stringify(msg, null, 2));

  // Estação Central (platform1)
  currentState.estacaoCentral.aguardando = msg.platform1_count;
  currentState.estacaoCentral.totalHoje = msg.daily_total;
  
  // Vagão (metrô)
  currentState.proximoTrem.ocupados = msg.metro_count;
  
  // Estação Norte (platform2)
  currentState.estacaoNorte.aguardando = msg.platform2_count;
  currentState.estacaoNorte.totalHoje = msg.daily_total; // compartilha o total diário
  
  // Atualiza timestamp
  currentState.ultimaAtualizacao = new Date().toLocaleTimeString('pt-BR');

  console.log('\n📤 Estado atualizado enviado para frontend:');
  console.log(JSON.stringify(currentState, null, 2));

  // Envia para todos os clientes conectados
  io.emit('metro_update', currentState);
}

// Conecta ao broker MQTT e se inscreve no tópico publicado pelo ESP32
function connectMQTT(): void {
  console.log(`🔄 Conectando ao MQTT broker ${MQTT_URL} ...`);

  mqttClient = mqtt.connect(MQTT_URL, {
    username: MQTT_USER,
    password: MQTT_PASS,
    reconnectPeriod: 5000,
  });

  mqttClient.on('connect', () => {
    console.log('✅ Conectado ao MQTT broker');
    mqttClient?.subscribe(MQTT_TOPIC, { qos: 1 }, (err: Error | null) => {
      if (err) {
        console.error('❌ Falha ao se inscrever no tópico MQTT:', err);
      } else {
        console.log(`📨 Inscrito no tópico MQTT: ${MQTT_TOPIC}`);
      }
    });
  });

  mqttClient.on('message', (topic: string, payload: Buffer) => {
    try {
      const content = payload.toString();
      console.log('\n🔍 Mensagem MQTT recebida no tópico', topic, ':', content);
      const data: EmbarcadoMessage = JSON.parse(content);
      processarMensagem(data);
    } catch (err) {
      console.error('❌ Erro ao processar mensagem MQTT:', err);
    }
  });

  mqttClient.on('error', (err: Error) => {
    console.error('❌ Erro no cliente MQTT:', err);
  });

  mqttClient.on('close', () => {
    console.warn('⚠️  Conexão MQTT fechada — aguardando reconexão automática');
  });
}

// Gerencia conexões WebSocket dos clientes (frontend)
io.on('connection', (socket) => {
  console.log(`\n✅ Cliente frontend conectado: ${socket.id}`);
  console.log(`📊 Total de clientes: ${io.engine.clientsCount}`);

  // Envia estado atual para o novo cliente
  socket.emit('metro_update', currentState);
  console.log('📤 Estado inicial enviado para cliente:', socket.id);

  socket.on('disconnect', () => {
    console.log(`\n❌ Cliente desconectado: ${socket.id}`);
    console.log(`📊 Total de clientes: ${io.engine.clientsCount}`);
  });

  socket.on('error', (error) => {
    console.error(`❌ Erro no socket ${socket.id}:`, error);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Encerrando servidor...');
  
  io.close(() => {
    console.log('✅ WebSocket fechado');
  });

  if (mqttClient) {
    mqttClient.end(true, () => {
      console.log('✅ Cliente MQTT finalizado');
    });
  }
  
  console.log('✅ Conexões fechadas');
  process.exit(0);
});

// Inicia servidor
console.log('\n🚀 ========================================');
console.log('🚇 Backend Painel do Metrô');
console.log('🚀 ========================================');
console.log(`📡 Servidor WebSocket: porta ${PORT}`);
console.log(`🌐 Permitindo conexões de: ${FRONTEND_URL}`);
console.log(`📨 Consumindo tópico MQTT: ${MQTT_TOPIC}`);
console.log('🚀 ========================================\n');

connectMQTT();