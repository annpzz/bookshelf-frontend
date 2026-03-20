import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, ScanLine } from 'lucide-react';

interface ScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

export function Scanner({ onScan, onClose }: ScannerProps) {
  const [error, setError] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 280, height: 180 }, aspectRatio: 1.6 },
      false
    );

    scanner.render(
      (decodedText) => {
        // Extract ISBN from barcode - strip non-digits for EAN/ISBN barcodes
        const isbn = decodedText.replace(/\D/g, '');
        if (isbn.length === 10 || isbn.length === 13) {
          scanner.clear().catch(() => {});
          onScan(isbn);
        } else {
          onScan(decodedText);
          scanner.clear().catch(() => {});
        }
      },
      (err) => {
        if (!err.includes('No QR code')) {
          setError('ไม่สามารถสแกนได้: ' + err);
        }
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="scanner-overlay">
      <div className="scanner-modal">
        <div className="scanner-header">
          <div className="scanner-title">
            <ScanLine size={20} />
            <span>สแกนบาร์โค้ด / QR Code</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="scanner-hint">วางบาร์โค้ดหนังสือ (ISBN) ให้อยู่ในกรอบ</p>
        <div id="qr-reader" />
        {error && <p className="scanner-error">{error}</p>}
      </div>
    </div>
  );
}
