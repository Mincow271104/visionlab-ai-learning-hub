import { useId, useMemo, useState } from 'react';

interface LayerStep {
  readonly id: number;
  readonly label: string;
  readonly summary: string;
}

const STEPS: readonly LayerStep[] = [
  {
    id: 0,
    label: 'Step 1: Input Layer',
    summary:
      'Two numeric inputs (x₁, x₂) enter the network. Input neurons simply hold these starting values.',
  },
  {
    id: 1,
    label: 'Step 2: Hidden Weighted Sums',
    summary:
      'Each hidden neuron multiplies each input by a connection weight, adds them together, and adds a bias offset (z = w₁x₁ + w₂x₂ + b).',
  },
  {
    id: 2,
    label: 'Step 3: Hidden ReLU Activations',
    summary:
      'The ReLU activation function keeps positive sums and turns negative sums into 0: ReLU(z) = max(0, z). This introduces nonlinearity.',
  },
  {
    id: 3,
    label: 'Step 4: Output Scores & Softmax',
    summary:
      'Output neurons combine the hidden activations into raw class scores (logits), and Softmax converts those scores into probabilities summing to 100%.',
  },
] as const;

// Deterministic educational weights & biases: 2 inputs -> 3 hidden -> 2 outputs
const W1: readonly (readonly [number, number])[] = [
  [0.8, 0.6],
  [-0.7, 0.9],
  [0.4, -0.5],
];
const B1: readonly [number, number, number] = [-0.2, 0.1, 0.4];

const W2: readonly (readonly [number, number, number])[] = [
  [1.1, -0.8, 0.6],
  [-0.6, 1.2, 0.5],
];
const B2: readonly [number, number] = [-0.1, 0.2];

function relu(z: number): number {
  return Math.max(0, z);
}

function softmax2(z0: number, z1: number): readonly [number, number] {
  const maxZ = Math.max(z0, z1);
  const e0 = Math.exp(z0 - maxZ);
  const e1 = Math.exp(z1 - maxZ);
  const sum = e0 + e1;
  return [e0 / sum, e1 / sum];
}

