import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import TreeMap from './components/TreeMap';
import { useWebSocket } from './providers/WebsocketProvider';
import { useAuth } from './providers/AuthProvider';
import { useAppDispatch } from './store/hooks';
import { setSuccess } from './store/slices/tagHierarchySlice';
import { setSuccess as setTwrSuccess } from './store/slices/twrUpdateSlice';
import { ConsumerChannels } from './constants/channels';
import { SubscriptionDto, SubscriptionAction } from './models/SubscriptionDto';
import './App.css';

// TODO: change the jwt_secret so this hard-coded token doesn't work for the main trading app!!!
function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

function App() {
  const dispatch = useAppDispatch();
  const { connectionState, registerOnMessageHandler, registerOnOpenHandler, sendMsg } = useWebSocket();
  const { token, setToken } = useAuth();
  const hasRegisteredHandlers = useRef(false);

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

      // Subscribe to TwrUpdate channel
      const subscriptionMessage = new SubscriptionDto(
        SubscriptionAction.SUBSCRIBE,
        [ConsumerChannels.TwrUpdate]
      );

      console.log("Sending subscription message:", subscriptionMessage.toStr());
      sendMsg(subscriptionMessage.toStr());
    };

    const onWebSocketMessage = (jsonObj) => {
      console.log("WebSocket message received:", jsonObj);

      // Handle tag hierarchy updates
      if (jsonObj.type === "tag_hierarchy_update" || jsonObj.channel === "tag_hierarchy") {
        console.log("Tag hierarchy update received:", jsonObj);
        const updatedData = jsonObj.data || jsonObj.message;
        dispatch(setSuccess(updatedData));
      }

      // Handle TwrUpdate messages
      if (jsonObj.channel === ConsumerChannels.TwrUpdate) {
        console.log("TwrUpdate received:", jsonObj);
        dispatch(setTwrSuccess(jsonObj.message));
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
        {/* <nav style={{ padding: '20px', backgroundColor: '#f5f5f5', marginBottom: '20px' }}>
          <Link to="/" style={{ marginRight: '20px', textDecoration: 'none', color: '#333' }}>
            Home
          </Link>
          <Link to="/treemap" style={{ textDecoration: 'none', color: '#333' }}>
            TreeMap
          </Link>
          {connectionState !== ConnectionStates.CONNECTED && (
            <span style={{ marginLeft: '20px', color: '#f44336' }}>
              WebSocket: {connectionState}
            </span>
          )}
        </nav> */}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/treemap" element={<TreeMap />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
