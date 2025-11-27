import { useEffect, useState } from 'react';
import { connectSocket } from './socket';
import type { FrontendState } from './socket';

type MaybeState = FrontendState | null;

export function useMetro() {
  const [state, setState] = useState<MaybeState>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = connectSocket();

    function onConnect() {
      setConnected(true);
    }
    function onDisconnect() {
      setConnected(false);
    }
    function onMetroUpdate(data: FrontendState) {
      setState(data);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('metro_update', onMetroUpdate);

    // request initial state is handled by backend on connect

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('metro_update', onMetroUpdate);
      // we don't disconnect globally here to allow multiple hooks
    };
  }, []);

  return { state, connected } as { state: MaybeState; connected: boolean };
}

export default useMetro;
