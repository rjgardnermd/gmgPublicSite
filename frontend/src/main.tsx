import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.tsx'
import { store } from './store/store'
import { WebSocketProvider } from './providers/WebsocketProvider'
import { AuthProvider } from './providers/AuthProvider'
import { env } from "./config/env";
import { logModel } from "./util/genUtil";

logModel(env, "Environment Variables");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <WebSocketProvider host={env.reporterHost} port={env.reporterPort}>
          <App />
        </WebSocketProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>,
)
