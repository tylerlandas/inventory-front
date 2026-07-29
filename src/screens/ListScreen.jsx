import React, { useState, useMemo, useEffect } from 'react';
import {
  IoSearchOutline,
  IoCloseCircle,
  IoSwapVerticalOutline,
  IoCheckmark,
  IoCloudOfflineOutline,
  IoCubeOutline,
} from 'react-icons/io5';
import ItemCard from '../components/ItemCard';
import { useItems } from '../context/ItemsContext';

const SORT_OPTIONS = [
  { key: 'date_desc', label: 'Newest First' },
  { key: 'date_asc', label: 'Oldest First' },
  { key: 'location', label: 'Location A–Z' },
  { key: 'name', label: 'Name A–Z' },
];

export default function ListScreen() {
  const { items, loading, error, refresh, updateItem, removeItem } = useItems();
  const [sortBy, setSortBy] = useState('date_desc');
  const [filterText, setFilterText] = useState('');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayed = useMemo(() => {
    let result = [...items];
    const q = filterText.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (item) => item.location.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'date_asc':
        result.sort((a, b) => new Date(a.scannedAt) - new Date(b.scannedAt));
        break;
      case 'date_desc':
        result.sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt));
        break;
      case 'location':
        result.sort((a, b) => a.location.localeCompare(b.location));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return result;
  }, [items, sortBy, filterText]);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortBy)?.label;

  const totalCount = useMemo(() => displayed.reduce((sum, i) => sum + i.count, 0), [displayed]);

  return (
    <div className="list-screen">
      <div className="filter-bar">
        <div className="search-wrap">
          <IoSearchOutline size={17} />
          <input
            className="search-input"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter by name or location"
          />
          {!!filterText && (
            <button
              onClick={() => setFilterText('')}
              style={{ background: 'none', border: 'none', display: 'flex', color: 'var(--gray-400)' }}
              aria-label="Clear filter"
            >
              <IoCloseCircle size={17} />
            </button>
          )}
        </div>

        <button className="icon-btn" onClick={() => setSortMenuOpen((v) => !v)} aria-label="Sort options">
          <IoSwapVerticalOutline size={19} />
        </button>
      </div>

      {sortMenuOpen && (
        <div className="sort-menu">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`sort-row${sortBy === opt.key ? ' active' : ''}`}
              onClick={() => {
                setSortBy(opt.key);
                setSortMenuOpen(false);
              }}
            >
              <span>{opt.label}</span>
              {sortBy === opt.key && <IoCheckmark size={16} />}
            </button>
          ))}
        </div>
      )}

      <div className="stats-bar">
        <span className="stats-text">
          {displayed.length} item{displayed.length !== 1 ? 's' : ''}
          {totalCount !== displayed.length ? ` (${totalCount} total units)` : ''}
          {filterText ? ' · filtered' : ''}
          {' · '}
          {currentSortLabel}
        </span>
      </div>

      {error ? (
        <div className="center-msg">
          <IoCloudOfflineOutline />
          <p className="error-text">{error}</p>
          <button className="retry-btn" onClick={refresh}>
            Retry
          </button>
        </div>
      ) : loading && items.length === 0 ? (
        <div className="center-msg">
          <div className="spinner" />
          <p className="loading-text">Loading inventory…</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="center-msg">
          <IoCubeOutline />
          <p className="empty-title">{filterText ? 'No matching items' : 'No items yet'}</p>
          <p className="empty-body">
            {filterText ? 'Try a different search term' : 'Switch to Scan Mode to start adding items to your inventory'}
          </p>
        </div>
      ) : (
        <div className="list-content">
          {displayed.map((item) => (
            <ItemCard key={item._id} item={item} onUpdate={updateItem} onDelete={removeItem} />
          ))}
        </div>
      )}
    </div>
  );
}
