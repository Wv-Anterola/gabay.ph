import type {
  MockExamResult,
  ModuleScore,
  UpgAdmissionStanding,
  UpgConfidence,
  UpgDrivers,
  UpgEstimate,
  UpgReadinessBand,
} from "@/lib/types";

type BadgeTone = "teal" | "mango" | "berry";

/** Per-section impact on the estimated UPG. */
export type UpgSectionImpact = "high" | "moderate" | "low";

/**
 * Estimated UPG (University Predicted Grade) predictor — MVP.
 *
 * IMPORTANT: UP does not publicly disclose the official UPG formula. This is an
 * ESTIMATE calibrated from weighted mock performance, deliberately presented as
 * a range and clearly labelled as unofficial. Like the rest of scoring it is
 * deterministic: the same inputs always yield the same estimate (no randomness,
 * no network). The linear mapping below is a placeholder for a future
 * calibrated model — keep it pure and easy to swap.
 *
 * Lower UPG is better. Weighted mock performance maps linearly across the full
 * official 1.00–5.00 grade scale:  upg = 5.00 - (weightedScore * 4.00),
 * clamped to [1.00, 5.00]. A perfect mock → 1.00; an empty/near-zero mock →
 * 5.00; chance-level (~0.25 on 4-choice items) → ~4.00. This is intentionally
 * NOT lenient: weak performance should read as weak.
 */

export const UPG_MIN = 1.0;
/** The official failing floor. Weak performance rises to here. */
export const UPG_MAX = 5.0;
export const UPG_INTERCEPT = 5.0;
export const UPG_SLOPE = 4.0;

/**
 * The appeal line. UP admits roughly 10–15% of applicants; borderline scores
 * around 2.8 typically go to appeal. We treat this as the practical "still in
 * contention" boundary (lower UPG = better). NOTE: the lenient point-estimate
 * map is not yet distribution-calibrated, so standing should be read as
 * directional, not a probability. Tighten once real score distributions exist.
 */
export const UPG_APPEAL_THRESHOLD = 2.8;
export const UPG_ACCEPTANCE_RATE_LABEL = "~10–15%";

/**
 * Blend weights. The real UPG formula folds high-school standing (Z_HS) in with
 * the UPCAT portions; we approximate that with a fixed 40% HS / 60% mock split
 * when the student provides their high-school average. (The official formula's
 * regression weights and standardized scores aren't publicly available.)
 */
export const UPG_HS_WEIGHT = 0.4;
export const UPG_MOCK_WEIGHT = 0.6;

/** Convert a high-school percentage average to a clamped GPE via the official scale. */
export function hsAverageToUpg(percent: number): number {
  return round2(clampUpg(percentToGpe(percent).gpe));
}

/**
 * Base half-width of the displayed range, from completion (how representative
 * the attempt was). A performance term is added on top in `estimateUpg`.
 */
export const UPG_CONFIDENCE_WIDTH: Record<UpgConfidence, number> = {
  high: 0.05,
  medium: 0.1,
  low: 0.15,
};

/**
 * Extra half-width per UPG point above 2.00 (heteroscedastic interval): weaker
 * estimates are noisier predictors, so the range widens as the estimate rises.
 */
export const UPG_PERFORMANCE_WIDTH_PER_POINT = 0.15;

/**
 * Official UP Grade Point Equivalence (GPE) scale. The `percent` columns are
 * the official class-grade equivalence ranges; we keep them as the source of
 * truth for descriptions and for `percentToGpe` (used once real calibration
 * data lets us map mock performance onto an equivalence percentage). The MVP
 * point estimate uses the lenient linear map below, NOT a direct percent
 * lookup — raw mock accuracy is not a class-grade percentage.
 */
export interface UpgScaleRow {
  gpe: number;
  minPercent: number; // inclusive
  maxPercent: number; // inclusive
  description: UpgReadinessBand;
}

export const UPG_SCALE: UpgScaleRow[] = [
  { gpe: 1.0, minPercent: 97.5, maxPercent: 100, description: "excellent" },
  { gpe: 1.25, minPercent: 94.5, maxPercent: 97.49, description: "very_good" },
  { gpe: 1.5, minPercent: 91.5, maxPercent: 94.49, description: "very_good" },
  { gpe: 1.75, minPercent: 88.5, maxPercent: 91.49, description: "very_good" },
  { gpe: 2.0, minPercent: 85.5, maxPercent: 88.49, description: "satisfactory" },
  { gpe: 2.25, minPercent: 82.5, maxPercent: 85.49, description: "satisfactory" },
  { gpe: 2.5, minPercent: 79.5, maxPercent: 82.49, description: "satisfactory" },
  { gpe: 2.75, minPercent: 76.5, maxPercent: 79.49, description: "fair" },
  { gpe: 3.0, minPercent: 74.5, maxPercent: 76.49, description: "fair" },
  // Below 74.49% is GPE 3.25–5.00; we surface the failing floor as 5.00.
  { gpe: 5.0, minPercent: 0, maxPercent: 74.49, description: "failed" },
];

