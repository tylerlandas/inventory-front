import React, { useState, useEffect } from 'react';
import { getLocations } from '../services/api';

export default function ConfirmModal({ visible, product, loading, manual, onConfirm, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setLocation('');
    }
  }, [product]);

  useEffect(() => {
    if (visible) {
      getLocations()
        .then(setLocationSuggestions)
        .catch(() => {});
    }
  }, [visible]);

  if (!visible) return null;

  const handleConfirm = () => {
    if (!name.trim() || !location.trim()) return;
    onConfirm({
      ...product,
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet">
        <div className="modal-handle" />
        <p className="modal-title">
          {loading
            ? 'Looking Up Item…'
            : manual
            ? 'Add Item'
            : product?.found === false
            ? 'Item Not Found — Enter Details'
            : 'Confirm Item'}
        </p>

        {loading ? (
          <div className="loader-wrap">
            <div className="spinner" />
          </div>
        ) : (
          <>
            {product?.imageUrl ? <img className="modal-image" src={product.imageUrl} alt="" /> : null}

            <label className="field-label">Item Name *</label>
            <input
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
            />

            <label className="field-label">Description</label>
            <textarea
              className="field-input field-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
            />

            <label className="field-label">Location *</label>
            <input
              className="field-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Pantry, Kitchen Cabinet, Basement"
            />

            {locationSuggestions.length > 0 && (
              <>
                <p className="suggest-label">Previous locations — tap to reuse:</p>
                <div className="chips">
                  {locationSuggestions.map((loc) => (
                    <button key={loc} className="chip" onClick={() => setLocation(loc)}>
                      {loc}
                    </button>
                  ))}
                </div>
              </>
            )}

            {!manual && product?.found !== false && (
              <p className="field-hint">Edit the details above if anything looks wrong, then tap Confirm.</p>
            )}
          </>
        )}

        <div className="btn-row">
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!name.trim() || !location.trim() || loading}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
