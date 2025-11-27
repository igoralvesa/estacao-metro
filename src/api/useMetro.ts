import { useEffect, useState, useRef } from 'react';
import { connectSocket, getSocket } from './socket';
import type { FrontendState } from './socket';

type MaybeState = FrontendState | null;

export function useMetro() {
  const [state, setState] = useState<MaybeState>(null);
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  useEffect(() => {
    // helper to attach listeners to a socket instance
    function attach(s: ReturnType<typeof getSocket>) {
      if (!s) return;
      socketRef.current = s;
      // when we attach, we're attempting to get fresh data
      setIsLoading(!s.connected);
      setConnectionFailed(false);

      function onConnect() {
        setConnected(true);
        // still wait for the first metro_update to clear loading
        setIsLoading(true);
      }
      function onDisconnect() {
        setConnected(false);
      }
      function onMetroUpdate(data: FrontendState) {
        setState(data);
        setIsLoading(false);
        setConnectionFailed(false);
      }

      s.on('connect', onConnect);
      s.on('disconnect', onDisconnect);
      s.on('metro_update', onMetroUpdate);

      // store refs to detach later
      return { onConnect, onDisconnect, onMetroUpdate };
    }

    // initial socket (may create or reuse)
    const initial = connectSocket();
    const attached = attach(initial);

    // handle give-up and re-created socket instances
    function onGiveUp() {
      setConnectionFailed(true);
      setIsLoading(false);
      setConnected(false);
      socketRef.current = null;
    }

    function onSocketCreated() {
      // re-attach to the new socket instance
      const s = getSocket();
      // detach previous listeners if any
      if (socketRef.current && attached) {
        try {
          socketRef.current.off('connect', attached.onConnect);
          socketRef.current.off('disconnect', attached.onDisconnect);
          socketRef.current.off('metro_update', attached.onMetroUpdate);
        } catch (e) {}
      }
      attach(s);
    }

    window.addEventListener('socket:giveup', onGiveUp as EventListener);
    window.addEventListener('socket:created', onSocketCreated as EventListener);

    return () => {
      // detach listeners from current socket
      if (socketRef.current && attached) {
        try {
          socketRef.current.off('connect', attached.onConnect);
          socketRef.current.off('disconnect', attached.onDisconnect);
          socketRef.current.off('metro_update', attached.onMetroUpdate);
        } catch (e) {}
      }
      window.removeEventListener('socket:giveup', onGiveUp as EventListener);
      window.removeEventListener('socket:created', onSocketCreated as EventListener);
    };
  }, []);

  return {
    state,
    connected,
    isLoading,
    connectionFailed,
  } as {
    state: MaybeState;
    connected: boolean;
    isLoading: boolean;
    connectionFailed: boolean;
  };
}

export default useMetro;
