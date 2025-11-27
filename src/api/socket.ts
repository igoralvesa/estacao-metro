import { io, Socket } from 'socket.io-client';

// Backend URL comes from Vite env or fallback
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// default give-up timeout (ms) when attempting to connect
const DEFAULT_CONNECT_TIMEOUT = Number(import.meta.env.VITE_SOCKET_CONNECT_TIMEOUT_MS) || 10_000;

let socket: Socket | null = null;
let _giveUpTimer: ReturnType<typeof setTimeout> | null = null;

function startGiveUpTimer(timeoutMs: number) {
  if (timeoutMs <= 0) return;
  if (_giveUpTimer) {
    clearTimeout(_giveUpTimer);
    _giveUpTimer = null;
  }

  _giveUpTimer = setTimeout(() => {
    try {
      if (socket && !socket.connected) {
        try {
          // disable further reconnection attempts
          // @ts-ignore
          if (socket.io && socket.io.opts) socket.io.opts.reconnection = false;
        } catch (e) {
          // ignore
        }
        try {
          socket.disconnect();
        } catch (e) {
          // ignore
        }
        socket = null;
        try {
          window.dispatchEvent(new CustomEvent('socket:giveup'));
        } catch (e) {
          // ignore in non-browser env
        }
      }
    } finally {
      _giveUpTimer = null;
    }
  }, timeoutMs);
}

export function connectSocket(): Socket {
  // if a socket already exists, try to (re)start it and restart give-up timer
  if (socket) {
    try {
      // re-enable reconnection attempts if they were disabled
      // @ts-ignore
      if (socket.io && socket.io.opts) socket.io.opts.reconnection = true;
      // start connection attempt
      socket.connect();
    } catch (e) {
      // ignore
    }

    startGiveUpTimer(DEFAULT_CONNECT_TIMEOUT);

    return socket as Socket;
  }

  socket = io(BACKEND_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: Infinity,
  });

  // notify listeners that a new socket instance was created
  try {
    window.dispatchEvent(new CustomEvent('socket:created'));
  } catch (e) {
    // ignore in non-browser env
  }

  // start a timer that will stop reconnection attempts if not connected
  startGiveUpTimer(DEFAULT_CONNECT_TIMEOUT);

  // clear the give-up timer on successful connect
  socket.on('connect', () => {
    if (_giveUpTimer) {
      clearTimeout(_giveUpTimer);
      _giveUpTimer = null;
    }
  });

  return socket as Socket;
}

export function disconnectSocket() {
  if (!socket) return;
  try {
    socket.disconnect();
  } finally {
    socket = null;
    if (_giveUpTimer) {
      clearTimeout(_giveUpTimer);
      _giveUpTimer = null;
    }
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
