import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import TreeMap from './components/TreeMap';
import { useWebSocket } from './providers/WebsocketProvider';
import { useAuth } from './providers/AuthProvider';
import { useAppDispatch } from './store/hooks';
import { setSuccess } from './store/slices/tagHierarchySlice';
import { setSuccess as setTwrSuccess } from './store/slices/twrUpdateSlice';
import { ConsumerChannels } from './constants/channels';
import { SubscriptionDto, SubscriptionAction } from './models/SubscriptionDto';
import { useInitialData } from './hooks/useInitialData';
import './App.css';

// TODO: change the jwt_secret so this hard-coded token doesn't work for the main trading app!!!

function App() {
  const dispatch = useAppDispatch();
  const { connectionState, registerOnMessageHandler, registerOnOpenHandler, sendMsg } = useWebSocket();
  const { token, setToken } = useAuth();
  const hasRegisteredHandlers = useRef(false);

  // Fetch initial data
  useInitialData();

  // Set the hardcoded token on app load
  useEffect(() => {
    if (!token) {
      const hardcodedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXIiLCJleHAiOjE5MzYzOTUxODh9.oj57qhPOKDT3TAnUPBq5disvYpj9qK_Z4_GgO3oSsos';
      setToken(hardcodedToken);
    }
  }, [token, setToken]);

  // WebSocket message handling
  useEffect(() => {
    const onWebSocketOpen = () => {
      console.log("WebSocket connected, subscribing to channels...");

      // Subscribe to TwrUpdate and PortfolioUpdate channels
      const subscriptionMessage = new SubscriptionDto(
        SubscriptionAction.SUBSCRIBE,
        [ConsumerChannels.TwrUpdate, ConsumerChannels.PortfolioUpdate]
      );

      console.log("Sending subscription message:", subscriptionMessage.toStr());
      sendMsg(subscriptionMessage.toStr());
    };

    const onWebSocketMessage = (jsonObj) => {
      console.log("WebSocket message received:", jsonObj);

      // Handle TwrUpdate messages
      if (jsonObj.channel === ConsumerChannels.TwrUpdate) {
        console.log("TwrUpdate received:", jsonObj);
        dispatch(setTwrSuccess(jsonObj.message));
      }

      // Handle PortfolioUpdate messages
      if (jsonObj.channel === ConsumerChannels.PortfolioUpdate) {
        console.log("PortfolioUpdate received:", jsonObj);
        dispatch(setSuccess(jsonObj.message));
      }
    };

    if (!hasRegisteredHandlers.current) {
      console.log("Registering WebSocket handlers in App...");
      hasRegisteredHandlers.current = true;
      registerOnOpenHandler(onWebSocketOpen);
      registerOnMessageHandler(onWebSocketMessage);
    }
  }, [registerOnMessageHandler, registerOnOpenHandler, sendMsg, dispatch]);

  // Log connection state changes
  useEffect(() => {
    console.log("WebSocket connection state:", connectionState);
  }, [connectionState]);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<TreeMap />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
