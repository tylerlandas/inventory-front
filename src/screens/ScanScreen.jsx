import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { IoCameraOutline, IoScanOutline, IoRefreshOutline } from 'react-icons/io5';
import ConfirmModal from '../components/ConfirmModal';
import DuplicateModal from '../components/DuplicateModal';
import FoundItemModal from '../components/FoundItemModal';
import RemoveItemModal from '../components/RemoveItemModal';
import { lookupBarcode, getItemsByBarcode, createItem, updateItemCount } from '../services/api';
import { useItems } from '../context/ItemsContext';
import { useAlert } from '../context/AlertContext';
import { fileToResizedDataUrl } from '../utils/image';

const FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.PDF_417,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.ITF,
];

const hints = new Map();
hints.set(DecodeHintType.POSSIBLE_FORMATS, FORMATS);

export default function ScanScreen() {
  const [permission, setPermission] = useState(null); // null = unknown, true = granted, false = denied
  const [scanning, setScanning] = useState(true);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [duplicateVisible, setDuplicateVisible] = useState(false);
  const [foundActionVisible, setFoundActionVisible] = useState(false);
  const [removePickerVisible, setRemovePickerVisible] = useState(false);

  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [foundProduct, setFoundProduct] = useState(null);
  const [confirmedProduct, setConfirmedProduct] = useState(null);
  const [existingItems, setExistingItems] = useState([]);

  const { addItem, updateItem } = useItems();
  const alert = useAlert();
  const lastScanned = useRef(null);
  const scanningRef = useRef(true);
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  scanningRef.current = scanning;

  const resetToScanning = useCallback(() => {
    setScanning(true);
    setFoundProduct(null);
    setConfirmedProduct(null);
    setExistingItems([]);
    lastScanned.current = null;
  }, []);

  const handleBarcodeScanned = useCallback(async (data) => {
    if (!scanningRef.current || data === lastScanned.current) return;
    lastScanned.current = data;
    setScanning(false);
    setScannedBarcode(data);
    setLookupLoading(true);
    setConfirmVisible(true);

    try {
      const product = await lookupBarcode(data);
      setFoundProduct(product);
    } catch {
      setFoundProduct({ name: '', description: '', imageUrl: null, found: false });
    } finally {
      setLookupLoading(false);
    }
  }, []);

  const handleManualPhoto = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;

      setManualLoading(true);
      try {
        const imageUrl = await fileToResizedDataUrl(file);
        setScannedBarcode(null);
        setFoundProduct({ name: '', description: '', imageUrl, found: false });
        setScanning(false);
        setConfirmVisible(true);
      } catch {
        alert('Error', 'Failed to process photo.');
      } finally {
        setManualLoading(false);
      }
    },
    [alert]
  );

  const openManualAdd = useCallback(() => {
    alert('Add Item', 'Would you like to take a photo or upload a file?', [
      { text: 'Take Photo', onPress: () => cameraInputRef.current?.click() },
      { text: 'Upload File', onPress: () => uploadInputRef.current?.click() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [alert]);

  const startDecoding = useCallback(
    (onDone) => {
      if (!readerRef.current) {
        readerRef.current = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 300 });
      }
      return readerRef.current
        .decodeFromVideoDevice(undefined, videoRef.current, (result) => {
          if (result) handleBarcodeScanned(result.getText());
        })
        .then((controls) => onDone(null, controls))
        .catch((err) => onDone(err, null));
    },
    [handleBarcodeScanned]
  );

  useEffect(() => {
    let cancelled = false;
    startDecoding((err, controls) => {
      if (cancelled) {
        controls?.stop();
        return;
      }
      if (err) {
        setPermission(false);
      } else {
        controlsRef.current = controls;
        setPermission(true);
      }
    });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [startDecoding]);

  const requestPermission = useCallback(() => {
    setPermission(null);
    startDecoding((err, controls) => {
      if (err) {
        setPermission(false);
      } else {
        controlsRef.current = controls;
        setPermission(true);
      }
    });
  }, [startDecoding]);

  const saveNewItem = useCallback(
    async (product) => {
      try {
        const newItem = await createItem({
          barcode: scannedBarcode,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl || null,
          location: product.location,
          count: 1,
        });
        addItem(newItem);
        alert('Item Saved!', `"${product.name}" has been added to your inventory.`, [
          { text: 'OK', onPress: resetToScanning },
        ]);
      } catch {
        alert('Error', 'Failed to save item. Make sure the server is running.');
        resetToScanning();
      }
    },
    [scannedBarcode, addItem, resetToScanning, alert]
  );

  const handleConfirm = useCallback(
    async (product) => {
      setConfirmedProduct(product);
      setConfirmVisible(false);

      if (!scannedBarcode) {
        await saveNewItem(product);
        return;
      }

      try {
        const existing = await getItemsByBarcode(scannedBarcode);
        if (existing.length > 0) {
          setExistingItems(existing);
          setFoundActionVisible(true);
        } else {
          await saveNewItem(product);
        }
      } catch {
        await saveNewItem(product);
      }
    },
    [scannedBarcode, saveNewItem]
  );

  const handleRemoveItem = useCallback(
    async (item) => {
      if (item.count <= 0) return;
      try {
        const updated = await updateItemCount(item._id, -1);
        updateItem(updated);
        setRemovePickerVisible(false);
        alert('Count Updated', `"${item.name}" is now at ${updated.count}.`, [
          { text: 'OK', onPress: resetToScanning },
        ]);
      } catch {
        alert('Error', 'Failed to update count.');
      }
    },
    [updateItem, alert, resetToScanning]
  );

  const handleChooseAdd = useCallback(() => {
    setFoundActionVisible(false);
    setDuplicateVisible(true);
  }, []);

  const handleChooseRemove = useCallback(() => {
    setFoundActionVisible(false);
    if (existingItems.length === 1) {
      handleRemoveItem(existingItems[0]);
    } else {
      setRemovePickerVisible(true);
    }
  }, [existingItems, handleRemoveItem]);

  const handleIncreaseCount = useCallback(
    async (item) => {
      try {
        const updated = await updateItemCount(item._id, 1);
        updateItem(updated);
        setDuplicateVisible(false);
        alert('Count Updated', `"${item.name}" is now at ${updated.count}.`, [
          { text: 'OK', onPress: resetToScanning },
        ]);
      } catch {
        alert('Error', 'Failed to update count.');
      }
    },
    [updateItem, resetToScanning, alert]
  );

  const showPermissionScreen = permission === false;

  return (
    <div className="scan-screen">
      <video ref={videoRef} className="scan-video" muted playsInline />

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleManualPhoto}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        accept="image/*"
        ref={uploadInputRef}
        onChange={handleManualPhoto}
        style={{ display: 'none' }}
      />

      {showPermissionScreen && (
        <div className="perm-screen" style={{ position: 'absolute', inset: 0 }}>
          <IoCameraOutline />
          <p className="perm-title">Camera Access Required</p>
          <p className="perm-body">
            Home Inventory needs access to your camera so it can scan barcodes on your items.
          </p>
          <button className="perm-btn" onClick={requestPermission}>
            Allow Camera Access
          </button>
          <button
            className="btn-outline-blue"
            style={{ marginTop: 14 }}
            onClick={openManualAdd}
            disabled={manualLoading}
          >
            {manualLoading ? 'Processing…' : 'Add Item Without Barcode'}
          </button>
        </div>
      )}

      {!showPermissionScreen && (
        <div className="scan-overlay">
          <div className="scan-badge-wrap">
            {lookupLoading ? (
              <div className="scan-badge blue">
                <div className="spinner small" />
                <span>Looking up item…</span>
              </div>
            ) : scanning ? (
              <div className="scan-badge">
                <IoScanOutline size={16} />
                <span>Point camera at a barcode</span>
              </div>
            ) : null}
          </div>

          <div className="scan-frame">
            <div className="scan-corner tl" />
            <div className="scan-corner tr" />
            <div className="scan-corner bl" />
            <div className="scan-corner br" />
          </div>

          {scanning && !confirmVisible && !duplicateVisible && (
            <button
              className="manual-add-btn"
              onClick={openManualAdd}
              disabled={manualLoading}
            >
              <IoCameraOutline size={18} />
              <span>{manualLoading ? 'Processing…' : 'Add Without Barcode'}</span>
            </button>
          )}

          {!scanning &&
            !confirmVisible &&
            !duplicateVisible &&
            !foundActionVisible &&
            !removePickerVisible && (
              <button className="scan-again-btn" onClick={resetToScanning}>
                <IoRefreshOutline size={18} />
                <span>Scan Again</span>
              </button>
            )}
        </div>
      )}

      <ConfirmModal
        visible={confirmVisible}
        product={foundProduct}
        loading={lookupLoading}
        manual={!scannedBarcode}
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmVisible(false);
          resetToScanning();
        }}
      />

      <FoundItemModal
        visible={foundActionVisible}
        existingItems={existingItems}
        onAdd={handleChooseAdd}
        onRemove={handleChooseRemove}
        onCancel={() => {
          setFoundActionVisible(false);
          resetToScanning();
        }}
      />

      <RemoveItemModal
        visible={removePickerVisible}
        existingItems={existingItems}
        onRemove={handleRemoveItem}
        onCancel={() => {
          setRemovePickerVisible(false);
          resetToScanning();
        }}
      />

      <DuplicateModal
        visible={duplicateVisible}
        existingItems={existingItems}
        onIncreaseCount={handleIncreaseCount}
        onAddNew={() => {
          setDuplicateVisible(false);
          saveNewItem(confirmedProduct);
        }}
        onCancel={() => {
          setDuplicateVisible(false);
          resetToScanning();
        }}
      />
    </div>
  );
}
