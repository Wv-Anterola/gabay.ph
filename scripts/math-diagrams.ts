export type DiagramContext = {
  filePath?: string;
  questionId?: string;
};

type PointSpec = {
  x: number;
  y: number;
  label?: string;
};

type SeriesSpec = {
  label: string;
  values: number[];
};

type TableHighlight = {
  row?: string;
  column?: string;
};

type RatioPart = {
  label: string;
  count: number;
};

export type MathDiagramSpec =
  | {
      kind: "coordinate-line-points";
      xLabel: string;
      yLabel: string;
      points: PointSpec[];
      xDomain?: [number, number];
      yDomain?: [number, number];
      highlightX?: number;
      lineLabel?: string;
    }
  | {
      kind: "circle-inscribed-angle";
      labels: Record<string, string>;
    }
  | {
      kind: "parallel-lines-transversal";
      labels: {
        angleA: string;
        angleB: string;
      };
    }
  | {
      kind: "similar-triangles";
      left: {
        name: string;
        sideLabel: string;
        areaLabel: string;
      };
      right: {
        name: string;
        sideLabel: string;
        areaLabel: string;
      };
    }
  | {
      kind: "grouped-bar-chart";
      yLabel: string;
      categories: string[];
      series: SeriesSpec[];
    }
  | {
      kind: "two-way-table";
      rowHeaders: string[];
      columnHeaders: string[];
      values: number[][];
      highlight?: TableHighlight;
    }
  | {
      kind: "combination-slots";
      totalItems: number;
      choose: number;
      days: number;
      totalCombinations?: number;
      itemLabel: string;
    }
  | {
      kind: "venn-syllogism";
      outerSet: string;
      innerSet: string;
      partialSet: string;
      outsideLabel: string;
    }
  | {
      kind: "rectangle-area";
      widthLabel: string;
      heightLabel: string;
    }
  | {
      kind: "triangle-angle-sum";
      angles: {
        left: string;
        top: string;
        right: string;
      };
    }
  | {
      kind: "right-triangle";
      legA: string;
      legB: string;
      hypotenuse: string;
    }
  | {
      kind: "ratio-parts";
      parts: RatioPart[];
    }
  | {
      kind: "marble-bag";
      items: RatioPart[];
    };

export const MATH_DIAGRAM_KINDS: MathDiagramSpec["kind"][] = [
  "coordinate-line-points",
  "circle-inscribed-angle",
  "parallel-lines-transversal",
  "similar-triangles",
  "grouped-bar-chart",
  "two-way-table",
  "combination-slots",
  "venn-syllogism",
  "rectangle-area",
  "triangle-angle-sum",
  "right-triangle",
  "ratio-parts",
  "marble-bag",
];

export type CoreMathDiagram = {
  questionId: string;
  spec: MathDiagramSpec;
  alt: string;
  caption?: string;
};

export const CORE_MATH_DIAGRAMS: CoreMathDiagram[] = [
  {
    questionId: "math-006",
    alt: "A rectangle labeled 8 cm by 5 cm.",
    caption: "Rectangle dimensions",
    spec: {
      kind: "rectangle-area",
      widthLabel: "8 cm",
      heightLabel: "5 cm",
    },
  },
  {
    questionId: "math-007",
    alt: "A triangle with two angles labeled 50 degrees and 65 degrees and the third angle unknown.",
    caption: "Triangle angle sum",
    spec: {
      kind: "triangle-angle-sum",
      angles: {
        left: "50°",
        top: "65°",
        right: "?",
      },
    },
  },
  {
    questionId: "math-008",
    alt: "A right triangle with legs 6 and 8 and hypotenuse unknown.",
    caption: "Right triangle",
    spec: {
      kind: "right-triangle",
      legA: "8",
      legB: "6",
      hypotenuse: "?",
    },
  },
  {
    questionId: "math-010",
    alt: "A ratio bar showing 3 parts sand and 1 part cement.",
    caption: "Sand to cement ratio",
    spec: {
      kind: "ratio-parts",
      parts: [
        { label: "Sand", count: 3 },
        { label: "Cement", count: 1 },
      ],
    },
  },
  {
    questionId: "math-012",
    alt: "A bag containing 3 red marbles and 5 blue marbles.",
    caption: "Marbles in the bag",
    spec: {
      kind: "marble-bag",
      items: [
        { label: "Red", count: 3 },
        { label: "Blue", count: 5 },
      ],
    },
  },
];

const COLORS = {
  ink: "#5c0a14",
  muted: "#8c5a60",
  line: "#5c0a14",
  soft: "#e7d3d5",
  clay: "#fbf7f7",
  tint: "#f3e6e8",
  strong: "#9e2b25",
  faint: "#fffafa",
  white: "#ffffff",
};

function contextPrefix(context?: DiagramContext): string {
  const parts = [context?.filePath, context?.questionId].filter(Boolean);
  return parts.length ? `${parts.join(" ")}: ` : "";
}

