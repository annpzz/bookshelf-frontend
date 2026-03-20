import { useState, useMemo } from 'react';
import type { Book, BookStatus } from '../types/book';
import { BookCard } from './BookCard';
import { Search, Library, BookMarked, BookOpen, CheckCircle2, Plus, Heart, Package } from 'lucide-react';

interface LibraryViewProps {
  books: Book[];
  loading: boolean;
  onBookClick: (book: Book) => void;
  onAddBook: () => void;
  onToggleFavorite: (book: Book) => void;
  onMarkRead: (book: Book) => void;
}

type FilterType = 'all' | BookStatus | 'favorite' | 'owned';

const FILTERS: { key: FilterType; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'ทั้งหมด', icon: Library },
  { key: 'want', label: 'อยากอ่าน', icon: BookMarked },
  { key: 'reading', label: 'กำลังอ่าน', icon: BookOpen },
  { key: 'read', label: 'อ่านแล้ว', icon: CheckCircle2 },
  { key: 'favorite', label: 'ถูกใจ', icon: Heart },
  { key: 'owned', label: 'มีในครอบครอง', icon: Package },
];

export function LibraryView({ books, loading, onBookClick, onAddBook, onToggleFavorite, onMarkRead }: LibraryViewProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchFilter =
        filter === 'all' ||
        (filter === 'favorite' ? b.favorite :
         filter === 'owned' ? b.owned :
         b.status === filter);
      const matchSearch =
        !search ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        (b.authors?.toLowerCase().includes(search.toLowerCase()) ?? false);
      return matchFilter && matchSearch;
    });
  }, [books, filter, search]);

  const counts: Record<FilterType, number> = {
    all: books.length,
    want: books.filter(b => b.status === 'want').length,
    reading: books.filter(b => b.status === 'reading').length,
    read: books.filter(b => b.status === 'read').length,
    favorite: books.filter(b => b.favorite).length,
    owned: books.filter(b => b.owned).length,
  };

  return (
    <div className="library-view">
      <div className="library-header">
        <div className="search-bar">
          <Search size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาหนังสือ ชื่อหรือผู้แต่ง..."
          />
        </div>
        <button className="btn-primary add-btn" onClick={onAddBook}>
          <Plus size={18} /> เพิ่มหนังสือ
        </button>
      </div>

      <div className="filter-tabs">
        {FILTERS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`filter-tab ${filter === key ? 'active' : ''} ${key === 'favorite' ? 'fav-tab' : key === 'owned' ? 'owned-tab' : ''}`}
            onClick={() => setFilter(key)}
          >
            <Icon size={15} />
            {label}
            <span className="filter-count">{counts[key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner" />
          <p>กำลังโหลด...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={64} strokeWidth={1} />
          <h3>{books.length === 0 ? 'ยังไม่มีหนังสือ' : 'ไม่พบหนังสือที่ค้นหา'}</h3>
          <p>{books.length === 0 ? 'เริ่มต้นเพิ่มหนังสือด้วยการกดปุ่ม "เพิ่มหนังสือ" หรือสแกนบาร์โค้ด' : 'ลองเปลี่ยนคำค้นหา'}</p>
          {books.length === 0 && (
            <button className="btn-primary" onClick={onAddBook}><Plus size={16} /> เพิ่มหนังสือ</button>
          )}
        </div>
      ) : (
        <div className="books-grid">
          {filtered.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => onBookClick(book)}
              onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(book); }}
              onMarkRead={(e) => { e.stopPropagation(); onMarkRead(book); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
