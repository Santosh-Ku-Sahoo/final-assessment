import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, StopCircle } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [error, setError] = useState(null);

  const scannerId = "qr-reader-container";
  const html5QrcodeRef = useRef(null);


  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          setSelectedCameraId(devices[0].id);
        } else {
          setError("No camera devices found.");
        }
      })
      .catch((err) => {
        console.error("Error fetching cameras:", err);
        setError("Camera permission denied or camera unavailable.");
      });

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCameraId) return;
    setError(null);

    try {
      const html5Qrcode = new Html5Qrcode(scannerId);
      html5QrcodeRef.current = html5Qrcode;

      await html5Qrcode.start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {

          onScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {

          if (onScanError) onScanError(errorMessage);
        }
      );

      setScanning(true);
    } catch (err) {
      console.error("Failed to start scanning:", err);
      setError("Failed to start camera scan: " + err.message);
    }
  };

  const stopScanning = async () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setScanning(false);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>

      {cameras.length > 0 && !scanning && (
        <div style={{ width: '100%', maxWidth: '400px' }} className="form-group">
          <label className="form-label">Select Scanning Camera</label>
          <select
            value={selectedCameraId}
            onChange={(e) => setSelectedCameraId(e.target.value)}
            className="form-control"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {}
      <div
        id={scannerId}
        style={{
          width: '100%',
          maxWidth: '400px',
          aspectRatio: '1/1',
          background: 'var(--bg-secondary)',
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          overflow: 'hidden',
          display: scanning ? 'block' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {!scanning && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '50%', color: 'var(--color-primary)', display: 'inline-block', marginBottom: '10px' }}>
              <Camera size={32} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Scanner Ready</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Click Start to scan visitor pass QR</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '400px' }}>
        {scanning ? (
          <button
            type="button"
            onClick={stopScanning}
            className="btn btn-danger"
            style={{ width: '100%' }}
          >
            <StopCircle size={18} /> Stop Scanner
          </button>
        ) : (
          <button
            type="button"
            onClick={startScanning}
            disabled={!selectedCameraId}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            <Camera size={18} /> Start Scanner
          </button>
        )}
      </div>

      {error && (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default QRScanner;
