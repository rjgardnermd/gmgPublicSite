import React, { createContext, useRef, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

/*
This context provider manages the WebSocket connection to the internal API server. It is analogous to the websocketClient in the Python projects of ibServices. The WebSocketProvider component establishes a WebSocket connection to the specified host and port, and provides the connection state, message sending, and event registration functionality to its children components via the useWebSocket hook.
*/

export const ConnectionStates = Object.freeze({
    DISCONNECTED: "Disconnected",
    CONNECTING: "Connecting",
    CONNECTED: "Connected"
});

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children, host = 'localhost', port = 8765, name = "Frontend" }) => {
    const ws = useRef(null);
    const isConnecting = useRef(false); // Track if we're currently connecting
    const [connectionState, setConnectionState] = useState(ConnectionStates.DISCONNECTED);
    const onMessageHandlers = useRef([]); // Ref to hold the registered handlers for websocket messages
    const onOpenHandlers = useRef([]); // Ref to hold the handlers to call when the websocket opens
    const onCloseHandlers = useRef([]); // Ref to hold the handlers to call when the websocket closes
    const { token } = useAuth();

    useEffect(() => {
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []); // Empty dependency array ensures the connection logic runs once (*except in React strict mode in dev environments, where it runs twice).

    useEffect(() => {
        if (token) {
            connectWebSocket(token);
        }
    }, [token]);

    const connectWebSocket = (token) => {
        if (connectionState !== ConnectionStates.DISCONNECTED || isConnecting.current) {
            // prevent duplicate connections - check state, instance, and connecting flag
            return;
        }
        isConnecting.current = true;
        setConnectionState(ConnectionStates.CONNECTING);
        const uri = `ws://${host}:${port}/ws`;
        const webSocket = new WebSocket(`${uri}?token=${token}`);
        // console.log(`Connecting to WebSocket at ${uri} with token: ${token}`);
        webSocket.onopen = () => {
            setConnectionState(ConnectionStates.CONNECTED);
            isConnecting.current = false; // Reset connecting flag
            console.log(`WebSocket connection established to ${uri}.`);
            ws.current = webSocket;
            onOpenHandlers.current.forEach((handler) => handler()); // Call onOpen handlers
        };

        webSocket.onclose = (event) => {
            setConnectionState(ConnectionStates.DISCONNECTED);
            isConnecting.current = false; // Reset connecting flag
            ws.current = null;

            console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);

            // ✅ If the server rejected the token (e.g., JWT expired), clear it
            if (event.code === 4001 || event.reason.includes("Invalid JWT")) {
                console.warn("JWT is invalid or expired. Logging out.");
                setToken(null);
            } else {
                setTimeout(() => connectWebSocket(token), 5000);
            }

            onCloseHandlers.current.forEach((handler) => handler());
        };


        webSocket.onerror = (error) => {
            console.error("WebSocket error:", error);
            isConnecting.current = false; // Reset connecting flag on error
        };

        webSocket.onmessage = (event) => {
            console.log("WebSocket message received:", event.data);
            const data = JSON.parse(event.data);
            onMessageHandlers.current.forEach((handler) => handler(data)); // Call onMessage handlers
        };
    };

    const sendMsg = (message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            console.log("Sending message to internalApi websocket:", message);
            ws.current.send(message);
        } else {
            console.warn("WebSocket is not open. Message not sent:", message);
        }
    };

    const registerOnMessageHandler = (handler) => {
        onMessageHandlers.current = [...onMessageHandlers.current, handler];
    };

    const registerOnOpenHandler = (handler) => {
        onOpenHandlers.current = [...onOpenHandlers.current, handler];
    };

    const registerOnCloseHandler = (handler) => {
        onCloseHandlers.current = [...onCloseHandlers.current, handler];
    };

    const closeWebSocket = () => {
        if (ws.current) {
            ws.current.close();
            ws.current = null;
            setConnectionState(ConnectionStates.DISCONNECTED);
        }
    };

    return (
        <WebSocketContext.Provider value={{
            connectionState,
            registerOnMessageHandler,
            registerOnOpenHandler,
            registerOnCloseHandler,
            sendMsg,
            connectWebSocket,
            closeWebSocket,
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => React.useContext(WebSocketContext);
