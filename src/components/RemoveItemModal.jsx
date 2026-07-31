import React from 'react';

export default function RemoveItemModal({ visible, existingItems, onRemove, onCancel }) {
  if (!visible || !existingItems?.length) return null;

  return (
    <div className="modal-backdrop center">
      <div className="modal-card">
        <p className="modal-title">Decrease Which Item?</p>
        <p className="modal-body-text">Tap the item to decrease its count by one:</p>

        <div className="dup-list">
          {existingItems.map((item) => (
            <button
              key={item._id}
              className="dup-row"
              onClick={() => onRemove(item)}
              disabled={item.count <= 0}
            >
              <div className="dup-name">{item.name}</div>
              <div className="dup-meta">
                {item.location} • Count: {item.count}
              </div>
              <div className="dup-action">Tap to decrease count →</div>
            </button>
          ))}
        </div>

        <button className="cancel-link-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
