import { useEffect, useRef } from "react";
import { useAuth } from "./use-auth";

interface SocketEvents {
  onCategoryCreated?: (data: any) => void;
  onCategoryUpdated?: (data: any) => void;
  onCategoryDeleted?: (data: any) => void;
  onProductCreated?: (data: any) => void;
  onProductUpdated?: (data: any) => void;
  onProductDeleted?: (data: any) => void;
  onOrderCreated?: (data: any) => void;
  onOrderUpdated?: (data: any) => void;
  onSettingsUpdated?: (data: any) => void;
}

export function useSocket(events: SocketEvents) {
  const { user } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventsRef = useRef(events);

  // Update events ref when events change
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    // Only connect WebSocket if we have events to handle
    if (Object.keys(events).length === 0) return;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      try {
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          console.log("WebSocket connected");
          // Clear any reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const { event: eventType, data } = message;

            // Map WebSocket events to callback functions
            switch (eventType) {
              case "category:created":
                eventsRef.current.onCategoryCreated?.(data);
                break;
              case "category:updated":
                eventsRef.current.onCategoryUpdated?.(data);
                break;
              case "category:deleted":
                eventsRef.current.onCategoryDeleted?.(data);
                break;
              case "product:created":
                eventsRef.current.onProductCreated?.(data);
                break;
              case "product:updated":
                eventsRef.current.onProductUpdated?.(data);
                break;
              case "product:deleted":
                eventsRef.current.onProductDeleted?.(data);
                break;
              case "order:created":
                eventsRef.current.onOrderCreated?.(data);
                break;
              case "order:updated":
                eventsRef.current.onOrderUpdated?.(data);
                break;
              case "settings:updated":
                eventsRef.current.onSettingsUpdated?.(data);
                break;
              default:
                console.log("Unknown WebSocket event:", eventType);
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        socket.onclose = (event) => {
          console.log("WebSocket disconnected:", event.code, event.reason);
          socketRef.current = null;
          
          // Attempt to reconnect after a delay
          if (!reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log("Attempting to reconnect WebSocket...");
              connect();
            }, 3000);
          }
        };

        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
      }
    };

    connect();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []); // Empty dependency array since we use refs for events

  // Return connection status
  return {
    isConnected: socketRef.current?.readyState === WebSocket.OPEN,
  };
}