function fail(context: DiagramContext | undefined, message: string): never {
  throw new Error(`${contextPrefix(context)}${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredRecord(
  value: unknown,
  name: string,
  context?: DiagramContext,
): Record<string, unknown> {
  if (!isRecord(value)) fail(context, `${name} must be an object`);
  return value;
}

function requiredString(
  source: Record<string, unknown>,
  key: string,
  context?: DiagramContext,
): string {
  const value = source[key];
  if (typeof value !== "string" || value.trim() === "") {
    fail(context, `${key} must be a non-empty string`);
  }
  return value;
}

function optionalString(
  source: Record<string, unknown>,
  key: string,
  fallback: string,
  context?: DiagramContext,
): string {
  const value = source[key];
  if (value === undefined) return fallback;
  if (typeof value !== "string" || value.trim() === "") {
    fail(context, `${key} must be a non-empty string`);
  }
  return value;
}

function requiredNumber(
  source: Record<string, unknown>,
  key: string,
  context?: DiagramContext,
): number {
  const value = source[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(context, `${key} must be a finite number`);
  }
  return value;
}

function optionalNumber(
  source: Record<string, unknown>,
  key: string,
  context?: DiagramContext,
): number | undefined {
  const value = source[key];
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(context, `${key} must be a finite number`);
  }
  return value;
}

function requiredArray<T>(
  source: Record<string, unknown>,
  key: string,
  context: DiagramContext | undefined,
  mapItem: (item: unknown, index: number) => T,
): T[] {
  const value = source[key];
  if (!Array.isArray(value) || value.length === 0) {
    fail(context, `${key} must be a non-empty array`);
  }
  return value.map(mapItem);
}

function requiredStringArray(
  source: Record<string, unknown>,
  key: string,
  context?: DiagramContext,
): string[] {
  return requiredArray(source, key, context, (item, index) => {
    if (typeof item !== "string" || item.trim() === "") {
      fail(context, `${key}[${index}] must be a non-empty string`);
    }
    return item;
  });
}

function optionalDomain(
  source: Record<string, unknown>,
  key: string,
  context?: DiagramContext,
): [number, number] | undefined {
  const value = source[key];
  if (value === undefined) return undefined;
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    typeof value[0] !== "number" ||
    typeof value[1] !== "number" ||
    !Number.isFinite(value[0]) ||
    !Number.isFinite(value[1]) ||
    value[0] >= value[1]
  ) {
    fail(context, `${key} must be a two-number array with an increasing range`);
  }
  return [value[0], value[1]];
}

function labelsRecord(
  source: Record<string, unknown>,
  key: string,
  context?: DiagramContext,
): Record<string, string> {
  const raw = requiredRecord(source[key], key, context);
  return Object.fromEntries(
    Object.entries(raw).map(([labelKey, value]) => {
      if (typeof value !== "string" || value.trim() === "") {
        fail(context, `${key}.${labelKey} must be a non-empty string`);
      }
      return [labelKey, value];
    }),
  );
}

function pointSpec(item: unknown, index: number, context?: DiagramContext): PointSpec {
  const point = requiredRecord(item, `points[${index}]`, context);
  const result: PointSpec = {
    x: requiredNumber(point, "x", context),
    y: requiredNumber(point, "y", context),
  };
  if (point.label !== undefined) {
    result.label = requiredString(point, "label", context);
  }
  return result;
}

function seriesSpec(item: unknown, index: number, context?: DiagramContext): SeriesSpec {
  const series = requiredRecord(item, `series[${index}]`, context);
  return {
    label: requiredString(series, "label", context),
    values: requiredArray(series, "values", context, (value, valueIndex) => {
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        fail(context, `series[${index}].values[${valueIndex}] must be a non-negative number`);
      }
      return value;
    }),
  };
}

function ratioPart(item: unknown, index: number, key: string, context?: DiagramContext): RatioPart {
  const part = requiredRecord(item, `${key}[${index}]`, context);
  const count = requiredNumber(part, "count", context);
  if (count <= 0 || !Number.isInteger(count)) {
    fail(context, `${key}[${index}].count must be a positive integer`);
  }
  return {
    label: requiredString(part, "label", context),
    count,
  };
}

export function parseMathDiagramSpec(raw: string, context?: DiagramContext): MathDiagramSpec {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    fail(context, `invalid Diagram JSON: ${(error as Error).message}`);
  }
  return normalizeMathDiagramSpec(parsed, context);
}

export function normalizeMathDiagramSpec(
  value: unknown,
  context?: DiagramContext,
): MathDiagramSpec {
  const source = requiredRecord(value, "Diagram", context);
  const kind = requiredString(source, "kind", context);

  if (!MATH_DIAGRAM_KINDS.includes(kind as MathDiagramSpec["kind"])) {
    fail(context, `unknown diagram kind "${kind}"`);
  }

  switch (kind) {
    case "coordinate-line-points": {
      const points = requiredArray(source, "points", context, (item, index) =>
        pointSpec(item, index, context),
      );
      if (points.length < 2) fail(context, "coordinate-line-points requires at least two points");
      return {
        kind,
        xLabel: optionalString(source, "xLabel", "x", context),
        yLabel: optionalString(source, "yLabel", "y", context),
        points,
        xDomain: optionalDomain(source, "xDomain", context),
        yDomain: optionalDomain(source, "yDomain", context),
        highlightX: optionalNumber(source, "highlightX", context),
        lineLabel:
          source.lineLabel === undefined ? undefined : requiredString(source, "lineLabel", context),
      };
    }
    case "circle-inscribed-angle":
      return { kind, labels: labelsRecord(source, "labels", context) };
    case "parallel-lines-transversal": {
      const labels = labelsRecord(source, "labels", context);
      if (!labels.angleA || !labels.angleB) {
        fail(context, "parallel-lines-transversal requires labels.angleA and labels.angleB");
      }
      return { kind, labels: { angleA: labels.angleA, angleB: labels.angleB } };
    }
    case "similar-triangles":
      return {
        kind,
        left: triangleCard(source.left, "left", context),
        right: triangleCard(source.right, "right", context),
      };
    case "grouped-bar-chart": {
      const categories = requiredStringArray(source, "categories", context);
      const series = requiredArray(source, "series", context, (item, index) =>
        seriesSpec(item, index, context),
      );
      if (series.some((item) => item.values.length !== categories.length)) {
        fail(context, "each grouped-bar-chart series must match the category count");
      }
      return {
        kind,
        yLabel: optionalString(source, "yLabel", "Value", context),
        categories,
        series,
      };
    }
    case "two-way-table": {
      const rowHeaders = requiredStringArray(source, "rowHeaders", context);
      const columnHeaders = requiredStringArray(source, "columnHeaders", context);
      const values = requiredArray(source, "values", context, (row, rowIndex) => {
        if (!Array.isArray(row) || row.length !== columnHeaders.length) {
          fail(context, `values[${rowIndex}] must match the column count`);
        }
        return row.map((cell, columnIndex) => {
          if (typeof cell !== "number" || !Number.isFinite(cell)) {
            fail(context, `values[${rowIndex}][${columnIndex}] must be a finite number`);
          }
          return cell;
        });
      });
      if (values.length !== rowHeaders.length) fail(context, "values must match the row count");
      const highlight =
        source.highlight === undefined
          ? undefined
          : tableHighlight(source.highlight, context);
      return { kind, rowHeaders, columnHeaders, values, highlight };
    }
    case "combination-slots": {
      const totalItems = requiredNumber(source, "totalItems", context);
      const choose = requiredNumber(source, "choose", context);
      const days = requiredNumber(source, "days", context);
      const totalCombinations = optionalNumber(source, "totalCombinations", context);
      if (![totalItems, choose, days].every(Number.isInteger)) {
        fail(context, "combination-slots values must be integers");
      }
      if (totalCombinations !== undefined && !Number.isInteger(totalCombinations)) {
        fail(context, "totalCombinations must be an integer");
      }
      if (totalItems <= 0 || choose <= 0 || choose > totalItems || days <= 0) {
        fail(context, "combination-slots values must describe a valid choice count");
      }
      return {
        kind,
        totalItems,
        choose,
        days,
        totalCombinations,
        itemLabel: optionalString(source, "itemLabel", "Products", context),
      };
    }
    case "venn-syllogism":
      return {
        kind,
        outerSet: requiredString(source, "outerSet", context),
        innerSet: requiredString(source, "innerSet", context),
        partialSet: requiredString(source, "partialSet", context),
        outsideLabel: requiredString(source, "outsideLabel", context),
      };
    case "rectangle-area":
      return {
        kind,
        widthLabel: requiredString(source, "widthLabel", context),
        heightLabel: requiredString(source, "heightLabel", context),
      };
    case "triangle-angle-sum": {
      const angles = labelsRecord(source, "angles", context);
      if (!angles.left || !angles.top || !angles.right) {
        fail(context, "triangle-angle-sum requires angles.left, angles.top, and angles.right");
      }
      return { kind, angles: { left: angles.left, top: angles.top, right: angles.right } };
    }
    case "right-triangle":
      return {
        kind,
        legA: requiredString(source, "legA", context),
        legB: requiredString(source, "legB", context),
        hypotenuse: requiredString(source, "hypotenuse", context),
      };
    case "ratio-parts":
      return {
        kind,
        parts: requiredArray(source, "parts", context, (item, index) =>
          ratioPart(item, index, "parts", context),
        ),
      };
    case "marble-bag":
      return {
        kind,
        items: requiredArray(source, "items", context, (item, index) =>
          ratioPart(item, index, "items", context),
        ),
      };
    default:
      fail(context, `unsupported diagram kind "${kind}"`);
  }
}

function triangleCard(
  value: unknown,
  key: string,
  context?: DiagramContext,
): { name: string; sideLabel: string; areaLabel: string } {
  const source = requiredRecord(value, key, context);
  return {
    name: requiredString(source, "name", context),
    sideLabel: requiredString(source, "sideLabel", context),
    areaLabel: requiredString(source, "areaLabel", context),
  };
}

function tableHighlight(value: unknown, context?: DiagramContext): TableHighlight {
  const source = requiredRecord(value, "highlight", context);
  return {
    row: source.row === undefined ? undefined : requiredString(source, "row", context),
    column: source.column === undefined ? undefined : requiredString(source, "column", context),
  };
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function text(
  x: number,
  y: number,
  value: string,
  {
    size = 18,
    weight = 600,
    anchor = "middle",
    fill = COLORS.ink,
    rotate,
  }: {
    size?: number;
    weight?: number;
    anchor?: "start" | "middle" | "end";
    fill?: string;
    rotate?: number;
  } = {},
): string {
  const transform = rotate === undefined ? "" : ` transform="rotate(${rotate} ${x} ${y})"`;
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}"${transform}>${escapeXml(value)}</text>`;
}

function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  {
    stroke = COLORS.line,
    width = 3,
    dash,
  }: { stroke?: string; width?: number; dash?: string } = {},
): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
}