export const UPG_DESCRIPTION_LABEL: Record<UpgReadinessBand, string> = {
  excellent: "Excellent",
  very_good: "Very Good",
  satisfactory: "Satisfactory",
  fair: "Fair",
  failed: "Failed",
};

/**
 * Description cutoffs for a CONTINUOUS GPE point estimate, taken as the
 * midpoints between adjacent official grades so the label matches the nearest
 * official mark (e.g. 1.00 → Excellent, 1.10 → Very Good).
 */
const UPG_BAND_MAX: Array<{ band: UpgReadinessBand; max: number }> = [
  { band: "excellent", max: 1.125 }, // around 1.00
  { band: "very_good", max: 1.875 }, // 1.25–1.75
  { band: "satisfactory", max: 2.625 }, // 2.00–2.50
  { band: "fair", max: 3.125 }, // 2.75–3.00
  { band: "failed", max: Infinity }, // 3.25+
];

const BAND_PHRASE: Record<UpgReadinessBand, string> = {
  excellent: "an excellent range",
  very_good: "a very good range",
  satisfactory: "a satisfactory range",
  fair: "a fair range",
  failed: "a range that needs serious work",
};

/**
 * Official strict mapping from an equivalence percentage to a GPE + description.
 * Not used by the lenient MVP estimate — reserved for future calibration where
 * a mock score is first converted to an equivalence percentage.
 */
export function percentToGpe(percent: number): { gpe: number; description: UpgReadinessBand } {
  const row = UPG_SCALE.find((r) => percent >= r.minPercent) ?? UPG_SCALE[UPG_SCALE.length - 1];
  return { gpe: row.gpe, description: row.description };
}

/** Snap a continuous GPE to the nearest valid official mark (for display). */
export function nearestOfficialGpe(gpe: number): number {
  const marks = UPG_SCALE.map((r) => r.gpe);
  return marks.reduce((best, mark) => (Math.abs(mark - gpe) < Math.abs(best - gpe) ? mark : best));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampUpg(value: number): number {
  return Math.min(UPG_MAX, Math.max(UPG_MIN, value));
}

/**
 * Map a normalized weighted score (0–1) to a clamped point UPG estimate on the
 * full official 1.00–5.00 scale via a single linear map (lower is better).
 */
export function weightedScoreToUpg(weightedScore: number): number {
  const safe = Math.min(1, Math.max(0, weightedScore));
  return round2(clampUpg(UPG_INTERCEPT - safe * UPG_SLOPE));
}

export function readinessBandForUpg(upg: number): UpgReadinessBand {
  return (UPG_BAND_MAX.find(({ max }) => upg <= max)?.band) ?? "failed";
}

/**
 * Confidence reflects how complete/representative the attempt was. A mostly
 * blank exam should not be presented with a tight, confident range.
 */
export function upgConfidence(completionRate: number): UpgConfidence {
  if (completionRate >= 0.95) return "high";
  if (completionRate >= 0.8) return "medium";
  return "low";
}

function buildExplanation(band: UpgReadinessBand, dragSectionName?: string): string {
  const base = `Your mock performance places you in ${BAND_PHRASE[band]}`;
  return dragSectionName
    ? `${base}, with ${dragSectionName} as the biggest area affecting your estimated UPG.`
    : `${base}.`;
}

/**
 * Produce the estimated UPG range for an attempt.
 *
 * @param weightedScore  normalized weighted accuracy, 0–1 (already accounts for
 *                       unanswered questions, which lower the weighted score)
 * @param completionRate answered / total, 0–1
 * @param hsAverage      optional HS percentage average; blended 40/60 when given
 */
export function estimateUpg(input: {
  weightedScore: number;
  completionRate: number;
  hsAverage?: number;
  dragSectionName?: string;
}): UpgEstimate {
  const mockUpg = weightedScoreToUpg(input.weightedScore);
  const pointEstimate =
    input.hsAverage !== undefined
      ? round2(
          clampUpg(
            UPG_HS_WEIGHT * hsAverageToUpg(input.hsAverage) + UPG_MOCK_WEIGHT * mockUpg,
          ),
        )
      : mockUpg;
  const confidence = upgConfidence(input.completionRate);
  // Heteroscedastic: completion-based base width plus a performance term that
  // grows as the estimate worsens past 2.00 (weaker scores predict less well).
  const performanceWidth =
    Math.min(UPG_MAX, Math.max(0, pointEstimate - 2.0)) * UPG_PERFORMANCE_WIDTH_PER_POINT;
  const width = UPG_CONFIDENCE_WIDTH[confidence] + performanceWidth;
  const readinessBand = readinessBandForUpg(pointEstimate);
  const lowerBound = round2(clampUpg(pointEstimate - width));
  const upperBound = round2(clampUpg(pointEstimate + width));

  return {
    pointEstimate,
    lowerBound,
    upperBound,
    confidence,
    readinessBand,
    admissionStanding: admissionStanding({ lowerBound, upperBound }),
    explanation: buildExplanation(readinessBand, input.dragSectionName),
  };
}

export const ADMISSION_STANDING_LABEL: Record<UpgAdmissionStanding, string> = {
  competitive: "Competitive range",
  appeal_range: "Borderline / appeal range",
  below_threshold: "Below the appeal line",
};

export const ADMISSION_STANDING_BLURB: Record<UpgAdmissionStanding, string> = {
  competitive: `Your estimated range clears the ~${UPG_APPEAL_THRESHOLD} appeal line. UP admits only ${UPG_ACCEPTANCE_RATE_LABEL} of applicants, so this is a strong position — keep it up, it is not a guarantee.`,
  appeal_range: `Your estimated range straddles the ~${UPG_APPEAL_THRESHOLD} appeal line, where borderline applicants typically appeal. Small, focused gains could move you into clearer contention.`,
  below_threshold: `Your estimated range sits past the ~${UPG_APPEAL_THRESHOLD} appeal line. Work your highest-impact topics to close the gap.`,
};

/**
 * Admission standing relative to the appeal line, read from the *interval*:
 * solidly under it, straddling it, or fully past it. Using the bounds (not just
 * the point) means a wide, uncertain estimate is honestly flagged as borderline.
 */
export function admissionStanding(range: {
  lowerBound: number;
  upperBound: number;
}): UpgAdmissionStanding {
  if (range.upperBound < UPG_APPEAL_THRESHOLD) return "competitive";
  if (range.lowerBound > UPG_APPEAL_THRESHOLD) return "below_threshold";
  return "appeal_range";
}

/**
 * Derive the human-readable drivers behind the estimate: which section helps
 * most, which drags most, and the highest-impact topics to study.
 */
export function deriveUpgDrivers(modules: ModuleScore[]): UpgDrivers {
  const sorted = [...modules].sort((a, b) => b.weightedAccuracy - a.weightedAccuracy);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const highestImpactTopics = modules
    .flatMap((m) => m.topics)
    .filter((t) => t.total > 0)
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total || a.topic.localeCompare(b.topic))
    .slice(0, 3)
    .map((t) => t.topic);

  const totalUnanswered = modules.reduce((sum, m) => sum + m.unanswered, 0);

  return {
    strongestPositiveSection: strongest?.name ?? "",
    largestDragSection: weakest?.name ?? "",
    highestImpactTopics,
    timePenaltyApplied: false, // MVP: no explicit time penalty in the linear map yet
    completionPenaltyApplied: totalUnanswered > 0,
  };
}

