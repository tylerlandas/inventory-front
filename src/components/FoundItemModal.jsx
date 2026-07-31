import React from 'react';

export default function FoundItemModal({ visible, existingItems, onAdd, onRemove, onCancel }) {
  if (!visible || !existingItems?.length) return null;

  const single = existingItems.length === 1 ? existingItems[0] : null;

  return (
    <div className="modal-backdrop center">
      <div className="modal-card">
        <p className="modal-title">Item Already In Inventory</p>

        {single ? (
          <>
            <p className="modal-body-text">
              <strong>{single.name}</strong> is already in your inventory.
            </p>
            <div className="info-box">
              <span className="info-text">Location: {single.location}</span>
              <span className="info-text">Current count: {single.count}</span>
            </div>
          </>
        ) : (
          <p className="modal-body-text">
            Found {existingItems.length} matching items in your inventory.
          </p>
        )}

        <p className="modal-body-text">Would you like to add another one, or remove one?</p>

        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 10 }} onClick={onAdd}>
          Add Item
        </button>
        <button className="btn-outline-red" style={{ width: '100%', marginBottom: 10 }} onClick={onRemove}>
          Remove One
        </button>

        <button className="cancel-link-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
