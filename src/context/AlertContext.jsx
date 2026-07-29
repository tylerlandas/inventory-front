import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alertState, setAlertState] = useState(null);

  const alert = useCallback((title, message, buttons = [{ text: 'OK' }]) => {
    setAlertState({ title, message, buttons });
  }, []);

  const handlePress = (btn) => {
    setAlertState(null);
    btn.onPress?.();
  };

  return (
    <AlertContext.Provider value={alert}>
      {children}
      {alertState && (
        <div className="modal-backdrop center">
          <div className="alert-card">
            <p className="alert-title">{alertState.title}</p>
            {alertState.message && <p className="alert-message">{alertState.message}</p>}
            <div className="alert-buttons">
              {alertState.buttons.map((btn, i) => (
                <button
                  key={i}
                  className={btn.style === 'destructive' ? 'destructive' : btn.style === 'cancel' ? '' : 'primary'}
                  onClick={() => handlePress(btn)}
                >
                  {btn.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);
