import React, { useState, useEffect } from 'react';

function Popup() {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(['extensionEnabled'], (result) => {
      setIsEnabled(result.extensionEnabled !== false);
    });
  }, []);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    
    chrome.storage.local.set({ extensionEnabled: newState }, () => {
      chrome.tabs.query({}, (tabs) => {
        for (let tab of tabs) {
          try {
            chrome.tabs.sendMessage(tab.id, {
              type: 'EXTENSION_STATE_CHANGED',
              enabled: newState
            }).catch(() => {
              console.log('Tab not ready:', tab.id);
            });
          } catch (error) {
            console.log('Failed to send message to tab:', tab.id);
          }
        }
      });
    });
  };

  return (
    <div style={{
      width: '300px',
      minHeight: '200px',
      backgroundColor: '#0a0a0a',
      color: '#00ff41',
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      <div style={{
        borderBottom: '2px solid #00ff41',
        marginBottom: '20px',
        paddingBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{
          margin: 0,
          color: '#00ff41',
          textShadow: '0 0 10px #00ff41'
        }}>
          AO Extension
        </h2>
        
        {/* 重新设计的开关按钮 */}
        <button
          onClick={handleToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: isEnabled ? '0 0 15px #00ff41' : 'none',
            transform: isEnabled ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 28 28" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transition: 'all 0.3s ease',
              transform: `rotate(${isEnabled ? '0deg' : '180deg'})`,
              opacity: isEnabled ? 1 : 0.5
            }}
          >
            {/* 外圈 */}
            <circle 
              cx="14" 
              cy="14" 
              r="13" 
              stroke={isEnabled ? '#00ff41' : '#666'} 
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            {/* 内圈 */}
            <circle 
              cx="14" 
              cy="14" 
              r="10" 
              stroke={isEnabled ? '#00ff41' : '#666'} 
              strokeWidth="1"
            />
            {/* 电源符号 */}
            <path
              d="M14 8V16M10 10.5C10 8.567 11.567 7 13.5 7h1C16.433 7 18 8.567 18 10.5v7c0 1.933-1.567 3.5-3.5 3.5h-1C11.567 21 10 19.433 10 17.5v-7Z"
              stroke={isEnabled ? '#00ff41' : '#666'}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* 发光效果 */}
            {isEnabled && (
              <>
                <circle 
                  cx="14" 
                  cy="14" 
                  r="13" 
                  stroke="#00ff41" 
                  strokeWidth="0.5" 
                  strokeOpacity="0.5"
                />
                <circle 
                  cx="14" 
                  cy="14" 
                  r="13.5" 
                  stroke="#00ff41" 
                  strokeWidth="0.5" 
                  strokeOpacity="0.2"
                />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* 状态显示 */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        padding: '15px',
        border: '1px solid #00ff41',
        borderRadius: '5px',
        backgroundColor: '#111',
        boxShadow: isEnabled ? '0 0 15px rgba(0, 255, 65, 0.2)' : 'none'
      }}>
        <p style={{ margin: 0 }}>
          Status: <span style={{ color: isEnabled ? '#00ff41' : '#666' }}>
            {isEnabled ? 'ENABLED' : 'DISABLED'}
          </span>
        </p>
      </div>

      {/* 版本信息 */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        fontSize: '12px',
        color: '#666'
      }}>
        v1.0.0
      </div>
    </div>
  );
}

export default Popup; 