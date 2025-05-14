import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleLogin = () => {
    if (!email || !password) {
      alert("E-posta ve şifre boş olamaz.");
      return;
    }

    axios.post('http://127.0.0.5:5000/user/login',
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
      .then(response => {
        const userId = response.data.user_id; 
        const username = response.data.username;
        
        localStorage.setItem("userId", userId);
        localStorage.setItem("username", username);
        

        alert("Giriş başarılı!");
        onLogin(username);
      })
      .catch(error => {
        console.error("Giriş hatası:", error);
        alert("Giriş başarısız. Bilgilerinizi kontrol edin.");
      });
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #2c1810, #3d2318)',
    }}>
      <div style={{
        backgroundColor: '#2c1810',
        padding: '40px',
        borderRadius: '14px',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.6)',
        width: '380px',
        textAlign: 'center',
        border: '1px solid #2c2c2c',
        transform: visible ? 'scale(1)' : 'scale(0.8)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.5s ease'
      }}>
        <h2 style={{ 
          marginBottom: '25px', 
          color: '#eee', 
          letterSpacing: '1px',
          fontWeight: 500
        }}>Uygulama Girişi</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            type="text"
            placeholder="E-Posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '94%',
              padding: '10px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '2px solid #444',
              color: '#ccc',
              fontSize: '15px',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderBottom = '2px solid #0072ff'}
            onBlur={(e) => e.target.style.borderBottom = '2px solid #444'}
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '94%',
              padding: '10px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '2px solid #444',
              color: '#ccc',
              fontSize: '15px',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderBottom = '2px solid #0072ff'}
            onBlur={(e) => e.target.style.borderBottom = '2px solid #444'}
          />
          <button 
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 114, 255, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 14px rgba(0, 114, 255, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 114, 255, 0.4)';
            }}
          >
            Giriş Yap
          </button>
        </div>

        <p style={{ color: '#888', marginTop: '20px' }}>
          Hesabınız yok mu?{" "}
          <span 
            onClick={onSwitchToRegister} 
            style={{ color: '#00c6ff', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Kayıt Ol
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
