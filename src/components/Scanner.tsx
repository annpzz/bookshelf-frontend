import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, ScanLine, Loader2 } from 'lucide-react';

interface ScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

export function Scanner({ onScan, onClose }: ScannerProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let html5QrCode: Html5Qrcode;
    
    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode('qr-reader');
        await html5QrCode.start(
          { facingMode: 'environment' }, // Force back camera
          { fps: 10, qrbox: { width: 280, height: 180 }, aspectRatio: 1.6 },
          (decodedText) => {
            const isbn = decodedText.replace(/\D/g, '');
            html5QrCode.stop().then(() => {
              if (isbn.length === 10 || isbn.length === 13) {
                onScan(isbn);
              } else {
                onScan(decodedText);
              }
            }).catch(() => { /* ignore */ });
          },
          () => { /* ignore scan errors */ }
        );
        setLoading(false);
      } catch (err) {
        setError('ไม่สามารถเปิดใช้งานกล้องด้านหลังได้ (กรุณาอนุญาตให้ใช้งานกล้อง)');
        setLoading(false);
      }
    };

    const timer = setTimeout(startScanner, 100);

    return () => {
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
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
        
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Loader2 size={32} className="spin" style={{ color: 'var(--accent)' }} />
          </div>
        )}
        
        <div id="qr-reader" style={{ display: loading ? 'none' : 'block' }} />
        {error && <p className="scanner-error">{error}</p>}
      </div>
    </div>
  );
}
