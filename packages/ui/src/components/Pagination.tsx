interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function Pagination({ page, totalPages, onPrev, onNext }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button className="btn btn-sm" onClick={onPrev} disabled={page <= 1}>Prev</button>
      <span>Page {page} of {totalPages}</span>
      <button className="btn btn-sm" onClick={onNext} disabled={page >= totalPages}>Next</button>
    </div>
  );
}
