import type { CSSProperties } from "react";

// The hero material from landing.pen sW37g / kE8Eu, rebuilt in CSS (design.md › techy + brand
// mesh): a blueprint grid faded toward the edges, a blue/lime mesh rising behind the product and
// a light grain. Colours are tokens; their transparency comes from color-mix().
// Brand colours through their semantic tokens; the mesh shades below have no semantic token
// (landing exception, plan.md › Token mapping).
const BLUE = "var(--color-semantic-action-primary)";
const LIME = "var(--color-semantic-accent-highlight)";
const tint = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${String(percent)}%, transparent)`;

const GRID_LINE = tint(BLUE, 7);
const GRID: CSSProperties = {
  backgroundImage: `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
  backgroundSize: "var(--landing-cell) var(--landing-cell)",
  maskImage:
    "radial-gradient(ellipse 70% 58% at 50% 30%, black 30%, transparent 80%), linear-gradient(to bottom, transparent, black 120px)",
  maskComposite: "intersect",
};

const MESH: CSSProperties = {
  backgroundImage: [
    `radial-gradient(55% 60% at 0% 100%, ${tint("var(--color-primitive-blue-700)", 95)}, transparent 70%)`,
    `radial-gradient(45% 55% at 25% 92%, ${tint(BLUE, 85)}, transparent 75%)`,
    `radial-gradient(40% 45% at 22% 55%, ${tint("var(--color-primitive-blue-450)", 35)}, transparent 75%)`,
    `radial-gradient(55% 60% at 100% 100%, ${tint(LIME, 100)}, transparent 70%)`,
    `radial-gradient(45% 55% at 76% 92%, ${tint("var(--color-primitive-lime-400)", 70)}, transparent 75%)`,
    `radial-gradient(40% 45% at 82% 52%, ${tint(LIME, 30)}, transparent 75%)`,
  ].join(", "),
};

const GRAIN: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
};

// Grid cells and nodes as [column, row]; positions follow the grid, so they line up at any width.
const CELLS = [
  [3, 2, BLUE, 5],
  [20, 1, LIME, 15],
  [21, 3, BLUE, 5],
  [2, 6, LIME, 10],
] as const;
const NODES = [
  [5, 2, BLUE, 40],
  [19, 2, BLUE, 40],
  [22, 4, LIME, 100],
  [3, 5, LIME, 100],
] as const;

const at = (column: number, row: number): CSSProperties => ({
  left: `calc(var(--landing-cell) * ${String(column)})`,
  top: `calc(var(--landing-cell) * ${String(row)})`,
});

/**
 * The decorative hero background; hidden from assistive tech and pointer events.
 * @returns the backdrop layers
 */
export function LandingBackdrop() {
  return (
    <div
      aria-hidden="true"
      data-testid="landing-backdrop"
      className="pointer-events-none absolute inset-0 [--landing-cell:40px] md:[--landing-cell:56px]"
    >
      <div className="absolute inset-0" style={GRID}>
        {CELLS.map(([column, row, color, percent]) => (
          <span
            key={`${String(column)}-${String(row)}`}
            className="absolute size-(--landing-cell)"
            style={{ ...at(column, row), background: tint(color, percent) }}
          />
        ))}
        {NODES.map(([column, row, color, percent]) => (
          <span
            key={`${String(column)}-${String(row)}`}
            className="absolute hidden size-[5px] -translate-x-1/2 -translate-y-1/2 md:block"
            style={{ ...at(column, row), background: tint(color, percent) }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 top-[37%] bottom-0 md:top-[27%]" style={MESH} />
      <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" style={GRAIN} />
    </div>
  );
}
