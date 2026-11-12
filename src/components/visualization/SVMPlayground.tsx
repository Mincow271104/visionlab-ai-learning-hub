import { useId, useMemo, useRef, useState } from 'react';

type PointClass = 'A' | 'B';
type DatasetPreset = 'linear' | 'xor';

interface PlotPoint {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly cls: PointClass;
}

interface PointWithMetrics extends PlotPoint {
  readonly signedDist: number;
  readonly absDist: number;
  readonly predicted: PointClass;
  readonly isCorrectSide: boolean;
  readonly isInsideMargin: boolean;
}

const DOMAIN_MIN = -5;
const DOMAIN_MAX = 5;
const SVG_SIZE = 420;
const SVG_PADDING = 36;
const PLOT_SPAN = SVG_SIZE - SVG_PADDING * 2;
const MAX_POINTS = 40;

const LINEAR_PRESET: readonly PlotPoint[] = [
  { id: 1, x: -3.2, y: 2.8, cls: 'A' },
  { id: 2, x: -2.1, y: 3.4, cls: 'A' },
  { id: 3, x: -2.6, y: 1.4, cls: 'A' },
  { id: 4, x: -1.1, y: 2.2, cls: 'A' },
  { id: 5, x: -0.9, y: 0.7, cls: 'A' },
  { id: 6, x: 1.2, y: -0.9, cls: 'B' },
  { id: 7, x: 2.4, y: -1.4, cls: 'B' },
  { id: 8, x: 1.7, y: -2.9, cls: 'B' },
  { id: 9, x: 3.3, y: -2.5, cls: 'B' },
  { id: 10, x: 2.8, y: -0.4, cls: 'B' },
];

const XOR_PRESET: readonly PlotPoint[] = [
  { id: 1, x: -2.6, y: 2.6, cls: 'A' },
  { id: 2, x: -1.6, y: 1.8, cls: 'A' },
  { id: 3, x: 2.5, y: -2.5, cls: 'A' },
  { id: 4, x: 1.7, y: -1.6, cls: 'A' },
  { id: 5, x: 2.5, y: 2.5, cls: 'B' },
  { id: 6, x: 1.6, y: 1.7, cls: 'B' },
  { id: 7, x: -2.5, y: -2.4, cls: 'B' },
  { id: 8, x: -1.7, y: -1.5, cls: 'B' },
];

function toSvgX(x: number): number {
  const t = (x - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN);
  return SVG_PADDING + t * PLOT_SPAN;
}

function toSvgY(y: number): number {
  const t = (y - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN);
  return SVG_SIZE - SVG_PADDING - t * PLOT_SPAN;
}

function clampDomain(value: number): number {
  return Math.max(DOMAIN_MIN, Math.min(DOMAIN_MAX, value));
}