function circle(
  cx: number,
  cy: number,
  r: number,
  {
    fill = COLORS.white,
    stroke = COLORS.line,
    width = 3,
  }: { fill?: string; stroke?: string; width?: number } = {},
): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
}

type SvgPoint = { x: number; y: number };

function point(x: number, y: number): SvgPoint {
  return { x, y };
}

function formatCoord(value: number): string {
  return Number(value.toFixed(2)).toString();
}

function pointOnRay(vertex: SvgPoint, through: SvgPoint, distance: number): SvgPoint {
  const dx = through.x - vertex.x;
  const dy = through.y - vertex.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) throw new Error("Angle ray cannot have zero length");
  return {
    x: vertex.x + (dx / length) * distance,
    y: vertex.y + (dy / length) * distance,
  };
}

function angleArc(
  vertex: SvgPoint,
  from: SvgPoint,
  to: SvgPoint,
  radius: number,
  {
    sweep = 0,
    stroke = COLORS.strong,
    width = 3,
  }: {
    sweep?: 0 | 1;
    stroke?: string;
    width?: number;
  } = {},
): string {
  const start = pointOnRay(vertex, from, radius);
  const end = pointOnRay(vertex, to, radius);
  return `<path d="M ${formatCoord(start.x)} ${formatCoord(start.y)} A ${radius} ${radius} 0 0 ${sweep} ${formatCoord(end.x)} ${formatCoord(end.y)}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
}

function svg(title: string, desc: string, content: string): string {
  const output = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(desc)}</desc>
  <rect width="640" height="360" rx="18" fill="${COLORS.white}"/>
  <rect x="16" y="16" width="608" height="328" rx="14" fill="${COLORS.faint}" stroke="${COLORS.soft}" stroke-width="2"/>
  ${content}
</svg>
`;
  if (/<script/i.test(output)) fail(undefined, "diagram output must not contain scripts");
  return output;
}

