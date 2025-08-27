import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import TreeMap from './components/TreeMap';
import './App.css';

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
