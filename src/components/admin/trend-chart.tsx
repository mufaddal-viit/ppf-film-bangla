import { trendPaths, type TrendPoint } from '@/lib/admin/chart';

const WIDTH = 600;
const HEIGHT = 180;

/** Line chart of daily counts, drawn on the server as plain SVG. The caption carries the numbers for screen readers. */
export function TrendChart({ points, unit }: { points: TrendPoint[]; unit: string }) {
  const values = points.map((point) => point.value);
  const { line, area } = trendPaths(values, WIDTH, HEIGHT);
  const max = Math.max(1, ...values);
  const total = values.reduce((sum, value) => sum + value, 0);
  const peak = points.reduce((best, point) => (point.value > best.value ? point : best), points[0]!);
  const last = points.at(-1)!;
  // Roughly seven date labels, always ending on today.
  const every = Math.ceil(points.length / 7);

  return (
    <figure className="c-admin-chart">
      <figcaption className="sr-only">
        {total} {unit} in the last {points.length} days. Busiest day: {peak.label} with {peak.value}. Today:{' '}
        {last.value}.
      </figcaption>
      <div className="c-admin-chart-plot" aria-hidden="true">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" focusable="false">
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--primary)" stopOpacity="0.28" />
              <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((fraction) => (
            <line key={fraction} x1="0" x2={WIDTH} y1={HEIGHT * fraction} y2={HEIGHT * fraction} />
          ))}
          <path d={area} fill="url(#trend-fill)" />
          <path d={line} data-line="" />
        </svg>
        <span className="c-admin-chart-marker" style={{ bottom: `${(last.value / max) * 88}%` }}>
          <span>
            Today <strong>{last.value}</strong>
          </span>
        </span>
      </div>
      <ol className="c-admin-chart-axis" aria-hidden="true">
        {points.map((point, index) =>
          (points.length - 1 - index) % every === 0 ? (
            <li key={point.key} style={{ left: `${(index / (points.length - 1)) * 100}%` }}>
              {point.label}
            </li>
          ) : null,
        )}
      </ol>
    </figure>
  );
}
