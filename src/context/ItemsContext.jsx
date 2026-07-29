import React, { createContext, useContext, useState, useCallback } from 'react';
import { getItems } from '../services/api';

const ItemsContext = createContext(null);

export function ItemsProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItems();
      setItems(data);
    } catch {
      setError('Could not load items. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback((item) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const updateItem = useCallback((updated) => {
    setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  return (
    <ItemsContext.Provider value={{ items, loading, error, refresh, addItem, updateItem, removeItem }}>
      {children}
    </ItemsContext.Provider>
  );
}

export const useItems = () => useContext(ItemsContext);
