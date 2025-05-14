import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Register = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleRegister = () => {
    if (!username || !email || !password) {
      alert("Kullanıcı adı, e-posta ve şifre boş olamaz.");
      return;
    }

    axios.post('http://127.0.0.5:5000/user/register',
      { username, email, password },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
      .then(response => {
        alert("Kayıt başarılı! Giriş yapabilirsiniz.");
        onSwitchToLogin(); // Kayıttan sonra giriş ekranına yönlendirme
      })
      .catch(error => {
        console.error("Kayıt hatası:", error);
        alert("Kayıt başarısız. Kullanıcı adı veya e-posta alınmış olabilir.");
      });
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #2c4a6e, #1e3a5f)',
    }}>
      <div style={{
        backgroundColor: '#334d6e',
        padding: '40px',
        borderRadius: '14px',
        boxShadow: '0 0 40px rgba(28, 48, 74, 0.6)',
        width: '380px',
        textAlign: 'center',
        border: '1px solid #445d7e',
        transform: visible ? 'scale(1)' : 'scale(0.8)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.5s ease'
      }}>
        <h2 style={{ 
          marginBottom: '25px', 
          color: '#eee', 
          letterSpacing: '1px',
          fontWeight: 500
        }}>Kayıt Ol</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            onClick={handleRegister}
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
            Kayıt Ol
          </button>
        </div>

        <p style={{ color: '#888', marginTop: '20px' }}>
          Zaten bir hesabınız var mı?{" "}
          <span 
            onClick={onSwitchToLogin} 
            style={{ color: '#00c6ff', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Giriş Yap
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
