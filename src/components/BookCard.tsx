import type { Book } from '../types/book';
import { BookOpen, Star, Bookmark, CheckCircle2, Clock, Heart, Package } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onMarkRead: (e: React.MouseEvent) => void;
}

const STATUS_MAP = {
  want: { label: 'อยากอ่าน', icon: Bookmark, color: '#f59e0b' },
  reading: { label: 'กำลังอ่าน', icon: Clock, color: '#3b82f6' },
  read: { label: 'อ่านแล้ว', icon: CheckCircle2, color: '#10b981' },
};

export function BookCard({ book, onClick, onToggleFavorite, onMarkRead }: BookCardProps) {
  const status = STATUS_MAP[book.status];
  const StatusIcon = status.icon;

  return (
    <div className="book-card" onClick={onClick}>
      <div className="book-cover">
        {book.thumbnail ? (
          <img src={book.thumbnail} alt={book.title} />
        ) : (
          <div className="book-cover-placeholder">
            <BookOpen size={40} />
          </div>
        )}

        {/* Quick action buttons */}
        <div className="card-actions">
          <button
            className={`card-action-btn fav-btn ${book.favorite ? 'active' : ''}`}
            onClick={onToggleFavorite}
            title={book.favorite ? 'ยกเลิกถูกใจ' : 'ถูกใจ'}
          >
            <Heart size={14} fill={book.favorite ? '#ef4444' : 'none'} />
          </button>
          {book.status !== 'read' && (
            <button
              className="card-action-btn read-btn"
              onClick={onMarkRead}
              title="อ่านแล้ว"
            >
              <CheckCircle2 size={14} />
            </button>
          )}
        </div>

        <div className="book-status-badge" style={{ color: status.color }}>
          <StatusIcon size={14} />
          <span>{status.label}</span>
        </div>
      </div>

      <div className="book-info">
        <div className="book-info-header">
          <h3 className="book-title">{book.title}</h3>
          {book.owned && (
            <span className="owned-badge" title="มีในครอบครอง">
              <Package size={11} />
            </span>
          )}
        </div>
        <p className="book-authors">{book.authors || 'ไม่ระบุผู้แต่ง'}</p>
        {book.rating !== undefined && book.rating !== null && (
          <div className="book-rating">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={12}
                fill={s <= book.rating! ? '#f59e0b' : 'none'}
                color={s <= book.rating! ? '#f59e0b' : '#6b7280'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
