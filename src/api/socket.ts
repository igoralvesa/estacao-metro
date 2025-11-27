import { io, Socket } from 'socket.io-client';

// Backend URL comes from Vite env or fallback
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket) return socket;

  socket = io(BACKEND_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: Infinity,
  });

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  try {
    socket.disconnect();
  } finally {
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export type FrontendState = {
  estacaoCentral: { aguardando: number; totalHoje: number };
  proximoTrem: { ocupados: number; total: number };
  estacaoNorte: { aguardando: number; totalHoje: number };
  ultimaAtualizacao: string;
};

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
};
