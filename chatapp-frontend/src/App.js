import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={
            showRegister ? (
              <Register onSwitchToLogin={() => setShowRegister(false)} />
            ) : (
              <Login 
                onLogin={(userData) => {
                  localStorage.setItem("user", JSON.stringify(userData));
                  setUser(userData);
                }} 
                onSwitchToRegister={() => setShowRegister(true)} 
              />
            )
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} onLogout={() => {
          localStorage.removeItem("user");
          setUser(null);
        }} />} />
        <Route path="/settings" element={<Settings user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
