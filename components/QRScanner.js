'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, AlertCircle, Info } from 'lucide-react';

export default function QRScanner({ onScan, onError, onClose }) {
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const qrcodeRegionId = `html5qr-code-${Date.now()}`;

  useEffect(() => {
    let html5QrcodeScanner = null;
    let mounted = true;

    const initScanner = async () => {
      try {
        setIsScanning(true);
        
        const { Html5QrcodeScanner } = await import('html5-qrcode');

        if (!mounted) return;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          disableFlip: false,
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          aspectRatio: 1.0
        };

        html5QrcodeScanner = new Html5QrcodeScanner(
          qrcodeRegionId,
          config,
          false
        );

        scannerRef.current = html5QrcodeScanner;

        const qrCodeSuccessCallback = (decodedText) => {
          console.log('QR Code scanned:', decodedText);
          
          if (scannerRef.current && mounted) {
            scannerRef.current.clear().then(() => {
              scannerRef.current = null;
              
              try {
                const data = JSON.parse(decodedText);
                onScan(data);
              } catch (e) {
                onScan({ ticketId: decodedText });
              }
            }).catch(error => {
              console.error("Failed to clear scanner:", error);
              scannerRef.current = null;
            });
          }
        };

        const qrCodeErrorCallback = (errorMessage) => {
          if (!errorMessage.includes('NotFoundException')) {
            console.log('QR Scan error:', errorMessage);
          }
        };

        html5QrcodeScanner.render(qrCodeSuccessCallback, qrCodeErrorCallback);
        
        if (mounted) {
          setIsInitialized(true);
          setIsScanning(false);
        }
      } catch (error) {
        console.error('Failed to initialize scanner:', error);
        if (mounted) {
          setError('Failed to access camera. Please check permissions or upload an image instead.');
          setIsScanning(false);
        }
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Cleanup error:", error);
        }).finally(() => {
          scannerRef.current = null;
        });
      }
    };
  }, [qrcodeRegionId, onScan]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsScanning(true);
      setError('');

      const { Html5Qrcode } = await import('html5-qrcode');
      
      // Create a temporary element for file scanning
      const tempId = `temp-qr-scan-${Date.now()}`;
      const tempDiv = document.createElement('div');
      tempDiv.id = tempId;
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      const html5QrCode = new Html5Qrcode(tempId);

      try {
        const decodedText = await html5QrCode.scanFile(file, true);
        
        try {
          const data = JSON.parse(decodedText);
          onScan(data);
        } catch (e) {
          onScan({ ticketId: decodedText });
        }
      } finally {
        // Clean up temporary element
        if (tempDiv && tempDiv.parentNode) {
          document.body.removeChild(tempDiv);
        }
      }
    } catch (error) {
      console.error('File scan error:', error);
      setError('Failed to scan QR code from image. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error).finally(() => {
        scannerRef.current = null;
        onClose();
      });
    } else {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Scanner Container - Matching Dashboard Style */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-2xl"
      >
        <div className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur">
          <div className="rounded-[22px] bg-slate-950/40 ring-1 ring-white/10">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <Camera className="h-6 w-6 text-white/80" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-white/90">
                    QR Code Scanner
                  </h2>
                  <p className="mt-0.5 text-sm text-white/60">
                    Scan or upload a QR code ticket
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/8"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-300 px-5 py-4 text-base font-semibold text-slate-950 shadow-[0_18px_40px_-22px_rgba(16,185,129,.5)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-5 w-5" />
                  Upload QR Code Image
                </motion.button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="rounded-full bg-slate-950/40 px-3 py-1 text-white/50 ring-1 ring-white/10">
                    OR SCAN WITH CAMERA
                  </span>
                </div>
              </div>

              {/* Loading State */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-2xl bg-white/5 p-8 text-center ring-1 ring-white/10"
                  >
                    <div className="relative mx-auto h-16 w-16">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 border-t-indigo-400 animate-spin" />
                      <div className="absolute inset-2 rounded-full border-4 border-cyan-500/30 border-t-cyan-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                    </div>
                    <p className="mt-5 text-base font-medium text-white/85">
                      {isInitialized ? 'Processing...' : 'Requesting camera access...'}
                    </p>
                    <p className="mt-1 text-sm text-white/55">
                      Please allow camera permissions when prompted
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 ring-1 ring-red-400/20"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-300" />
                      <p className="text-sm text-red-200">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scanner Container */}
              {!isScanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10"
                >
                  <div id={qrcodeRegionId} />
                </motion.div>
              )}
              
              {isInitialized && !isScanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-1"
                >
                  <p className="text-sm font-medium text-white/75">Position the QR code within the frame</p>
                  <p className="text-xs text-white/50">Scanner will automatically detect the code</p>
                </motion.div>
              )}

              {/* Help Card */}
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 ring-1 ring-indigo-400/10">
                <div className="flex items-start gap-3">
                  <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-indigo-400/15 ring-1 ring-indigo-300/20">
                    <Info className="h-4 w-4 text-indigo-200" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-100">Pro Tip</p>
                    <p className="mt-1 text-xs text-indigo-200/75">
                      If camera doesn't work, use the upload button to scan from a screenshot or photo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
