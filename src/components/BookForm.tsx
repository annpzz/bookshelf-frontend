import { useState } from 'react';
import type { Book, BookStatus, GoogleBookInfo } from '../types/book';
import { fetchBookByISBN } from '../services/bookApi';
import { Scanner } from './Scanner';
import { ScanLine, Save, X, Loader2, BookOpen, Heart, Package, Search } from 'lucide-react';

interface BookFormProps {
  initialData?: Partial<Book>;
  onSubmit: (data: Partial<Book>) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function BookForm({ initialData, onSubmit, onCancel, isEdit }: BookFormProps) {
  const [form, setForm] = useState<Partial<Book>>({
    title: '',
    authors: '',
    isbn: '',
    publisher: '',
    publishedDate: '',
    description: '',
    thumbnail: '',
    pageCount: undefined,
    status: 'want',
    rating: undefined,
    notes: '',
    owned: false,
    favorite: false,
    ...initialData,
  });
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchMsg, setFetchMsg] = useState('');
  const [searchIsbn, setSearchIsbn] = useState('');

  const handleScan = async (isbn: string) => {
    setShowScanner(false);
    setScanning(true);
    setFetchMsg(`กำลังค้นหาข้อมูลหนังสือ ISBN: ${isbn}...`);

    const info = await fetchBookByISBN(isbn);
    setScanning(false);

    if (info) {
      const updated: Partial<Book> = {
        ...form,
        isbn,
        title: (info as GoogleBookInfo).title || form.title,
        authors: (info as GoogleBookInfo).authors?.join(', ') || form.authors,
        publisher: (info as GoogleBookInfo).publisher || form.publisher,
        publishedDate: (info as GoogleBookInfo).publishedDate || form.publishedDate,
        description: (info as GoogleBookInfo).description || form.description,
        pageCount: (info as GoogleBookInfo).pageCount || form.pageCount,
        thumbnail: (info as GoogleBookInfo).imageLinks?.thumbnail?.replace('http://', 'https://') || form.thumbnail,
      };
      setForm(updated);
      setFetchMsg(`✓ พบข้อมูลหนังสือ: ${updated.title}`);
    } else {
      setForm((prev) => ({ ...prev, isbn }));
      setFetchMsg('ไม่พบข้อมูลใน Google Books กรุณากรอกข้อมูลด้วยตนเอง');
    }
    setTimeout(() => setFetchMsg(''), 4000);
  };

  const handleChange = (key: keyof Book, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: 'owned' | 'favorite') => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) return;
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
  };

  return (
    <>
      {showScanner && <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      <div className="form-container">
        <div className="form-header">
          <h2><BookOpen size={22} /> {isEdit ? 'แก้ไขหนังสือ' : 'เพิ่มหนังสือใหม่'}</h2>
          <button className="icon-btn" onClick={onCancel}><X size={20} /></button>
        </div>

        <button
          type="button"
          className="scan-btn"
          onClick={() => setShowScanner(true)}
          disabled={scanning}
        >
          {scanning ? <Loader2 size={18} className="spin" /> : <ScanLine size={18} />}
          {scanning ? 'กำลังค้นหา...' : 'สแกนบาร์โค้ด / QR Code'}
        </button>

        <div className="manual-search-row">
          <input 
            type="text" 
            placeholder="หรือกรอกเลข ISBN เพื่อค้นหาออโต้..." 
            value={searchIsbn}
            onChange={(e) => setSearchIsbn(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (searchIsbn.trim()) handleScan(searchIsbn.trim());
              }
            }}
          />
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => handleScan(searchIsbn.trim())}
            disabled={scanning || !searchIsbn.trim()}
          >
            <Search size={16} /> ค้นหา
          </button>
        </div>

        {fetchMsg && <p className={`fetch-msg ${fetchMsg.startsWith('✓') ? 'success' : ''}`}>{fetchMsg}</p>}

        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-row">
            {form.thumbnail && (
              <img src={form.thumbnail} alt="cover" className="form-cover-preview" />
            )}
            <div className="form-fields">
              <div className="field-group">
                <label>ชื่อหนังสือ *</label>
                <input value={form.title || ''} onChange={e => handleChange('title', e.target.value)} required placeholder="ชื่อหนังสือ" />
              </div>
              <div className="field-group">
                <label>ผู้แต่ง</label>
                <input value={form.authors || ''} onChange={e => handleChange('authors', e.target.value)} placeholder="ผู้แต่ง" />
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label>ISBN</label>
              <input value={form.isbn || ''} onChange={e => handleChange('isbn', e.target.value)} placeholder="ISBN" />
            </div>
            <div className="field-group">
              <label>สำนักพิมพ์</label>
              <input value={form.publisher || ''} onChange={e => handleChange('publisher', e.target.value)} placeholder="สำนักพิมพ์" />
            </div>
            <div className="field-group">
              <label>วันที่พิมพ์</label>
              <input value={form.publishedDate || ''} onChange={e => handleChange('publishedDate', e.target.value)} placeholder="ปี YYYY" />
            </div>
            <div className="field-group">
              <label>จำนวนหน้า</label>
              <input type="number" value={form.pageCount || ''} onChange={e => handleChange('pageCount', Number(e.target.value))} placeholder="หน้า" />
            </div>
            <div className="field-group">
              <label>สถานะ</label>
              <select value={form.status || 'want'} onChange={e => handleChange('status', e.target.value as BookStatus)}>
                <option value="want">อยากอ่าน</option>
                <option value="reading">กำลังอ่าน</option>
                <option value="read">อ่านแล้ว</option>
              </select>
            </div>
            <div className="field-group">
              <label>คะแนน (1-5)</label>
              <input type="number" min={1} max={5} value={form.rating || ''} onChange={e => handleChange('rating', Number(e.target.value))} placeholder="คะแนน" />
            </div>
          </div>

          <div className="field-group">
            <label>คำอธิบาย</label>
            <textarea value={form.description || ''} onChange={e => handleChange('description', e.target.value)} placeholder="คำอธิบาย" rows={3} />
          </div>
          <div className="field-group">
            <label>โน้ต / บันทึกส่วนตัว</label>
            <textarea value={form.notes || ''} onChange={e => handleChange('notes', e.target.value)} placeholder="บันทึกส่วนตัว" rows={2} />
          </div>
          <div className="field-group">
            <label>URL รูปปก</label>
            <input value={form.thumbnail || ''} onChange={e => handleChange('thumbnail', e.target.value)} placeholder="https://..." />
          </div>

          <div className="toggle-row">
            <button
              type="button"
              className={`toggle-btn ${form.owned ? 'active owned' : ''}`}
              onClick={() => handleToggle('owned')}
            >
              <Package size={16} />
              {form.owned ? '✓ มีในครอบครอง' : 'มีในครอบครอง?'}
            </button>
            <button
              type="button"
              className={`toggle-btn ${form.favorite ? 'active fav' : ''}`}
              onClick={() => handleToggle('favorite')}
            >
              <Heart size={16} fill={form.favorite ? '#ef4444' : 'none'} />
              {form.favorite ? '✓ ถูกใจแล้ว' : 'ถูกใจ?'}
            </button>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>ยกเลิก</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
