import React from 'react';

export default function DuplicateModal({ visible, existingItems, onIncreaseCount, onAddNew, onCancel }) {
  if (!visible || !existingItems?.length) return null;

  const single = existingItems.length === 1 ? existingItems[0] : null;

  return (
    <div className="modal-backdrop center">
      <div className="modal-card">
        <p className="modal-title">Already In Inventory</p>

        {single ? (
          <>
            <p className="modal-body-text">
              <strong>{single.name}</strong> already exists in your inventory.
            </p>
            <div className="info-box">
              <span className="info-text">Location: {single.location}</span>
              <span className="info-text">Current count: {single.count}</span>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginBottom: 10 }} onClick={() => onIncreaseCount(single)}>
              Increase Count → {single.count + 1}
            </button>
          </>
        ) : (
          <>
            <p className="modal-body-text">
              Found {existingItems.length} matching items. Tap one to increase its count:
            </p>
            <div className="dup-list">
              {existingItems.map((item) => (
                <button key={item._id} className="dup-row" onClick={() => onIncreaseCount(item)}>
                  <div className="dup-name">{item.name}</div>
                  <div className="dup-meta">
                    {item.location} • Count: {item.count}
                  </div>
                  <div className="dup-action">Tap to increase →</div>
                </button>
              ))}
            </div>
          </>
        )}

        <button className="btn-outline-blue" style={{ width: '100%', marginBottom: 10 }} onClick={onAddNew}>
          Add as New Item Instead
        </button>

        <button className="cancel-link-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