export function renderMathDiagram(
  spec: MathDiagramSpec,
  context: DiagramContext = {},
): string {
  switch (spec.kind) {
    case "coordinate-line-points":
      return renderCoordinateLinePoints(spec, context);
    case "circle-inscribed-angle":
      return renderCircleInscribedAngle(spec, context);
    case "parallel-lines-transversal":
      return renderParallelLinesTransversal(spec, context);
    case "similar-triangles":
      return renderSimilarTriangles(spec, context);
    case "grouped-bar-chart":
      return renderGroupedBarChart(spec, context);
    case "two-way-table":
      return renderTwoWayTable(spec, context);
    case "combination-slots":
      return renderCombinationSlots(spec, context);
    case "venn-syllogism":
      return renderVennSyllogism(spec, context);
    case "rectangle-area":
      return renderRectangleArea(spec, context);
    case "triangle-angle-sum":
      return renderTriangleAngleSum(spec, context);
    case "right-triangle":
      return renderRightTriangle(spec, context);
    case "ratio-parts":
      return renderRatioParts(spec, context);
    case "marble-bag":
      return renderMarbleBag(spec, context);
    default:
      fail(context, "unsupported diagram kind");
  }
}

function diagramTitle(spec: MathDiagramSpec, context: DiagramContext): string {
  return `${context.questionId ?? "Question"} ${spec.kind}`;
}

