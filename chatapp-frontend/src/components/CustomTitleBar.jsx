import React from 'react';
import { HiMinus } from "react-icons/hi";
import { MdOutlineCropSquare } from "react-icons/md";
import { IoClose } from "react-icons/io5";

const CustomTitleBar = ({ title }) => {
  if (!(window.electron && window.electron.isElectron)) return null;

  return (
    <div
      style={{
        height: '35px',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        WebkitAppRegion: 'drag', // Pencereyi sürüklemek için
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottom: '1px solid #333'
      }}
    >
      <div style={{ 
        color: '#ffffff', 
        fontSize: '14px',
        fontWeight: 500,
        letterSpacing: '0.3px'
      }}>
        {title}
      </div>
      
      {/* Pencere kontrol butonları */}
      <div style={{ 
        position: 'absolute', 
        right: 0, 
        WebkitAppRegion: 'no-drag',
        display: 'flex',
        height: '100%'
      }}>
        <button
          onClick={() => window.electron.minimize()}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#ffffff',
            padding: '8px 12px',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#333'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <HiMinus size={18} />
        </button>
        <button
          onClick={() => window.electron.maximize()}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#ffffff',
            padding: '8px 12px',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#333'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <MdOutlineCropSquare size={16} />
        </button>
        <button
          onClick={() => window.electron.close()}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#ffffff',
            padding: '8px 12px',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#e81123'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <IoClose size={18} />
        </button>
      </div>
    </div>
  );
};

export default CustomTitleBar; 