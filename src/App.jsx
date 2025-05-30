import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Session from './pages/Session';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/session/:sessionId" element={<Session />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 