function roundTo(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Computes segment endpoints inside `[-5, 5] x [-5, 5]` for the line:
 * `nx * x + ny * y + c = 0`, where `(nx, ny)` is a unit normal vector.
 */
function clipLineToDomain(
  nx: number,
  ny: number,
  c: number
): { x1: number; y1: number; x2: number; y2: number } | null {
  const candidates: Array<{ x: number; y: number }> = [];
  const eps = 1e-6;

  if (Math.abs(ny) > eps) {
    for (const x of [DOMAIN_MIN, DOMAIN_MAX]) {
      const y = (-c - nx * x) / ny;
      if (y >= DOMAIN_MIN - eps && y <= DOMAIN_MAX + eps) {
        candidates.push({ x, y: clampDomain(y) });
      }
    }
  }

  if (Math.abs(nx) > eps) {
    for (const y of [DOMAIN_MIN, DOMAIN_MAX]) {
      const x = (-c - ny * y) / nx;
      if (x >= DOMAIN_MIN - eps && x <= DOMAIN_MAX + eps) {
        candidates.push({ x: clampDomain(x), y });
      }
    }
  }

  const unique: Array<{ x: number; y: number }> = [];
  for (const pt of candidates) {
    if (
      !unique.some(
        (existing) =>
          Math.abs(existing.x - pt.x) < 1e-4 &&
          Math.abs(existing.y - pt.y) < 1e-4
      )
    ) {
      unique.push(pt);
    }
  }

  if (unique.length < 2) return null;
  return {
    x1: unique[0].x,
    y1: unique[0].y,
    x2: unique[1].x,
    y2: unique[1].y,
  };
}

export default function SVMPlayground() {
  const baseId = useId();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [preset, setPreset] = useState<DatasetPreset>('linear');
  const [points, setPoints] = useState<readonly PlotPoint[]>(LINEAR_PRESET);
  const [activeClass, setActiveClass] = useState<PointClass>('A');
  const [angleDeg, setAngleDeg] = useState<number>(135);
  const [offset, setOffset] = useState<number>(0);
  const [marginHalfWidth, setMarginHalfWidth] = useState<number>(1.0);
  const [showKernelIllustration, setShowKernelIllustration] = useState(false);

  // Keyboard-friendly point entry coordinates
  const [manualX, setManualX] = useState<number>(0);
  const [manualY, setManualY] = useState<number>(0);

  const theta = (angleDeg * Math.PI) / 180;
  // Unit normal pointing toward Class A region by convention
  const nx = Math.cos(theta);
  const ny = Math.sin(theta);

  const metrics = useMemo(() => {
    const evaluated: PointWithMetrics[] = points.map((pt) => {
      // Exact signed perpendicular distance from point (x, y) to unit-normal line nx*x + ny*y + offset = 0
      const signedDist = nx * pt.x + ny * pt.y + offset;
      const absDist = Math.abs(signedDist);
      const predicted: PointClass = signedDist >= 0 ? 'A' : 'B';
      return {
        ...pt,
        signedDist,
        absDist,
        predicted,
        isCorrectSide: predicted === pt.cls,
        isInsideMargin: absDist < marginHalfWidth,
      };
    });

    const minDistA = evaluated
      .filter((p) => p.cls === 'A')
      .reduce((min, p) => Math.min(min, p.absDist), Infinity);
    const minDistB = evaluated
      .filter((p) => p.cls === 'B')
      .reduce((min, p) => Math.min(min, p.absDist), Infinity);

    const closestIds = new Set<number>();
    const tieEpsilon = 0.08;
    for (const p of evaluated) {
      if (p.cls === 'A' && Math.abs(p.absDist - minDistA) <= tieEpsilon) {
        closestIds.add(p.id);
      }
      if (p.cls === 'B' && Math.abs(p.absDist - minDistB) <= tieEpsilon) {
        closestIds.add(p.id);
      }
    }

    const correctCount = evaluated.filter((p) => p.isCorrectSide).length;
    const insideMarginCount = evaluated.filter((p) => p.isInsideMargin).length;

    return {
      evaluated,
      closestIds,
      minDistA: Number.isFinite(minDistA) ? minDistA : null,
      minDistB: Number.isFinite(minDistB) ? minDistB : null,
      correctCount,
      insideMarginCount,
    };
  }, [points, nx, ny, offset, marginHalfWidth]);

  const boundarySegment = clipLineToDomain(nx, ny, offset);
  const posMarginSegment = clipLineToDomain(nx, ny, offset - marginHalfWidth);
  const negMarginSegment = clipLineToDomain(nx, ny, offset + marginHalfWidth);

  const addPoint = (x: number, y: number) => {
    const roundedX = roundTo(clampDomain(x), 2);
    const roundedY = roundTo(clampDomain(y), 2);
    setPoints((prev) => {
      const nextId =
        prev.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
      const trimmed = prev.length >= MAX_POINTS ? prev.slice(1) : prev;
      return [...trimmed, { id: nextId, x: roundedX, y: roundedY, cls: activeClass }];
    });
  };

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const svgX = ((event.clientX - rect.left) / rect.width) * SVG_SIZE;
    const svgY = ((event.clientY - rect.top) / rect.height) * SVG_SIZE;

    const plotX =
      DOMAIN_MIN + ((svgX - SVG_PADDING) / PLOT_SPAN) * (DOMAIN_MAX - DOMAIN_MIN);
    const plotY =
      DOMAIN_MIN +
      ((SVG_SIZE - SVG_PADDING - svgY) / PLOT_SPAN) * (DOMAIN_MAX - DOMAIN_MIN);

    if (
      plotX >= DOMAIN_MIN &&
      plotX <= DOMAIN_MAX &&
      plotY >= DOMAIN_MIN &&
      plotY <= DOMAIN_MAX
    ) {
      addPoint(plotX, plotY);
    }
  };

  const handleSwitchPreset = (nextPreset: DatasetPreset) => {
    setPreset(nextPreset);
    if (nextPreset === 'linear') {
      setPoints(LINEAR_PRESET);
      setAngleDeg(135);
      setOffset(0);
      setMarginHalfWidth(1.0);
      setShowKernelIllustration(false);
    } else {
      setPoints(XOR_PRESET);
      setAngleDeg(65);
      setOffset(0);
      setMarginHalfWidth(0.9);
      setShowKernelIllustration(false);
    }
  };

  const handleReset = () => {
    handleSwitchPreset(preset);
  };

  const gridTicks = [-4, -2, 0, 2, 4];

  return (
    <section
      className="vl-widget"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="vl-widget__header">
        <div>
          <p className="vl-widget__eyebrow">
            Interactive Conceptual Demonstration
          </p>
          <h3 id={`${baseId}-title`} className="vl-widget__title">
            SVM Margin &amp; Decision Boundary Explorer
          </h3>
          <p className="vl-widget__goal">
            <strong>Learning objective:</strong> Explore how a linear decision
            boundary separates two classes, how margin width affects nearby
            points, and why XOR-style patterns motivate nonlinear kernels.
          </p>
        </div>
        <span className="vl-badge vl-badge--amber">
          Conceptual simulation (no model training)
        </span>
      </div>

      <p className="vl-notice" style={{ marginBottom: '1rem' }}>
        <strong>Scientific honesty note:</strong> This explorer lets you adjust
        a decision line and margin by hand to build geometric intuition. It does{' '}
        <strong>not</strong> optimize or train a real Support Vector Machine
        solver.
      </p>

      <div className="vl-sim-layout">
        <div className="vl-sim-canvas-wrap">
          <p
            style={{
              fontSize: '0.84rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.5rem',
            }}
          >
            Click or tap anywhere inside the grid to add a{' '}
            <strong>Class {activeClass}</strong> point (or use the keyboard
            coordinates on the right).
          </p>

          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            role="img"
            aria-label="2D interactive classification plot with decision boundary, margin bands, and Class A and Class B points"
            onClick={handleSvgClick}
            style={{
              width: '100%',
              height: 'auto',
              cursor: 'crosshair',
              touchAction: 'manipulation',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Grid lines */}
            {gridTicks.map((tick) => {
              const gx = toSvgX(tick);
              const gy = toSvgY(tick);
              const isAxis = tick === 0;
              return (
                <g key={tick}>
                  <line
                    x1={gx}
                    y1={SVG_PADDING}
                    x2={gx}
                    y2={SVG_SIZE - SVG_PADDING}
                    stroke={
                      isAxis ? 'var(--color-border-strong)' : 'var(--color-border)'
                    }
                    strokeWidth={isAxis ? 1.5 : 1}
                  />
                  <line
                    x1={SVG_PADDING}
                    y1={gy}
                    x2={SVG_SIZE - SVG_PADDING}
                    y2={gy}
                    stroke={
                      isAxis ? 'var(--color-border-strong)' : 'var(--color-border)'
                    }
                    strokeWidth={isAxis ? 1.5 : 1}
                  />
                  <text
                    x={gx}
                    y={SVG_SIZE - SVG_PADDING + 16}
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--color-text-muted)"
                  >
                    {tick}
                  </text>
                  <text
                    x={SVG_PADDING - 10}
                    y={gy + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="var(--color-text-muted)"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Plot border */}
            <rect
              x={SVG_PADDING}
              y={SVG_PADDING}
              width={PLOT_SPAN}
              height={PLOT_SPAN}
              fill="none"
              stroke="var(--color-border-strong)"
              strokeWidth={1.5}
            />

            {/* Axis labels */}
            <text
              x={SVG_SIZE / 2}
              y={SVG_SIZE - 6}
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="600"
              fill="var(--color-text-secondary)"
            >
              Feature x₁
            </text>
            <text
              x={13}
              y={SVG_SIZE / 2}
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="600"
              fill="var(--color-text-secondary)"
              transform={`rotate(-90 13 ${SVG_SIZE / 2})`}
            >
              Feature x₂
            </text>

            {/* Optional explicit feature-mapping boundary illustration for XOR: z = x1 * x2 = 0 => axes x1 = 0 and x2 = 0 */}
            {preset === 'xor' && showKernelIllustration && (
              <g aria-label="Explicit feature-mapping boundary z equals x1 times x2 equals 0 shown as the axes x1 equals 0 and x2 equals 0">
                {/* Subtle quadrant sign regions */}
                <rect
                  x={SVG_PADDING}
                  y={SVG_PADDING}
                  width={PLOT_SPAN / 2}
                  height={PLOT_SPAN / 2}
                  fill="#2563eb"
                  opacity={0.07}
                />
                <rect
                  x={toSvgX(0)}
                  y={toSvgY(0)}
                  width={PLOT_SPAN / 2}
                  height={PLOT_SPAN / 2}
                  fill="#2563eb"
                  opacity={0.07}
                />
                <rect
                  x={toSvgX(0)}
                  y={SVG_PADDING}
                  width={PLOT_SPAN / 2}
                  height={PLOT_SPAN / 2}
                  fill="#0f766e"
                  opacity={0.07}
                />
                <rect
                  x={SVG_PADDING}
                  y={toSvgY(0)}
                  width={PLOT_SPAN / 2}
                  height={PLOT_SPAN / 2}
                  fill="#0f766e"
                  opacity={0.07}
                />

                {/* Preimage of z = x1 * x2 = 0 in 2D: union of x1 = 0 and x2 = 0 */}
                <line
                  x1={toSvgX(0)}
                  y1={SVG_PADDING}
                  x2={toSvgX(0)}
                  y2={SVG_SIZE - SVG_PADDING}
                  stroke="#9333ea"
                  strokeWidth={3}
                  strokeDasharray="7 4"
                />
                <line
                  x1={SVG_PADDING}
                  y1={toSvgY(0)}
                  x2={SVG_SIZE - SVG_PADDING}
                  y2={toSvgY(0)}
                  stroke="#9333ea"
                  strokeWidth={3}
                  strokeDasharray="7 4"
                />

                {/* Quadrant sign annotations */}
                <text
                  x={toSvgX(-2.5)}
                  y={toSvgY(4.2)}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="600"
                  fill="#1d4ed8"
                >
                  z = x₁·x₂ &lt; 0 (A)
                </text>
                <text
                  x={toSvgX(2.5)}
                  y={toSvgY(-4.35)}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="600"
                  fill="#1d4ed8"
                >
                  z = x₁·x₂ &lt; 0 (A)
                </text>
                <text
                  x={toSvgX(2.5)}
                  y={toSvgY(4.2)}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="600"
                  fill="#0f766e"
                >
                  z = x₁·x₂ &gt; 0 (B)
                </text>
                <text
                  x={toSvgX(-2.5)}
                  y={toSvgY(-4.35)}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="600"
                  fill="#0f766e"
                >
                  z = x₁·x₂ &gt; 0 (B)
                </text>

                {/* Direct axis equation labels */}
                <rect
                  x={toSvgX(0) + 6}
                  y={SVG_PADDING + 24}
                  width={158}
                  height={20}
                  rx={4}
                  fill="var(--color-surface)"
                  fillOpacity={0.92}
                  stroke="#9333ea"
                  strokeWidth={1}
                />
                <text
                  x={toSvgX(0) + 12}
                  y={SVG_PADDING + 38}
                  fontSize="10.5"
                  fontWeight="700"
                  fill="#9333ea"
                >
                  z = x₁·x₂ = 0 (axes x₁=0, x₂=0)
                </text>
              </g>
            )}

            {/* Margin lines */}
            {posMarginSegment && (
              <line
                x1={toSvgX(posMarginSegment.x1)}
                y1={toSvgY(posMarginSegment.y1)}
                x2={toSvgX(posMarginSegment.x2)}
                y2={toSvgY(posMarginSegment.y2)}
                stroke="var(--color-accent)"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                opacity={preset === 'xor' && showKernelIllustration ? 0.3 : 0.75}
              />
            )}
            {negMarginSegment && (
              <line
                x1={toSvgX(negMarginSegment.x1)}
                y1={toSvgY(negMarginSegment.y1)}
                x2={toSvgX(negMarginSegment.x2)}
                y2={toSvgY(negMarginSegment.y2)}
                stroke="var(--color-teal)"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                opacity={preset === 'xor' && showKernelIllustration ? 0.3 : 0.75}
              />
            )}

            {/* Decision boundary */}
            {boundarySegment && (
              <line
                x1={toSvgX(boundarySegment.x1)}
                y1={toSvgY(boundarySegment.y1)}
                x2={toSvgX(boundarySegment.x2)}
                y2={toSvgY(boundarySegment.y2)}
                stroke="var(--color-text)"
                strokeWidth={2.5}
                opacity={preset === 'xor' && showKernelIllustration ? 0.45 : 1}
              />
            )}

            {/* Perpendicular projections for closest-to-boundary points */}
            {metrics.evaluated.map((pt) => {
              if (!metrics.closestIds.has(pt.id)) return null;
              const projX = pt.x - pt.signedDist * nx;
              const projY = pt.y - pt.signedDist * ny;
              return (
                <line
                  key={`proj-${pt.id}`}
                  x1={toSvgX(pt.x)}
                  y1={toSvgY(pt.y)}
                  x2={toSvgX(projX)}
                  y2={toSvgY(projY)}
                  stroke="var(--color-amber)"
                  strokeWidth={1.6}
                  strokeDasharray="3 3"
                />
              );
            })}

            {/* Data points */}
            {metrics.evaluated.map((pt) => {
              const cx = toSvgX(pt.x);
              const cy = toSvgY(pt.y);
              const isClosest = metrics.closestIds.has(pt.id);

              return (
                <g key={pt.id}>
                  {isClosest && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={11}
                      fill="none"
                      stroke="var(--color-amber)"
                      strokeWidth={2.2}
                    />
                  )}
                  {pt.cls === 'A' ? (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6.2}
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth={1.6}
                    />
                  ) : (
                    <rect
                      x={cx - 5.8}
                      y={cy - 5.8}
                      width={11.6}
                      height={11.6}
                      rx={2}
                      fill="#0f766e"
                      stroke="#ffffff"
                      strokeWidth={1.6}
                      transform={`rotate(45 ${cx} ${cy})`}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.85rem',
              marginTop: '0.75rem',
              fontSize: '0.82rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span>● Blue circle: Class A (+ side)</span>
            <span>◆ Teal diamond: Class B (− side)</span>
            <span>━━ Manual linear boundary (from sliders)</span>
            <span>┅ Manual margin band (±m)</span>
            {preset === 'xor' && showKernelIllustration && (
              <span style={{ color: '#9333ea', fontWeight: 600 }}>
                ┅ Purple dashed axes (x₁ = 0, x₂ = 0): Feature-map boundary z = x₁·x₂ = 0
              </span>
            )}
            <span>◯ Amber ring: Closest-to-boundary points (support-vector intuition)</span>
          </div>
        </div>

        {/* Controls */}
        <div className="vl-sim-controls">
          <div>
            <p className="vl-field__label" style={{ marginBottom: '0.4rem' }}>
              1. Dataset preset
            </p>
            <div className="vl-btn-row">
              <button
                type="button"
                className={`vl-btn ${preset === 'linear' ? 'vl-btn--active' : ''}`}
                aria-pressed={preset === 'linear'}
                onClick={() => handleSwitchPreset('linear')}
              >
                Linearly Separable
              </button>
              <button
                type="button"
                className={`vl-btn ${preset === 'xor' ? 'vl-btn--active' : ''}`}
                aria-pressed={preset === 'xor'}
                onClick={() => handleSwitchPreset('xor')}
              >
                Nonlinear / XOR-Style
              </button>
            </div>
          </div>

          <div>
            <p className="vl-field__label" style={{ marginBottom: '0.4rem' }}>
              2. Active class for adding points
            </p>
            <div className="vl-btn-row">
              <button
                type="button"
                className={`vl-btn ${activeClass === 'A' ? 'vl-btn--active' : ''}`}
                aria-pressed={activeClass === 'A'}
                onClick={() => setActiveClass('A')}
              >
                ● Class A
              </button>
              <button
                type="button"
                className={`vl-btn ${activeClass === 'B' ? 'vl-btn--active' : ''}`}
                aria-pressed={activeClass === 'B'}
                onClick={() => setActiveClass('B')}
              >
                ◆ Class B
              </button>
            </div>
          </div>

          <div className="vl-field">
            <label htmlFor={`${baseId}-angle`}>
              <span>3. Boundary angle (θ)</span>
              <span className="vl-mono">{angleDeg}°</span>
            </label>
            <input
              id={`${baseId}-angle`}
              type="range"
              className="vl-range"
              min={0}
              max={180}
              step={1}
              value={angleDeg}
              onChange={(e) => setAngleDeg(Number(e.target.value))}
            />
          </div>

          <div className="vl-field">
            <label htmlFor={`${baseId}-offset`}>
              <span>4. Boundary offset (b)</span>
              <span className="vl-mono">{offset.toFixed(2)}</span>
            </label>
            <input
              id={`${baseId}-offset`}
              type="range"
              className="vl-range"
              min={-3.5}
              max={3.5}
              step={0.1}
              value={offset}
              onChange={(e) => setOffset(Number(e.target.value))}
            />
          </div>

          <div className="vl-field">
            <label htmlFor={`${baseId}-margin`}>
              <span>5. Margin half-width (m)</span>
              <span className="vl-mono">±{marginHalfWidth.toFixed(2)}</span>
            </label>
            <input
              id={`${baseId}-margin`}
              type="range"
              className="vl-range"
              min={0.25}
              max={2.4}
              step={0.05}
              value={marginHalfWidth}
              onChange={(e) => setMarginHalfWidth(Number(e.target.value))}
            />
          </div>

          {/* Keyboard-accessible point addition */}
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p className="vl-field__label" style={{ marginBottom: '0.5rem' }}>
              Keyboard point placement (Class {activeClass})
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: '0.5rem',
                alignItems: 'end',
              }}
            >
              <div className="vl-field">
                <label htmlFor={`${baseId}-mx`}>x₁</label>
                <input
                  id={`${baseId}-mx`}
                  type="number"
                  min={DOMAIN_MIN}
                  max={DOMAIN_MAX}
                  step={0.5}
                  className="vl-input"
                  value={manualX}
                  onChange={(e) => setManualX(Number(e.target.value))}
                />
              </div>
              <div className="vl-field">
                <label htmlFor={`${baseId}-my`}>x₂</label>
                <input
                  id={`${baseId}-my`}
                  type="number"
                  min={DOMAIN_MIN}
                  max={DOMAIN_MAX}
                  step={0.5}
                  className="vl-input"
                  value={manualY}
                  onChange={(e) => setManualY(Number(e.target.value))}
                />
              </div>
              <button
                type="button"
                className="vl-btn"
                onClick={() => addPoint(manualX, manualY)}
              >
                Add
              </button>
            </div>
          </div>

          {preset === 'xor' && (
            <div className="vl-notice vl-notice--info">
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Why no single line separates XOR in 2D:</strong> Class A
                occupies the top-left (<span className="vl-mono">x₁ &lt; 0, x₂ &gt; 0</span>)
                and bottom-right (<span className="vl-mono">x₁ &gt; 0, x₂ &lt; 0</span>){' '}
                quadrants, while Class B occupies the top-right and bottom-left
                quadrants. No single straight line in{' '}
                <span className="vl-mono">(x₁, x₂)</span> can separate opposite
                quadrant pairs cleanly.
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Simple feature-mapping intuition (not a trained kernel SVM):</strong>{' '}
                If we explicitly introduce one new feature{' '}
                <span className="vl-mono">z = x₁ · x₂</span>, then{' '}
                <span className="vl-mono">z &lt; 0</span> for Class A and{' '}
                <span className="vl-mono">z &gt; 0</span> for Class B. In the
                original 2D plane, the preimage of{' '}
                <span className="vl-mono">z = 0</span> is the union of the two
                coordinate axes: <span className="vl-mono">x₁ = 0</span> and{' '}
                <span className="vl-mono">x₂ = 0</span>.
              </p>
              <p style={{ marginBottom: '0.65rem', fontSize: '0.84rem' }}>
                <strong>Explicit feature vs. kernel trick:</strong> Adding{' '}
                <span className="vl-mono">z = x₁ · x₂</span> manually builds an
                extra coordinate. By contrast, the{' '}
                <strong>kernel trick</strong> lets a real SVM evaluate inner
                products <span className="vl-mono">K(u, v)</span> in an{' '}
                <em>implicit</em> feature space without computing every
                high-dimensional coordinate explicitly. This overlay illustrates
                that simple <span className="vl-mono">z = x₁ · x₂</span> mapping
                conceptually—it is <strong>not</strong> an implementation of a
                trained kernel SVM solver.
              </p>
              <button
                type="button"
                className="vl-btn"
                aria-pressed={showKernelIllustration}
                onClick={() => setShowKernelIllustration((prev) => !prev)}
              >
                {showKernelIllustration
                  ? 'Hide Feature-Map Overlay (x₁ = 0, x₂ = 0)'
                  : 'Show Feature-Map Intuition (z = x₁·x₂ = 0)'}
              </button>
            </div>
          )}

          {/* Live geometric readout */}
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              fontSize: '0.86rem',
            }}
          >
            <p style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
              Live Geometry Readout
            </p>
            <p className="vl-mono">
              {nx.toFixed(2)}·x₁ + {ny.toFixed(2)}·x₂ + ({offset.toFixed(2)}) = 0
            </p>
            <p style={{ marginTop: '0.35rem' }}>
              Total margin width:{' '}
              <strong className="vl-mono">
                {(marginHalfWidth * 2).toFixed(2)}
              </strong>{' '}
              units
            </p>
            <p>
              Points on expected side:{' '}
              <strong>
                {metrics.correctCount}/{points.length}
              </strong>{' '}
              | Inside margin band: <strong>{metrics.insideMarginCount}</strong>
            </p>
            <p>
              Closest distance — Class A:{' '}
              <strong className="vl-mono">
                {metrics.minDistA !== null ? metrics.minDistA.toFixed(2) : '—'}
              </strong>{' '}
              | Class B:{' '}
              <strong className="vl-mono">
                {metrics.minDistB !== null ? metrics.minDistB.toFixed(2) : '—'}
              </strong>
            </p>
          </div>

          <div className="vl-btn-row">
            <button type="button" className="vl-btn" onClick={handleReset}>
              Reset Playground
            </button>
          </div>
        </div>
      </div>

      <div className="vl-observe-box">
        <h4>What to observe</h4>
        <ul>
          <li>
            Rotate the angle and shift the offset in the{' '}
            <strong>Linearly Separable</strong> preset until all Class A circles
            lie on one side, all Class B diamonds lie on the other, and no points
            fall inside the dashed margin band.
          </li>
          <li>
            Notice the amber-ringed{' '}
            <strong>closest-to-boundary points (support-vector intuition)</strong>
            : moving points far away from the line does not change which points
            limit how wide the margin can grow.
          </li>
          <li>
            Switch to <strong>Nonlinear / XOR-Style</strong> and try every angle
            and offset—observe that no straight line can cleanly separate
            diagonal pairs in the original 2D space.
          </li>
        </ul>
      </div>
    </section>
  );
}