// ---------------------------------------------------------------------------
// UI-facing helpers
// ---------------------------------------------------------------------------

export const UPG_BAND_TONE: Record<UpgReadinessBand, BadgeTone> = {
  excellent: "teal",
  very_good: "teal",
  satisfactory: "mango",
  fair: "berry",
  failed: "berry",
};

export const ADMISSION_STANDING_TONE: Record<UpgAdmissionStanding, BadgeTone> = {
  competitive: "teal",
  appeal_range: "mango",
  below_threshold: "berry",
};

export const UPG_SECTION_IMPACT_LABEL: Record<UpgSectionImpact, string> = {
  high: "High impact on estimated UPG",
  moderate: "Moderate impact",
  low: "Supporting your estimate",
};

export const UPG_SECTION_IMPACT_TONE: Record<UpgSectionImpact, BadgeTone> = {
  high: "berry",
  moderate: "mango",
  low: "teal",
};

export function formatUpg(value: number): string {
  return value.toFixed(2);
}

export function confidenceLabel(confidence: UpgConfidence): string {
  return `${confidence.charAt(0).toUpperCase()}${confidence.slice(1)} confidence`;
}

/**
 * How much a section is moving the estimated UPG, relative to the others. The
 * weakest section (and any clearly below the mean) reads as high impact —
 * that's where studying moves the estimate most.
 */
export function sectionUpgImpact(module: ModuleScore, modules: ModuleScore[]): UpgSectionImpact {
  if (modules.length <= 1) return "moderate";
  const mean = modules.reduce((s, m) => s + m.weightedAccuracy, 0) / modules.length;
  const min = Math.min(...modules.map((m) => m.weightedAccuracy));
  if (module.weightedAccuracy === min || mean - module.weightedAccuracy >= 10) return "high";
  if (module.weightedAccuracy < mean) return "moderate";
  return "low";
}

/**
 * Read UPG off a result, recomputing for older attempts saved before UPG
 * existed (they still carry weightedAccuracy + completion, which is all the
 * estimator needs). Keeps the results UI safe against legacy localStorage data.
 */
export function ensureUpg(result: MockExamResult): { estimate: UpgEstimate; drivers: UpgDrivers } {
  if (result.upgEstimate && result.upgDrivers) {
    return { estimate: result.upgEstimate, drivers: result.upgDrivers };
  }
  const drivers = deriveUpgDrivers(result.modules);
  const completionRate =
    result.overall.total > 0 ? result.overall.answered / result.overall.total : 0;
  const estimate = estimateUpg({
    weightedScore: (result.overall.weightedAccuracy ?? result.overall.accuracy) / 100,
    completionRate,
    hsAverage: result.hsAverage,
    dragSectionName: drivers.largestDragSection || undefined,
  });
  return { estimate, drivers };
}