function renderCoordinateLinePoints(
  spec: Extract<MathDiagramSpec, { kind: "coordinate-line-points" }>,
  context: DiagramContext,
): string {
  const left = 94;
  const right = 570;
  const top = 54;
  const bottom = 286;
  const xValues = spec.points.map((point) => point.x).concat(spec.highlightX ?? []);
  const yValues = spec.points.map((point) => point.y);
  const xMin = spec.xDomain?.[0] ?? Math.min(...xValues);
  const xMax = spec.xDomain?.[1] ?? Math.max(...xValues);
  const yMin = spec.yDomain?.[0] ?? Math.min(...yValues, 0);
  const yMax = spec.yDomain?.[1] ?? Math.max(...yValues);
  const xScale = (value: number) => left + ((value - xMin) / (xMax - xMin)) * (right - left);
  const yScale = (value: number) => bottom - ((value - yMin) / (yMax - yMin)) * (bottom - top);
  const sorted = [...spec.points].sort((a, b) => a.x - b.x);
  const polyline = sorted.map((point) => `${xScale(point.x)},${yScale(point.y)}`).join(" ");
  const highlighted = spec.highlightX === undefined
    ? undefined
    : spec.points.find((point) => point.x === spec.highlightX);

  const content = `
  ${line(left, bottom, right, bottom)}
  ${line(left, bottom, left, top)}
  ${text((left + right) / 2, 330, spec.xLabel, { size: 16, weight: 700 })}
  ${text(32, (top + bottom) / 2, spec.yLabel, { size: 16, weight: 700, rotate: -90 })}
  ${text(left, bottom + 25, String(xMin), { size: 13, weight: 600, fill: COLORS.muted })}
  ${text(right, bottom + 25, String(xMax), { size: 13, weight: 600, fill: COLORS.muted })}
  ${text(left - 18, bottom + 4, String(yMin), { size: 13, weight: 600, anchor: "end", fill: COLORS.muted })}
  ${text(left - 18, top + 4, String(yMax), { size: 13, weight: 600, anchor: "end", fill: COLORS.muted })}
  <polyline points="${polyline}" fill="none" stroke="${COLORS.strong}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  ${highlighted ? line(xScale(highlighted.x), bottom, xScale(highlighted.x), yScale(highlighted.y), { stroke: COLORS.strong, width: 2, dash: "7 7" }) : ""}
  ${spec.points
    .map((point) => {
      const x = xScale(point.x);
      const y = yScale(point.y);
      return `${circle(x, y, 7, { fill: COLORS.strong, stroke: COLORS.white, width: 3 })}
  ${point.label ? text(x, y - 14, point.label, { size: 14, weight: 700 }) : ""}`;
    })
    .join("\n")}
  ${spec.lineLabel ? text(430, 88, spec.lineLabel, { size: 15, weight: 700, fill: COLORS.strong }) : ""}
  `;

  return svg(
    diagramTitle(spec, context),
    "A coordinate grid showing a linear relationship through labeled points.",
    content,
  );
}

function renderCircleInscribedAngle(
  spec: Extract<MathDiagramSpec, { kind: "circle-inscribed-angle" }>,
  context: DiagramContext,
): string {
  const labels = {
    center: "O",
    pointA: "A",
    pointB: "B",
    pointC: "C",
    inscribedAngle: "x°",
    centralAngle: "2x°",
    targetAngle: "?",
    ...spec.labels,
  };
  const a = point(320, 58);
  const b = point(236, 258);
  const c = point(404, 258);
  const o = point(320, 174);
  const content = `
  ${circle(320, 174, 118, { fill: COLORS.white, stroke: COLORS.line, width: 4 })}
  ${line(o.x, o.y, b.x, b.y)}
  ${line(o.x, o.y, c.x, c.y)}
  ${line(a.x, a.y, b.x, b.y, { stroke: COLORS.strong })}
  ${line(a.x, a.y, c.x, c.y, { stroke: COLORS.strong })}
  ${line(b.x, b.y, c.x, c.y, { stroke: COLORS.soft, width: 3 })}
  ${angleArc(a, b, c, 36, { sweep: 0 })}
  ${angleArc(o, b, c, 42, { sweep: 0 })}
  ${angleArc(b, c, o, 36, { sweep: 0 })}
  ${circle(o.x, o.y, 5, { fill: COLORS.strong, stroke: COLORS.strong, width: 1 })}
  ${circle(a.x, a.y, 5, { fill: COLORS.strong, stroke: COLORS.strong, width: 1 })}
  ${circle(b.x, b.y, 5, { fill: COLORS.strong, stroke: COLORS.strong, width: 1 })}
  ${circle(c.x, c.y, 5, { fill: COLORS.strong, stroke: COLORS.strong, width: 1 })}
  ${text(320, 168, labels.center, { size: 18 })}
  ${text(320, 40, labels.pointA, { size: 18 })}
  ${text(217, 287, labels.pointB, { size: 18 })}
  ${text(427, 287, labels.pointC, { size: 18 })}
  ${text(320, 129, labels.inscribedAngle, { size: 17, fill: COLORS.strong })}
  ${text(320, 238, labels.centralAngle, { size: 17, fill: COLORS.strong })}
  ${text(320, 324, labels.targetAngle, { size: 16, fill: COLORS.strong })}
  `;
  return svg(
    diagramTitle(spec, context),
    "A circle with an inscribed angle, central angle, and radii from the center.",
    content,
  );
}

