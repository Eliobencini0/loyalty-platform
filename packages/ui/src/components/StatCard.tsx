interface StatCardProps {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="stat-card">
      <h3>{label}</h3>
      <div className="value">{value}</div>
    </div>
  );
}
