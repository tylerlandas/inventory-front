import React, { useState } from 'react';
import { IoCubeOutline, IoLocationOutline, IoCalendarOutline, IoTrashOutline, IoPencilOutline } from 'react-icons/io5';
import { updateItemCount, updateItemDetails, deleteItem } from '../services/api';
import { useAlert } from '../context/AlertContext';
import EditItemModal from './EditItemModal';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ItemCard({ item, onUpdate, onDelete }) {
  const alert = useAlert();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCountChange = async (delta) => {
    if (item.count + delta < 0) return;
    try {
      const updated = await updateItemCount(item._id, delta);
      onUpdate(updated);
    } catch {
      alert('Error', 'Failed to update count.');
    }
  };

  const handleDelete = () => {
    alert('Remove Item', `Remove "${item.name}" from your inventory?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteItem(item._id);
            onDelete(item._id);
          } catch {
            alert('Error', 'Failed to delete item.');
          }
        },
      },
    ]);
  };

  const handleSaveDetails = async ({ name, description }) => {
    setSaving(true);
    try {
      const updated = await updateItemDetails(item._id, { name, description });
      onUpdate(updated);
      setEditing(false);
    } catch {
      alert('Error', 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="item-card">
      <div className="item-top-row">
        {item.imageUrl ? (
          <img className="item-image" src={item.imageUrl} alt="" />
        ) : (
          <div className="item-image-placeholder">
            <IoCubeOutline />
          </div>
        )}

        <div className="item-info">
          <p className="item-name">{item.name}</p>
          {!!item.description && <p className="item-description">{item.description}</p>}
          <div className="item-meta">
            <IoLocationOutline size={13} />
            <span>{item.location}</span>
          </div>
          <div className="item-meta date">
            <IoCalendarOutline size={13} />
            <span>{formatDate(item.scannedAt)}</span>
          </div>
        </div>

        <div className="item-actions">
          <button className="item-edit-btn" onClick={() => setEditing(true)} aria-label="Edit item">
            <IoPencilOutline />
          </button>
          <button className="item-delete-btn" onClick={handleDelete} aria-label="Remove item">
            <IoTrashOutline />
          </button>
        </div>
      </div>

      <div className="item-count-row">
        <span className="item-count-label">Qty</span>
        <div className="counter">
          <button
            className="count-btn"
            onClick={() => handleCountChange(-1)}
            disabled={item.count <= 0}
          >
            −
          </button>
          <span className="count-value">{item.count}</span>
          <button className="count-btn" onClick={() => handleCountChange(1)}>
            +
          </button>
        </div>
      </div>

      <EditItemModal
        visible={editing}
        item={item}
        saving={saving}
        onSave={handleSaveDetails}
        onCancel={() => setEditing(false)}
      />
    </div>
  );
}
