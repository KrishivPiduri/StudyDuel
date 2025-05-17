// WebSocketContext.js
import { createContext, useContext, useRef, useEffect } from "react";

const WEBSOCKET_URL = "wss://0qv6ptdpdh.execute-api.us-east-1.amazonaws.com/production/";
const WebSocketContext = createContext();

export function WebSocketProvider({ children }) {
    const socketRef = useRef(null);
    const roomCodeRef = useRef(null);

    const connect = () => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            socketRef.current = new WebSocket(WEBSOCKET_URL);
        }
    };

    const send = (message) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(message));
        } else {
            console.warn("WebSocket is not open.");
        }
    };

    useEffect(() => {
        return () => {
            socketRef.current?.close();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ socket: socketRef.current, connect, send, socketRef, roomCodeRef }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    return useContext(WebSocketContext);
}