function renderParallelLinesTransversal(
  spec: Extract<MathDiagramSpec, { kind: "parallel-lines-transversal" }>,
  context: DiagramContext,
): string {
  const topLeft = point(110, 118);
  const topRight = point(530, 118);
  const bottomLeft = point(110, 242);
  const bottomRight = point(530, 242);
  const transTop = point(246, 58);
  const transBottom = point(402, 302);
  const topVertex = point(284, 118);
  const bottomVertex = point(364, 242);
  const content = `
  ${line(topLeft.x, topLeft.y, topRight.x, topRight.y, { width: 5 })}
  ${line(bottomLeft.x, bottomLeft.y, bottomRight.x, bottomRight.y, { width: 5 })}
  ${line(transTop.x, transTop.y, transBottom.x, transBottom.y, { stroke: COLORS.strong, width: 5 })}
  ${angleArc(topVertex, topLeft, transBottom, 42, { sweep: 0, width: 4 })}
  ${angleArc(bottomVertex, transTop, bottomLeft, 42, { sweep: 1, width: 4 })}
  ${text(246, 154, spec.labels.angleA, { size: 20, fill: COLORS.strong })}
  ${text(296, 216, spec.labels.angleB, { size: 20, fill: COLORS.strong })}
  `;
  return svg(
    diagramTitle(spec, context),
    "Two parallel lines cut by a transversal with same-side interior angles labeled.",
    content,
  );
}

function renderSimilarTriangles(
  spec: Extract<MathDiagramSpec, { kind: "similar-triangles" }>,
  context: DiagramContext,
): string {
  const small = "130,250 245,250 162,126";
  const large = "350,260 540,260 405,78";
  const content = `
  <polygon points="${small}" fill="${COLORS.white}" stroke="${COLORS.line}" stroke-width="4" stroke-linejoin="round"/>
  <polygon points="${large}" fill="${COLORS.tint}" stroke="${COLORS.line}" stroke-width="4" stroke-linejoin="round"/>
  ${text(185, 104, spec.left.areaLabel, { size: 16, fill: COLORS.muted })}
  ${text(445, 56, spec.right.areaLabel, { size: 16, fill: COLORS.muted })}
  ${text(185, 285, spec.left.name, { size: 20 })}
  ${text(187, 242, spec.left.sideLabel, { size: 17, fill: COLORS.strong })}
  ${text(445, 295, spec.right.name, { size: 20 })}
  ${text(445, 252, spec.right.sideLabel, { size: 17, fill: COLORS.strong })}
  `;
  return svg(
    diagramTitle(spec, context),
    "Two similar triangles with corresponding side and area labels.",
    content,
  );
}

function renderGroupedBarChart(
  spec: Extract<MathDiagramSpec, { kind: "grouped-bar-chart" }>,
  context: DiagramContext,
): string {
  const chartLeft = 95;
  const chartBottom = 275;
  const chartHeight = 205;
  const maxValue = Math.max(...spec.series.flatMap((series) => series.values), 1);
  const groupWidth = 150;
  const barWidth = 28;
  const seriesGap = 8;
  const totalBarWidth = spec.series.length * barWidth + (spec.series.length - 1) * seriesGap;
  const fills = [COLORS.strong, COLORS.muted, COLORS.line];
  const bars = spec.categories
    .map((category, categoryIndex) => {
      const groupX = chartLeft + categoryIndex * groupWidth + 70;
      return `${spec.series
        .map((series, seriesIndex) => {
          const value = series.values[categoryIndex];
          const height = (value / maxValue) * chartHeight;
          const x = groupX - totalBarWidth / 2 + seriesIndex * (barWidth + seriesGap);
          const y = chartBottom - height;
          return `<rect x="${x}" y="${y}" width="${barWidth}" height="${height}" rx="4" fill="${fills[seriesIndex % fills.length]}"/>
  ${text(x + barWidth / 2, y - 8, String(value), { size: 13, weight: 700 })}`;
        })
        .join("\n")}
  ${text(groupX, chartBottom + 26, category, { size: 15, weight: 700 })}`;
    })
    .join("\n");
  const legend = spec.series
    .map((series, index) => {
      const y = 42 + index * 24;
      return `<rect x="410" y="${y}" width="14" height="14" rx="3" fill="${fills[index % fills.length]}"/>
  ${text(432, y + 13, series.label, { size: 13, anchor: "start", fill: COLORS.muted })}`;
    })
    .join("\n");
  const content = `
  ${line(chartLeft, chartBottom, 555, chartBottom)}
  ${line(chartLeft, chartBottom, chartLeft, 56)}
  ${text(36, 170, spec.yLabel, { size: 15, rotate: -90, fill: COLORS.muted })}
  ${legend}
  ${bars}
  `;
  return svg(
    diagramTitle(spec, context),
    "A grouped bar chart comparing two data series across categories.",
    content,
  );
}

function renderTwoWayTable(
  spec: Extract<MathDiagramSpec, { kind: "two-way-table" }>,
  context: DiagramContext,
): string {
  const x = 92;
  const y = 72;
  const cellW = 132;
  const cellH = 56;
  const rows = ["", ...spec.columnHeaders];
  const header = rows
    .map((label, index) => tableCell(x + index * cellW, y, cellW, cellH, label, true, false))
    .join("\n");
  const body = spec.rowHeaders
    .map((row, rowIndex) => {
      const rowY = y + (rowIndex + 1) * cellH;
      const cells = [
        tableCell(x, rowY, cellW, cellH, row, true, false),
        ...spec.columnHeaders.map((column, columnIndex) => {
          const highlighted = spec.highlight?.row === row || spec.highlight?.column === column;
          return tableCell(
            x + (columnIndex + 1) * cellW,
            rowY,
            cellW,
            cellH,
            String(spec.values[rowIndex][columnIndex]),
            false,
            highlighted,
          );
        }),
      ];
      return cells.join("\n");
    })
    .join("\n");
  const content = `
  ${header}
  ${body}
  ${text(320, 292, "Use the condition first, then count favorable cases.", {
    size: 15,
    fill: COLORS.muted,
  })}
  `;
  return svg(
    diagramTitle(spec, context),
    "A two-way table for conditional probability.",
    content,
  );
}

