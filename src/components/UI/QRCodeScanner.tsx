import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScan,
  onError,
  onClose,
  isOpen
}) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera
      });
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      setError(null);

      // Get available video devices
      const videoDevices = await navigator.mediaDevices.enumerateDevices();
      const cameras = videoDevices.filter(device => device.kind === 'videoinput');
      setDevices(cameras);

      // Select back camera if available, otherwise first camera
      const backCamera = cameras.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      const deviceId = backCamera?.deviceId || cameras[0]?.deviceId;
      
      if (deviceId) {
        setSelectedDeviceId(deviceId);
        startScanning(deviceId);
      }

    } catch (err) {
      console.error('Camera permission denied:', err);
      setHasPermission(false);
      setError('Camera access denied. Please allow camera permissions and try again.');
      onError?.('Camera access denied');
    }
  };

  const startScanning = async (deviceId: string) => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      setError(null);

      // Initialize code reader
      codeReader.current = new BrowserMultiFormatReader();

      // Start decoding from video device
      await codeReader.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedText = result.getText();
            console.log('QR Code scanned:', scannedText);
            
            // Extract room code from URL or use direct code
            let roomCode = scannedText;
            
            // If it's a URL, extract the room code
            if (scannedText.includes('/join?code=')) {
              const urlParams = new URLSearchParams(scannedText.split('?')[1]);
              roomCode = urlParams.get('code') || scannedText;
            } else if (scannedText.includes('/join/')) {
              roomCode = scannedText.split('/join/')[1] || scannedText;
            }
            
            onScan(roomCode);
            stopScanning();
          }
          
          if (error && !(error instanceof NotFoundException)) {
            console.error('QR scanning error:', error);
            setError('Error scanning QR code. Please try again.');
          }
        }
      );

    } catch (err) {
      console.error('Failed to start scanning:', err);
      setError('Failed to start camera. Please check your camera permissions.');
      setIsScanning(false);
      onError?.('Failed to start camera');
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
      codeReader.current = null;
    }
    setIsScanning(false);
  };

  const switchCamera = async () => {
    if (devices.length <= 1) return;

    const currentIndex = devices.findIndex(device => device.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDeviceId = devices[nextIndex].deviceId;

    stopScanning();
    setSelectedDeviceId(nextDeviceId);
    await startScanning(nextDeviceId);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              📱 {t('scanner.title', 'Scan QR Code')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close scanner"
            >
              ✕
            </button>
          </div>

          {/* Camera Permission Check */}
          {hasPermission === null && (
            <div className="text-center py-8">
              <div className="animate-spin text-4xl mb-4">📷</div>
              <p className="text-gray-600">
                {t('scanner.requesting', 'Requesting camera access...')}
              </p>
            </div>
          )}

          {/* Permission Denied */}
          {hasPermission === false && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🚫</div>
              <p className="text-red-600 mb-4">
                {t('scanner.permissionDenied', 'Camera access denied')}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                {t('scanner.permissionHelp', 'Please allow camera access in your browser settings and try again.')}
              </p>
              <button
                onClick={initializeScanner}
                className="mulik-button-primary"
              >
                {t('scanner.retry', 'Try Again')}
              </button>
            </div>
          )}

          {/* Scanner Interface */}
          {hasPermission === true && (
            <div className="space-y-4">
              {/* Video Preview */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                
                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-white border-dashed rounded-lg w-48 h-48 flex items-center justify-center">
                    <motion.div
                      animate={{ 
                        y: [-20, 20, -20],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-full h-0.5 bg-red-500"
                    />
                  </div>
                </div>

                {/* Camera Switch Button */}
                {devices.length > 1 && (
                  <button
                    onClick={switchCamera}
                    className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    aria-label="Switch camera"
                  >
                    🔄
                  </button>
                )}
              </div>

              {/* Instructions */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  {isScanning 
                    ? t('scanner.scanning', 'Point your camera at a QR code')
                    : t('scanner.starting', 'Starting camera...')
                  }
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Manual Input Option */}
              <div className="border-t pt-4">
                <p className="text-center text-sm text-gray-500 mb-3">
                  {t('scanner.manualOption', 'Having trouble? Enter room code manually')}
                </p>
                <button
                  onClick={() => {
                    onClose();
                    // You can add navigation to manual input here
                  }}
                  className="w-full mulik-button-secondary"
                >
                  {t('scanner.enterManually', 'Enter Code Manually')}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRCodeScanner;
