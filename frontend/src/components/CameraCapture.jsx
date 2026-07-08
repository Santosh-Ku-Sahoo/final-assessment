import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check } from 'lucide-react';

const CameraCapture = ({ onPhotoCaptured, initialPhoto = null }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(initialPhoto);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialPhoto) {
      setPhotoPreview(initialPhoto);
      setHasPhoto(true);
    }
  }, [initialPhoto]);

  const startCamera = async () => {
    setError(null);
    setPhotoPreview(null);
    setHasPhoto(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please make sure camera permissions are allowed.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current) {
      const width = videoRef.current.videoWidth || 640;
      const height = videoRef.current.videoHeight || 480;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {

        ctx.drawImage(videoRef.current, 0, 0, width, height);


        const photoData = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoPreview(photoData);
        setHasPhoto(true);
        onPhotoCaptured(photoData);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setHasPhoto(false);
    setPhotoPreview(null);
    onPhotoCaptured('');
    startCamera();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%' }}>
      {photoPreview && hasPhoto ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
          <img src={photoPreview} alt="Captured visitor" className="captured-preview" />
          <button type="button" onClick={retakePhoto} className="btn btn-secondary" style={{ width: '100%', maxWidth: '240px' }}>
            <RefreshCw size={16} /> Retake Photo
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          {cameraActive ? (
            <div className="webcam-container">
              <video ref={videoRef} autoPlay playsInline muted className="webcam-video" />
              <button
                type="button"
                onClick={capturePhoto}
                className="btn btn-primary webcam-capture-btn"
                style={{ borderRadius: '50%', width: '56px', height: '56px', padding: 0 }}
              >
                <Camera size={24} />
              </button>
            </div>
          ) : (
            <div
              onClick={startCamera}
              style={{
                width: '100%',
                maxWidth: '480px',
                aspectRatio: '4/3',
                background: 'var(--bg-secondary)',
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                gap: '12px',
                transition: 'border-color 0.2s',
                padding: '20px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            >
              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '50%', color: 'var(--color-primary)' }}>
                <Camera size={28} />
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Take Profile Photo</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click to activate your webcam</span>
            </div>
          )}

          {error && (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.9rem', textAlign: 'center', marginTop: '5px' }}>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
