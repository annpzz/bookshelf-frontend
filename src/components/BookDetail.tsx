import type { Book } from '../types/book';
import { X, Trash2, Edit2, BookOpen, Star, Bookmark, Clock, CheckCircle2, Calendar, Hash, Building2, FileText } from 'lucide-react';

interface BookDetailProps {
  book: Book;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_MAP = {
  want: { label: 'อยากอ่าน', icon: Bookmark, color: '#f59e0b' },
  reading: { label: 'กำลังอ่าน', icon: Clock, color: '#3b82f6' },
  read: { label: 'อ่านแล้ว', icon: CheckCircle2, color: '#10b981' },
};

export function BookDetail({ book, onClose, onEdit, onDelete }: BookDetailProps) {
  const status = STATUS_MAP[book.status];
  const StatusIcon = status.icon;

  return (
    <div className="scanner-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X size={20} /></button>

        <div className="detail-top">
          <div className="detail-cover">
            {book.thumbnail ? (
              <img src={book.thumbnail} alt={book.title} />
            ) : (
              <div className="book-cover-placeholder large">
                <BookOpen size={60} />
              </div>
            )}
          </div>
          <div className="detail-meta">
            <h2 className="detail-title">{book.title}</h2>
            {book.authors && <p className="detail-authors">{book.authors}</p>}

            <div className="detail-status" style={{ color: status.color }}>
              <StatusIcon size={16} />
              <span>{status.label}</span>
            </div>

            {book.rating && (
              <div className="book-rating large">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18}
                    fill={s <= book.rating! ? '#f59e0b' : 'none'}
                    color={s <= book.rating! ? '#f59e0b' : '#6b7280'}
                  />
                ))}
              </div>
            )}

            <div className="detail-chips">
              {book.isbn && <span className="chip"><Hash size={12} />{book.isbn}</span>}
              {book.publisher && <span className="chip"><Building2 size={12} />{book.publisher}</span>}
              {book.publishedDate && <span className="chip"><Calendar size={12} />{book.publishedDate}</span>}
              {book.pageCount && <span className="chip"><FileText size={12} />{book.pageCount} หน้า</span>}
            </div>
          </div>
        </div>

        {book.description && (
          <div className="detail-section">
            <h4>คำอธิบาย</h4>
            <p className="detail-desc">{book.description}</p>
          </div>
        )}

        {book.notes && (
          <div className="detail-section">
            <h4>โน้ตส่วนตัว</h4>
            <p className="detail-notes">{book.notes}</p>
          </div>
        )}

        <div className="detail-actions">
          <button className="btn-danger" onClick={onDelete}><Trash2 size={16} /> ลบ</button>
          <button className="btn-primary" onClick={onEdit}><Edit2 size={16} /> แก้ไข</button>
        </div>
      </div>
    </div>
  );
}