export default function NeuralNetworkExplorer() {
  const baseId = useId();
  const [x1, setX1] = useState(1.0);
  const [x2, setX2] = useState(0.5);
  const [stepIndex, setStepIndex] = useState(0);

  const forward = useMemo(() => {
    const hiddenPre = W1.map(
      ([w1, w2], idx) => w1 * x1 + w2 * x2 + B1[idx]
    );
    const hiddenAct = hiddenPre.map(relu);
    const outputLogits = W2.map(
      ([u1, u2, u3], idx) =>
        u1 * hiddenAct[0] + u2 * hiddenAct[1] + u3 * hiddenAct[2] + B2[idx]
    );
    const probabilities = softmax2(outputLogits[0], outputLogits[1]);

    return {
      hiddenPre,
      hiddenAct,
      outputLogits,
      probabilities,
    };
  }, [x1, x2]);

  const handleReset = () => {
    setX1(1.0);
    setX2(0.5);
    setStepIndex(0);
  };

  // SVG node coordinates
  const inputCoords = [
    { x: 74, y: 105, label: 'x₁', val: x1 },
    { x: 74, y: 215, label: 'x₂', val: x2 },
  ];
  const hiddenCoords = [
    { x: 240, y: 65, label: 'h₁' },
    { x: 240, y: 160, label: 'h₂' },
    { x: 240, y: 255, label: 'h₃' },
  ];
  const outputCoords = [
    { x: 406, y: 105, label: 'y₁ (Class A)' },
    { x: 406, y: 215, label: 'y₂ (Class B)' },
  ];

  const activeInputToHidden = stepIndex === 1;
  const activeHiddenNodes = stepIndex === 1 || stepIndex === 2;
  const activeHiddenToOutput = stepIndex === 3;

  return (
    <section className="vl-widget" aria-labelledby={`${baseId}-title`}>
      <div className="vl-widget__header">
        <div>
          <p className="vl-widget__eyebrow">
            Interactive Forward-Pass Explorer
          </p>
          <h3 id={`${baseId}-title`} className="vl-widget__title">
            2 → 3 → 2 Feedforward Neural Network Explorer
          </h3>
          <p className="vl-widget__goal">
            <strong>Learning objective:</strong> Step through an actual
            forward pass with fixed weights and biases to see how inputs flow
            through weighted sums, ReLU activations, and Softmax probabilities.
          </p>
        </div>
        <span className="vl-badge vl-badge--amber">
          Simplified educational example (fixed weights)
        </span>
      </div>

      <p className="vl-notice" style={{ marginBottom: '1rem' }}>
        <strong>Scientific honesty note:</strong> This toy network uses fixed,
        hand-chosen parameters to compute a real forward pass. It does{' '}
        <strong>not</strong> train or run backpropagation.
      </p>

      <div className="vl-sim-layout">
        <div className="vl-sim-canvas-wrap">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            <span className="vl-badge vl-badge--accent">
              {STEPS[stepIndex].label}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Step {stepIndex + 1} of {STEPS.length}
            </span>
          </div>

          <svg
            viewBox="0 0 490 320"
            role="img"
            aria-label="Diagram of a 2-input, 3-hidden, 2-output feedforward neural network showing computed values"
            style={{
              width: '100%',
              height: 'auto',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Layer headings */}
            <text
              x={74}
              y={24}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="var(--color-text-secondary)"
            >
              Input (2)
            </text>
            <text
              x={240}
              y={24}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="var(--color-text-secondary)"
            >
              Hidden + ReLU (3)
            </text>
            <text
              x={406}
              y={24}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="var(--color-text-secondary)"
            >
              Output (2)
            </text>

            {/* Input -> Hidden edges */}
            {inputCoords.map((inp, iIdx) =>
              hiddenCoords.map((hid, hIdx) => {
                const weight = W1[hIdx][iIdx];
                return (
                  <line
                    key={`ih-${iIdx}-${hIdx}`}
                    x1={inp.x + 26}
                    y1={inp.y}
                    x2={hid.x - 28}
                    y2={hid.y}
                    stroke={
                      activeInputToHidden
                        ? weight >= 0
                          ? 'var(--color-accent)'
                          : 'var(--color-amber)'
                        : 'var(--color-border-strong)'
                    }
                    strokeWidth={activeInputToHidden ? 2.4 : 1.3}
                    strokeDasharray={weight < 0 ? '4 3' : undefined}
                    opacity={activeInputToHidden ? 0.95 : 0.6}
                  />
                );
              })
            )}

            {/* Hidden -> Output edges */}
            {hiddenCoords.map((hid, hIdx) =>
              outputCoords.map((out, oIdx) => {
                const weight = W2[oIdx][hIdx];
                const isDormant = forward.hiddenAct[hIdx] === 0;
                return (
                  <line
                    key={`ho-${hIdx}-${oIdx}`}
                    x1={hid.x + 28}
                    y1={hid.y}
                    x2={out.x - 28}
                    y2={out.y}
                    stroke={
                      activeHiddenToOutput && !isDormant
                        ? weight >= 0
                          ? 'var(--color-teal)'
                          : 'var(--color-amber)'
                        : 'var(--color-border-strong)'
                    }
                    strokeWidth={
                      activeHiddenToOutput && !isDormant ? 2.5 : 1.3
                    }
                    strokeDasharray={weight < 0 ? '4 3' : undefined}
                    opacity={isDormant ? 0.3 : activeHiddenToOutput ? 0.95 : 0.6}
                  />
                );
              })
            )}

            {/* Input neurons */}
            {inputCoords.map((node) => {
              const highlight = stepIndex === 0 || stepIndex === 1;
              return (
                <g key={node.label}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={26}
                    fill={
                      highlight
                        ? 'var(--color-accent-soft)'
                        : 'var(--color-surface)'
                    }
                    stroke={
                      highlight
                        ? 'var(--color-accent)'
                        : 'var(--color-border-strong)'
                    }
                    strokeWidth={highlight ? 2.5 : 1.5}
                  />
                  <text
                    x={node.x}
                    y={node.y - 4}
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight="700"
                    fill="var(--color-text)"
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 12}
                    textAnchor="middle"
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    fill="var(--color-accent)"
                  >
                    {node.val.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Hidden neurons */}
            {hiddenCoords.map((node, idx) => {
              const zVal = forward.hiddenPre[idx];
              const aVal = forward.hiddenAct[idx];
              const displayVal =
                stepIndex <= 1 ? `z=${zVal.toFixed(2)}` : `a=${aVal.toFixed(2)}`;
              const isInactiveZero = stepIndex >= 2 && aVal === 0;
              return (
                <g key={node.label}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={28}
                    fill={
                      activeHiddenNodes
                        ? isInactiveZero
                          ? 'var(--color-surface-elevated)'
                          : 'var(--color-accent-soft)'
                        : 'var(--color-surface)'
                    }
                    stroke={
                      activeHiddenNodes
                        ? isInactiveZero
                          ? 'var(--color-border-strong)'
                          : 'var(--color-accent)'
                        : 'var(--color-border-strong)'
                    }
                    strokeWidth={activeHiddenNodes ? 2.5 : 1.5}
                  />
                  <text
                    x={node.x}
                    y={node.y - 5}
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight="700"
                    fill="var(--color-text)"
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 11}
                    textAnchor="middle"
                    fontSize="10.2"
                    fontFamily="var(--font-mono)"
                    fill={
                      isInactiveZero
                        ? 'var(--color-text-muted)'
                        : 'var(--color-accent)'
                    }
                  >
                    {displayVal}
                  </text>
                </g>
              );
            })}

            {/* Output neurons */}
            {outputCoords.map((node, idx) => {
              const probPct = (forward.probabilities[idx] * 100).toFixed(1);
              const isWinner =
                forward.probabilities[idx] >= forward.probabilities[1 - idx];
              const highlight = stepIndex === 3;
              return (
                <g key={node.label}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={28}
                    fill={
                      highlight && isWinner
                        ? 'var(--color-teal-soft)'
                        : 'var(--color-surface)'
                    }
                    stroke={
                      highlight && isWinner
                        ? 'var(--color-teal)'
                        : highlight
                        ? 'var(--color-accent)'
                        : 'var(--color-border-strong)'
                    }
                    strokeWidth={highlight ? 2.5 : 1.5}
                  />
                  <text
                    x={node.x}
                    y={node.y - 5}
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight="700"
                    fill="var(--color-text)"
                  >
                    y{idx + 1}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 11}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontFamily="var(--font-mono)"
                    fill={
                      isWinner ? 'var(--color-teal)' : 'var(--color-text-secondary)'
                    }
                  >
                    {probPct}%
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 44}
                    textAnchor="middle"
                    fontSize="10.5"
                    fill="var(--color-text-muted)"
                  >
                    {idx === 0 ? 'Class A' : 'Class B'}
                  </text>
                </g>
              );
            })}
          </svg>

          <p
            style={{
              marginTop: '0.75rem',
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            {STEPS[stepIndex].summary}
          </p>
        </div>

        {/* Controls & Live Math Breakdown */}
        <div className="vl-sim-controls">
          <div className="vl-field">
            <label htmlFor={`${baseId}-x1`}>
              <span>Input x₁</span>
              <span className="vl-mono">{x1.toFixed(2)}</span>
            </label>
            <input
              id={`${baseId}-x1`}
              type="range"
              className="vl-range"
              min={-2}
              max={2}
              step={0.25}
              value={x1}
              onChange={(e) => setX1(Number(e.target.value))}
            />
          </div>

          <div className="vl-field">
            <label htmlFor={`${baseId}-x2`}>
              <span>Input x₂</span>
              <span className="vl-mono">{x2.toFixed(2)}</span>
            </label>
            <input
              id={`${baseId}-x2`}
              type="range"
              className="vl-range"
              min={-2}
              max={2}
              step={0.25}
              value={x2}
              onChange={(e) => setX2(Number(e.target.value))}
            />
          </div>

          <div className="vl-btn-row">
            <button
              type="button"
              className="vl-btn"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            >
              &larr; Step Backward
            </button>
            <button
              type="button"
              className="vl-btn vl-btn--primary"
              disabled={stepIndex === STEPS.length - 1}
              onClick={() =>
                setStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1))
              }
            >
              Step Forward &rarr;
            </button>
            <button type="button" className="vl-btn" onClick={handleReset}>
              Reset
            </button>
          </div>

          {/* Live calculations */}
          <div
            style={{
              padding: '0.9rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              fontSize: '0.84rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
            }}
          >
            <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>
              Calculated Forward-Pass Values
            </p>

            <div>
              <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Hidden layer (Weighted sum → ReLU):
              </p>
              {W1.map(([w1, w2], idx) => (
                <p key={idx} className="vl-mono" style={{ marginTop: '0.2rem' }}>
                  h{idx + 1}: ({w1})({x1.toFixed(2)}) + ({w2})({x2.toFixed(2)}) + (
                  {B1[idx]}) = {forward.hiddenPre[idx].toFixed(2)} → ReLU ={' '}
                  <strong>{forward.hiddenAct[idx].toFixed(2)}</strong>
                </p>
              ))}
            </div>

            <div
              style={{
                paddingTop: '0.45rem',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Output layer (Logits → Softmax probabilities):
              </p>
              {W2.map(([u1, u2, u3], idx) => (
                <p key={idx} className="vl-mono" style={{ marginTop: '0.2rem' }}>
                  y{idx + 1} ({idx === 0 ? 'Class A' : 'Class B'}): ({u1})(
                  {forward.hiddenAct[0].toFixed(2)}) + ({u2})(
                  {forward.hiddenAct[1].toFixed(2)}) + ({u3})(
                  {forward.hiddenAct[2].toFixed(2)}) + ({B2[idx]}) ={' '}
                  {forward.outputLogits[idx].toFixed(2)} →{' '}
                  <strong>
                    {(forward.probabilities[idx] * 100).toFixed(1)}%
                  </strong>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="vl-observe-box">
        <h4>What to observe</h4>
        <ul>
          <li>
            At the default inputs <span className="vl-mono">x₁ = 1.00</span>,{' '}
            <span className="vl-mono">x₂ = 0.50</span>, hidden neuron{' '}
            <span className="vl-mono">h₂</span> has a negative weighted sum (
            <span className="vl-mono">-0.15</span>), so ReLU outputs{' '}
            <span className="vl-mono">0.00</span>—meaning{' '}
            <span className="vl-mono">h₂</span> sends no signal to the output
            layer.
          </li>
          <li>
            Slide <span className="vl-mono">x₁</span> negative and{' '}
            <span className="vl-mono">x₂</span> positive: watch{' '}
            <span className="vl-mono">h₂</span> switch on and shift the output
            probabilities from Class A toward Class B.
          </li>
          <li>
            Notice that Softmax probabilities always stay between 0% and 100%
            and sum to 100%.
          </li>
        </ul>
      </div>
    </section>
  );
}
