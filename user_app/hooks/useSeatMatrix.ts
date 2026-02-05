import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { Seat, SeatStatus } from '@/types/bus.type';
import { storageKeys, tokenManager } from '@/lib/token';

interface UseSeatMatrixReturn {
  seatMatrix: Seat[][];
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export const useSeatMatrix = (tripId: number | null): UseSeatMatrixReturn => {
  const [seatMatrix, setSeatMatrix] = useState<Seat[][]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentUserId = useCallback((): number | undefined => {
    if (typeof window === 'undefined') return undefined;
    try {
      const userProfile = localStorage.getItem(storageKeys.USER_PROFILE);
      if (userProfile) {
        const parsed = JSON.parse(userProfile);
        return parsed?.id;
      }
    } catch (error) {
      console.error('Failed to get user profile:', error);
    }
    return undefined;
  }, []);

  const processSeatMatrix = useCallback((rawMatrix: Seat[][]): Seat[][] => {
    const currentUserId = getCurrentUserId();
    const now = new Date();

    return rawMatrix.map(row =>
      row.map(seat => {
        let status: SeatStatus = 'AVAILABLE';

        if (seat.isBooked) {
          status = 'UNAVAILABLE';
        } else if (seat.lockedUntil) {
          const lockedUntilDate = new Date(seat.lockedUntil);
          if (lockedUntilDate > now) {
            if (seat.lockOwner === currentUserId) {
              status = 'AVAILABLE';
            } else {
              status = 'LOCKED_BY_OTHER';
            }
          } else {
            status = 'AVAILABLE';
          }
        } else {
          status = 'AVAILABLE';
        }

        return {
          ...seat,
          status,
        };
      })
    );
  }, [getCurrentUserId]);

  const connect = useCallback(() => {
    if (!tripId) return;

    // Don't create a new client if one is already active
    if (clientRef.current?.active) {
      return;
    }

    try {
      // Get authentication token
      const token = tokenManager.getAccessToken();

      if (!token) {
        setError('Authentication required');
        return;
      }

      const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: (str) => {
          console.log('[STOMP]', str);
        },
        onConnect: () => {
          setIsConnected(true);
          setError(null);

          // Subscribe to user-specific seat matrix updates (initial data)
          const userSubscription = client.subscribe(
            `/user/queue/seat-matrix/${tripId}`,
            (message) => {
              try {
                const rawSeatMatrix: Seat[][] = JSON.parse(message.body);
                const processedMatrix = processSeatMatrix(rawSeatMatrix);
                setSeatMatrix(processedMatrix);
              } catch (err) {
                console.error('Failed to parse initial seat matrix:', err);
                setError('Failed to process seat data');
              }
            }
          );
          subscriptionRef.current = userSubscription;

          // Subscribe to broadcast updates for real-time changes
          const topicSubscription = client.subscribe(
            `/topic/seat-matrix/${tripId}`,
            (message) => {
              try {
                const rawSeatMatrix: Seat[][] = JSON.parse(message.body);
                const processedMatrix = processSeatMatrix(rawSeatMatrix);
                setSeatMatrix(processedMatrix);
              } catch (err) {
                console.error('Failed to parse broadcast update:', err);
              }
            }
          );

          // Request initial seat matrix data
          client.publish({
            destination: `/app/seat-matrix/${tripId}`,
            body: JSON.stringify({ tripId }),
          });
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          setError('WebSocket connection error');
          setIsConnected(false);
        },
        onWebSocketError: (event) => {
          console.error('WebSocket error:', event);
          setError('Failed to connect to seat updates');
          setIsConnected(false);
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
        },
      });

      client.activate();
      clientRef.current = client;
    } catch (err) {
      console.error('Failed to initialize WebSocket:', err);
      setError('Failed to initialize connection');
    }
  }, [tripId, processSeatMatrix]);

  const disconnect = useCallback(() => {

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch (err) {
        console.error('Error deactivating client:', err);
      }
      clientRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setError(null);
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, 1000);
  }, [connect, disconnect]);

  useEffect(() => {
    if (!tripId) return;

    // Connect on mount
    connect();

    // Disconnect on unmount
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  return {
    seatMatrix,
    isConnected,
    error,
    reconnect,
  };
};
