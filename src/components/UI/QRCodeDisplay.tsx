import React, { useState } from 'react';
import QRCodeSVG from 'react-qr-code';
import { motion } from 'framer-motion';
import { useToast } from './Toast';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  showDownload?: boolean;
  className?: string;
  title?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 200,
  showDownload = false,
  className = '',
  title = 'QR Code',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Responsive size calculation
  const getResponsiveSize = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      return isMobile ? Math.min(size * 0.8, 180) : size;
    }
    return size;
  };

  const responsiveSize = getResponsiveSize();

  const downloadQRCode = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Create a canvas element to convert SVG to image
      const svg = document.querySelector(`#qr-code-${value.replace(/[^a-zA-Z0-9]/g, '')}`) as SVGElement;
      if (!svg) {
        throw new Error('QR Code not found');
      }

      // Create a canvas and draw the SVG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        canvas.width = responsiveSize;
        canvas.height = responsiveSize;
        
        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the QR code
        ctx.drawImage(img, 0, 0, responsiveSize, responsiveSize);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `mulik-qr-code-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showToast('QR Code downloaded!', 'success');
          }
        }, 'image/png');

        URL.revokeObjectURL(svgUrl);
        setIsLoading(false);
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        setIsLoading(false);
        throw new Error('Failed to load QR code image');
      };

      img.src = svgUrl;

    } catch (error) {
      console.error('Failed to download QR code:', error);
      showToast('Failed to download QR code', 'error');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className={`flex flex-col items-center space-y-4 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* QR Code Container */}
      <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-100">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <QRCodeSVG
            id={`qr-code-${value.replace(/[^a-zA-Z0-9]/g, '')}`}
            value={value}
            size={responsiveSize}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            title={title}
          />
        </motion.div>
      </div>

      {/* Download Button */}
      {showDownload && (
        <motion.button
          onClick={downloadQRCode}
          disabled={isLoading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            bg-gray-100 hover:bg-gray-200 text-gray-700
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-mulik-primary-500 focus:ring-offset-2
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
          `}
          whileHover={isLoading ? {} : { scale: 1.05 }}
          whileTap={isLoading ? {} : { scale: 0.95 }}
          aria-label="Download QR Code"
        >
          {isLoading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              ⏳
            </motion.span>
          ) : (
            '📥'
          )}
          <span>{isLoading ? 'Downloading...' : 'Download'}</span>
        </motion.button>
      )}

      {/* QR Code Info */}
      <div className="text-center text-sm text-gray-600 max-w-xs">
        <p>Scan this QR code to join the game</p>
        <p className="text-xs mt-1 break-all">{value}</p>
      </div>
    </motion.div>
  );
};

export default QRCodeDisplay;