function tableCell(
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  header: boolean,
  highlighted: boolean,
): string {
  const fill = highlighted ? COLORS.tint : header ? COLORS.clay : COLORS.white;
  const weight = header ? 700 : 650;
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${COLORS.soft}" stroke-width="2"/>
  ${text(x + width / 2, y + height / 2 + 6, label, { size: 16, weight })}`;
}

function renderCombinationSlots(
  spec: Extract<MathDiagramSpec, { kind: "combination-slots" }>,
  context: DiagramContext,
): string {
  const itemW = 68;
  const items = Array.from({ length: spec.totalItems }, (_, index) => {
    const x = 92 + index * 86;
    return `<rect x="${x}" y="78" width="${itemW}" height="44" rx="8" fill="${COLORS.white}" stroke="${COLORS.soft}" stroke-width="2"/>
  ${text(x + itemW / 2, 106, `${spec.itemLabel.slice(0, 1)}${index + 1}`, { size: 16 })}`;
  }).join("\n");
  const slots = Array.from({ length: spec.choose }, (_, index) => {
    const x = 188 + index * 92;
    return `<rect x="${x}" y="174" width="72" height="52" rx="8" fill="${COLORS.tint}" stroke="${COLORS.line}" stroke-width="2"/>
  ${text(x + 36, 207, "slot", { size: 14, fill: COLORS.muted })}`;
  }).join("\n");
  const combinationsLabel =
    spec.totalCombinations === undefined
      ? `C(${spec.totalItems}, ${spec.choose}) possible sets`
      : `C(${spec.totalItems}, ${spec.choose}) = ${spec.totalCombinations} sets`;
  const content = `
  ${items}
  ${line(320, 134, 320, 164, { stroke: COLORS.muted, width: 2, dash: "5 5" })}
  ${slots}
  ${text(320, 260, combinationsLabel, {
    size: 20,
    fill: COLORS.strong,
  })}
  ${text(320, 292, `${spec.days} days available`, { size: 16, fill: COLORS.muted })}
  `;
  return svg(
    diagramTitle(spec, context),
    "A combination diagram showing items chosen into display slots.",
    content,
  );
}

function renderVennSyllogism(
  spec: Extract<MathDiagramSpec, { kind: "venn-syllogism" }>,
  context: DiagramContext,
): string {
  const content = `
  <ellipse cx="305" cy="178" rx="178" ry="118" fill="${COLORS.white}" stroke="${COLORS.line}" stroke-width="4"/>
  <ellipse cx="278" cy="178" rx="74" ry="48" fill="${COLORS.tint}" stroke="${COLORS.strong}" stroke-width="3"/>
  <ellipse cx="422" cy="202" rx="116" ry="66" fill="none" stroke="${COLORS.muted}" stroke-width="4" stroke-dasharray="9 8"/>
  <path d="M455 155 C530 166 558 230 500 263" fill="none" stroke="${COLORS.strong}" stroke-width="5" stroke-linecap="round"/>
  ${text(305, 95, spec.outerSet, { size: 20 })}
  ${text(278, 184, spec.innerSet, { size: 17, fill: COLORS.strong })}
  ${text(422, 206, spec.partialSet, { size: 17, fill: COLORS.muted })}
  ${text(496, 288, spec.outsideLabel, { size: 15, fill: COLORS.strong })}
  `;
  return svg(
    diagramTitle(spec, context),
    "A Venn diagram showing one set inside another and a partially overlapping set.",
    content,
  );
}

function renderRectangleArea(
  spec: Extract<MathDiagramSpec, { kind: "rectangle-area" }>,
  context: DiagramContext,
): string {
  const content = `
  <rect x="170" y="92" width="300" height="170" rx="6" fill="${COLORS.tint}" stroke="${COLORS.line}" stroke-width="4"/>
  ${text(320, 296, spec.widthLabel, { size: 20, fill: COLORS.strong })}
  ${text(132, 178, spec.heightLabel, { size: 20, fill: COLORS.strong, rotate: -90 })}
  ${text(320, 183, "Area = length × width", { size: 20, fill: COLORS.muted })}
  `;
  return svg(
    diagramTitle(spec, context),
    "A rectangle with length and width labels.",
    content,
  );
}

function renderTriangleAngleSum(
  spec: Extract<MathDiagramSpec, { kind: "triangle-angle-sum" }>,
  context: DiagramContext,
): string {
  const content = `
  <polygon points="145,265 495,265 302,75" fill="${COLORS.white}" stroke="${COLORS.line}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M178 265 Q186 237 210 220" fill="none" stroke="${COLORS.strong}" stroke-width="4" stroke-linecap="round"/>
  <path d="M283 94 Q306 110 329 95" fill="none" stroke="${COLORS.strong}" stroke-width="4" stroke-linecap="round"/>
  <path d="M458 265 Q446 234 419 219" fill="none" stroke="${COLORS.strong}" stroke-width="4" stroke-linecap="round"/>
  ${text(207, 248, spec.angles.left, { size: 19, fill: COLORS.strong })}
  ${text(304, 130, spec.angles.top, { size: 19, fill: COLORS.strong })}
  ${text(431, 248, spec.angles.right, { size: 19, fill: COLORS.strong })}
  ${text(320, 310, "Angles sum to 180°", { size: 17, fill: COLORS.muted })}
  `;
  return svg(
    diagramTitle(spec, context),
    "A triangle with two known angles and one unknown angle.",
    content,
  );
}

function renderRightTriangle(
  spec: Extract<MathDiagramSpec, { kind: "right-triangle" }>,
  context: DiagramContext,
): string {
  const content = `
  <polygon points="170,265 500,265 500,90" fill="${COLORS.white}" stroke="${COLORS.line}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M500 238 L472 238 L472 265" fill="none" stroke="${COLORS.strong}" stroke-width="3"/>
  ${text(335, 296, spec.legA, { size: 20, fill: COLORS.strong })}
  ${text(534, 184, spec.legB, { size: 20, fill: COLORS.strong, rotate: -90 })}
  ${text(314, 160, spec.hypotenuse, { size: 22, fill: COLORS.strong })}
  ${text(320, 320, "a² + b² = c²", { size: 17, fill: COLORS.muted })}
  `;
  return svg(
    diagramTitle(spec, context),
    "A right triangle with two legs and the hypotenuse labeled.",
    content,
  );
}

function renderRatioParts(
  spec: Extract<MathDiagramSpec, { kind: "ratio-parts" }>,
  context: DiagramContext,
): string {
  const total = spec.parts.reduce((sum, part) => sum + part.count, 0);
  let cursor = 125;
  const width = 390;
  const fills = [COLORS.tint, COLORS.white, COLORS.clay];
  const segments = spec.parts
    .map((part, index) => {
      const partWidth = (part.count / total) * width;
      const x = cursor;
      cursor += partWidth;
      return `<rect x="${x}" y="126" width="${partWidth}" height="82" fill="${fills[index % fills.length]}" stroke="${COLORS.line}" stroke-width="3"/>
  ${text(x + partWidth / 2, 174, `${part.label} ×${part.count}`, {
    size: 17,
    fill: index === 0 ? COLORS.strong : COLORS.muted,
  })}`;
    })
    .join("\n");
  const ratio = spec.parts.map((part) => part.count).join(":");
  const content = `
  ${segments}
  ${text(320, 245, `Ratio ${ratio}`, { size: 22, fill: COLORS.strong })}
  ${text(320, 278, "Equal-size parts represent the mix.", { size: 15, fill: COLORS.muted })}
  `;
  return svg(
    diagramTitle(spec, context),
    "A ratio bar split into labeled parts.",
    content,
  );
}

function renderMarbleBag(
  spec: Extract<MathDiagramSpec, { kind: "marble-bag" }>,
  context: DiagramContext,
): string {
  const marblePositions = [
    [252, 166],
    [294, 154],
    [336, 168],
    [376, 153],
    [236, 214],
    [280, 222],
    [326, 216],
    [374, 220],
    [416, 202],
    [216, 184],
  ];
  const fills = [COLORS.strong, COLORS.muted, COLORS.tint];
  let positionIndex = 0;
  const marbles = spec.items
    .flatMap((item, itemIndex) =>
      Array.from({ length: item.count }, () => {
        const [cx, cy] = marblePositions[positionIndex % marblePositions.length];
        positionIndex += 1;
        return circle(cx, cy, 16, {
          fill: fills[itemIndex % fills.length],
          stroke: COLORS.white,
          width: 3,
        });
      }),
    )
    .join("\n");
  const legend = spec.items
    .map((item, index) => {
      const x = 190 + index * 130;
      return `${circle(x, 286, 8, { fill: fills[index % fills.length], stroke: COLORS.white, width: 2 })}
  ${text(x + 18, 291, `${item.count} ${item.label}`, { size: 15, anchor: "start", fill: COLORS.muted })}`;
    })
    .join("\n");
  const content = `
  <path d="M218 110 C235 72 405 72 422 110 L462 254 C416 288 232 288 178 254 Z" fill="${COLORS.white}" stroke="${COLORS.line}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M232 111 C260 132 383 132 410 111" fill="none" stroke="${COLORS.soft}" stroke-width="4" stroke-linecap="round"/>
  ${marbles}
  ${legend}
  `;
  return svg(
    diagramTitle(spec, context),
    "A bag with colored marbles and a count legend.",
    content,
  );
}
