import { describe, expect, it } from "vitest";
import {
  MATH_DIAGRAM_KINDS,
  normalizeMathDiagramSpec,
  renderMathDiagram,
  type MathDiagramSpec,
} from "./math-diagrams";

const TEMPLATE_SAMPLES: Array<{ spec: MathDiagramSpec; label: string }> = [
  {
    label: "(15, 25)",
    spec: {
      kind: "coordinate-line-points",
      xLabel: "Pieces",
      yLabel: "Cost",
      points: [
        { x: 15, y: 25, label: "(15, 25)" },
        { x: 27, y: 40, label: "(27, 40)" },
      ],
    },
  },
  {
    label: "x°",
    spec: {
      kind: "circle-inscribed-angle",
      labels: { inscribedAngle: "x°", centralAngle: "2x°" },
    },
  },
  {
    label: "3x°",
    spec: {
      kind: "parallel-lines-transversal",
      labels: { angleA: "3x°", angleB: "x + 40°" },
    },
  },
  {
    label: "ABC",
    spec: {
      kind: "similar-triangles",
      left: { name: "ABC", sideLabel: "AB = 6", areaLabel: "Area = 24" },
      right: { name: "DEF", sideLabel: "DE = 9", areaLabel: "Area = ?" },
    },
  },
  {
    label: "Restaurant X",
    spec: {
      kind: "grouped-bar-chart",
      yLabel: "Profit",
      categories: ["April", "May"],
      series: [
        { label: "Restaurant X", values: [30, 40] },
        { label: "Restaurant Y", values: [40, 50] },
      ],
    },
  },
  {
    label: "Smokers",
    spec: {
      kind: "two-way-table",
      rowHeaders: ["Smokers", "Non-smokers"],
      columnHeaders: ["Male", "Female"],
      values: [
        [25, 11],
        [75, 89],
      ],
      highlight: { column: "Male" },
    },
  },
  {
    label: "C(5, 3)",
    spec: {
      kind: "combination-slots",
      totalItems: 5,
      choose: 3,
      days: 8,
      itemLabel: "Product",
    },
  },
  {
    label: "Clowns",
    spec: {
      kind: "venn-syllogism",
      outerSet: "Funny",
      innerSet: "Clowns",
      partialSet: "Mascots",
      outsideLabel: "Not funny mascots",
    },
  },
  {
    label: "8 cm",
    spec: { kind: "rectangle-area", widthLabel: "8 cm", heightLabel: "5 cm" },
  },
  {
    label: "50°",
    spec: {
      kind: "triangle-angle-sum",
      angles: { left: "50°", top: "65°", right: "?" },
    },
  },
  {
    label: "a² + b² = c²",
    spec: { kind: "right-triangle", legA: "8", legB: "6", hypotenuse: "?" },
  },
  {
    label: "Ratio 3:1",
    spec: {
      kind: "ratio-parts",
      parts: [
        { label: "Sand", count: 3 },
        { label: "Cement", count: 1 },
      ],
    },
  },
  {
    label: "3 Red",
    spec: {
      kind: "marble-bag",
      items: [
        { label: "Red", count: 3 },
        { label: "Blue", count: 5 },
      ],
    },
  },
];

describe("math diagram templates", () => {
  it("has a rendering sample for every registered kind", () => {
    expect(TEMPLATE_SAMPLES.map((sample) => sample.spec.kind).sort()).toEqual(
      [...MATH_DIAGRAM_KINDS].sort(),
    );
  });

  it.each(TEMPLATE_SAMPLES)("renders $spec.kind as a safe standalone svg", ({ spec, label }) => {
    const svg = renderMathDiagram(spec, { questionId: "sample-question" });
    expect(svg).toContain("<svg");
    expect(svg).toContain('viewBox="0 0 640 360"');
    expect(svg).toContain(label);
    expect(svg.toLowerCase()).not.toContain("<script");
  });

  it("rejects an unknown diagram kind", () => {
    expect(() =>
      normalizeMathDiagramSpec({ kind: "raw-svg", svg: "<svg />" }, { questionId: "q" }),
    ).toThrow(/unknown diagram kind/);
  });

  it("draws angle markers as arcs bound to their rays", () => {
    const circleSvg = renderMathDiagram(
      {
        kind: "circle-inscribed-angle",
        labels: { inscribedAngle: "x°", centralAngle: "2x°" },
      },
      { questionId: "circle" },
    );
    const parallelSvg = renderMathDiagram(
      {
        kind: "parallel-lines-transversal",
        labels: { angleA: "3x°", angleB: "x + 40°" },
      },
      { questionId: "parallel" },
    );

    expect(circleSvg).toMatch(/<path d="M [^"]+ A 36 36/);
    expect(circleSvg).toMatch(/<path d="M [^"]+ A 42 42/);
    expect(parallelSvg.match(/ A 42 42 /g)).toHaveLength(2);
    expect(`${circleSvg}\n${parallelSvg}`).not.toContain(" Q");
  });
});
