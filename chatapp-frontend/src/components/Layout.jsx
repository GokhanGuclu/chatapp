import React from 'react';
import CustomTitleBar from './CustomTitleBar';

const Layout = ({ children, title }) => {
  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#0a0a0a'
    }}>
      <CustomTitleBar title={title} />
      <div style={{ 
        flex: 1,
        marginTop: '35px', // Title bar yüksekliği
        position: 'relative'
      }}>
        {children}
      </div>
    </div>
  );
};

export default Layout; 