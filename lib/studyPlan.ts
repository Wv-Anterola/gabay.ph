import type { DiagnosticResult, ModuleId, StudyDay, TopicScore } from "@/lib/types";
import { MODULES } from "@/lib/questions";

/**
 * Deterministic 7-day UPCAT study plan generator.
 *
 * Raw question topics are condensed into broad, reviewable focus areas with
 * useful question types. Students can use any UPCAT reviewer or textbook; the
 * plan is guidance only and deliberately contains no in-product practice links.
 */

const PLAN_LENGTH = 7;
const MINUTE_STEP = 5;

type FocusAreaDefinition = {
  id: string;
  focus: string;
  questionTypes: readonly string[];
  topics: readonly string[];
};

type FocusAreaScore = FocusAreaDefinition & {
  module: ModuleId;
  moduleName: string;
  correct: number;
  total: number;
  accuracy: number;
  hasWeakTopic: boolean;
};

/** Daily review-time budgets the student can pick from. */
export const STUDY_TIME_OPTIONS = [30, 60, 120] as const;
export type StudyMinutes = (typeof STUDY_TIME_OPTIONS)[number];
export const DEFAULT_STUDY_MINUTES: StudyMinutes = 60;

/** How many focus areas fit in one day at a given budget. */
function topicsPerDay(dailyMinutes: number): number {
  if (dailyMinutes >= 120) return 3;
  if (dailyMinutes >= 60) return 2;
  return 1;
}

/**
 * Topic labels are grouped at a level a student can actually review. This
 * covers the core and imported banks; unknown future labels use a useful
 * module-level fallback instead of appearing as a new, overly-specific task.
 */
const FOCUS_AREAS: Record<ModuleId, readonly FocusAreaDefinition[]> = {
  language: [
    {
      id: "grammar-sentence-construction",
      focus: "Grammar & sentence construction",
      questionTypes: ["Grammar and usage", "Sentence correction and ordering"],
      topics: [
        "Grammar",
        "Sentence Correction",
        "Articles",
        "Modifiers",
        "Parallelism",
        "Pronoun case",
        "Punctuation",
        "Run-on sentences",
        "Subject-verb agreement",
        "Verb tense",
        "English Grammar",
        "Filipino Grammar",
        "English Sentence Order",
      ],
    },
    {
      id: "vocabulary-word-relationships",
      focus: "Vocabulary & word relationships",
      questionTypes: ["Meaning in context", "Idioms, analogies, and word relationships"],
      topics: [
        "Vocabulary",
        "Antonyms",
        "Synonyms",
        "Context clues",
        "Word usage",
        "Prefixes & roots",
        "Idioms & Expressions",
        "Common idioms",
        "Figurative meaning",
        "Analogies",
        "Function",
        "Degree",
        "Part to whole",
        "English Vocabulary",
        "Filipino Vocabulary",
        "English Idioms",
      ],
    },
  ],
  reading: [
    {
      id: "passage-comprehension",
      focus: "Passage comprehension",
      questionTypes: ["Main idea and supporting detail", "Theme and factual recall"],
      topics: [
        "Main Idea",
        "Detail",
        "Reading Comprehension",
        "Factual Recall",
        "Theme Identification",
      ],
    },
    {
      id: "author-reasoning-inference",
      focus: "Author reasoning & inference",
      questionTypes: ["Purpose and tone", "Inference and deductive reasoning"],
      topics: [
        "Author's Purpose",
        "Author's Tone",
        "Tone Analysis",
        "Inference",
        "Deductive Reasoning",
      ],
    },
    {
      id: "reading-vocabulary-interpretation",
      focus: "Vocabulary & interpretation",
      questionTypes: ["Vocabulary in context", "Figurative language and poetry"],
      topics: ["Vocabulary in Context", "Context Clues", "Poetry Analysis", "Metaphor Interpretation"],
    },
  ],
  math: [
    {
      id: "number-sense-algebra",
      focus: "Number sense & algebra",
      questionTypes: ["Computational fluency", "Equation and expression solving"],
      topics: [
        "Number Sense",
        "Fractions",
        "Percentage",
        "Algebra",
        "Linear equations",
        "Systems",
        "Exponents",
        "Linear Equations",
        "Polynomials & Functions",
        "Rational Expressions",
        "Scientific Notation",
      ],
    },
    {
      id: "geometry-measurement",
      focus: "Geometry & measurement",
      questionTypes: ["Diagram and shape problems", "Angles, area, and similarity"],
      topics: [
        "Geometry",
        "Area",
        "Triangles",
        "Pythagorean theorem",
        "Area & Similarity",
        "Circles & Inscribed Angles",
        "Parallel Lines & Angles",
      ],
    },
    {
      id: "data-probability-word-problems",
      focus: "Data, probability & word problems",
      questionTypes: ["Data and probability", "Rates, ratios, and applied problems"],
      topics: [
        "Word Problems",
        "Rate",
        "Ratio",
        "Data Interpretation",
        "Average",
        "Probability",
        "Basic Probability",
        "Counting Principles",
        "Work & Rate Problems",
      ],
    },
  ],
  science: [
    {
      id: "life-science",
      focus: "Life science",
      questionTypes: ["Biological processes", "Cells, systems, and ecosystems"],
      topics: [
        "Biology",
        "Cell biology",
        "Photosynthesis",
        "Human body",
        "Ecology",
        "Cell Biology",
        "Ecology & Evolution",
        "Genetics & Biotechnology",
        "Plant Biology",
      ],
    },
    {
      id: "physical-science",
      focus: "Physical science",
      questionTypes: ["Matter and chemical change", "Forces, energy, and electricity"],
      topics: [
        "Chemistry",
        "Atomic structure",
        "States of matter",
        "Acids and bases",
        "Mixtures",
        "Physics",
        "Forces and motion",
        "Energy",
        "Electricity",
        "Atomic Structure & Periodic Table",
        "Chemical Bonding",
        "Stoichiometry",
        "Solutions & Mixtures",
        "Kinematics",
        "Electricity & Magnetism",
        "Waves & Optics",
      ],
    },
    {
      id: "earth-science-reasoning",
      focus: "Earth science & scientific reasoning",
      questionTypes: ["Earth systems", "Scientific method and evidence"],
      topics: [
        "Earth Science",
        "Weather",
        "Geology",
        "Astronomy",
        "General Science",
        "Scientific method",
        "Hydrology",
      ],
    },
  ],
};

const FALLBACK_FOCUS: Record<ModuleId, Omit<FocusAreaDefinition, "id" | "topics">> = {
  language: {
    focus: "Language foundations",
    questionTypes: ["Grammar and usage", "Vocabulary and word relationships"],
  },
  reading: {
    focus: "Reading comprehension",
    questionTypes: ["Understanding passages", "Author reasoning and inference"],
  },
  math: {
    focus: "Mathematical problem solving",
    questionTypes: ["Core concepts", "Applied problem solving"],
  },
  science: {
    focus: "Science concepts & reasoning",
    questionTypes: ["Concept application", "Evidence and scientific reasoning"],
  },
};

function focusAreaFor(module: ModuleId, topic: string): FocusAreaDefinition {
  const defined = FOCUS_AREAS[module].find((area) => area.topics.includes(topic));
  if (defined) return defined;

  return { id: "foundations", ...FALLBACK_FOCUS[module], topics: [] };
}

function focusAreaComparator(a: FocusAreaScore, b: FocusAreaScore): number {
  return (
    Number(b.hasWeakTopic) - Number(a.hasWeakTopic) ||
    a.accuracy - b.accuracy ||
    b.total - a.total ||
    a.moduleName.localeCompare(b.moduleName) ||
    a.focus.localeCompare(b.focus)
  );
}

/** Condense raw scored topics into broad, reviewable study areas. */
function groupFocusAreas(result: DiagnosticResult): FocusAreaScore[] {
  const weakTopicKeys = new Set(
    result.weakTopics.map((topic) => `${topic.module}:${topic.topic}`),
  );

  return result.modules.flatMap((moduleScore) => {
    const groups = new Map<string, { definition: FocusAreaDefinition; topics: TopicScore[] }>();

    for (const topic of moduleScore.topics) {
      const definition = focusAreaFor(moduleScore.module, topic.topic);
      const existing = groups.get(definition.id);
      if (existing) {
        existing.topics.push(topic);
      } else {
        groups.set(definition.id, { definition, topics: [topic] });
      }
    }

    return [...groups.values()].map(({ definition, topics }) => {
      const correct = topics.reduce((sum, topic) => sum + topic.correct, 0);
      const total = topics.reduce((sum, topic) => sum + topic.total, 0);

      return {
        ...definition,
        module: moduleScore.module,
        moduleName: MODULES[moduleScore.module].name,
        correct,
        total,
        accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
        hasWeakTopic: topics.some((topic) => weakTopicKeys.has(`${topic.module}:${topic.topic}`)),
      };
    });
  });
}

/**
 * Keep every tested section visible in the plan, then spend remaining slots
 * on the weakest broad areas. This stops one-item weak topics from crowding
 * out an entire UPCAT subtest.
 */
function selectFocusAreas(
  result: DiagnosticResult,
  count: number,
  perDay: number,
): FocusAreaScore[] {
  const areas = groupFocusAreas(result).sort(focusAreaComparator);
  if (areas.length === 0) return [];

  const coverage = result.modules
    .map((moduleScore) => areas.find((area) => area.module === moduleScore.module))
    .filter((area): area is FocusAreaScore => area !== undefined)
    .sort(focusAreaComparator)
    .slice(0, count);

  const priorityPool = areas.filter((area) => area.hasWeakTopic);
  const pool = priorityPool.length > 0 ? priorityPool : areas;
  const selected = [...coverage];
  let poolIndex = 0;

  while (selected.length < count) {
    const dayStart = Math.floor(selected.length / perDay) * perDay;
    const currentDay = selected.slice(dayStart);
    let candidate = pool[poolIndex % pool.length];
    let attempts = 0;

    // Avoid showing an identical area twice on a day whenever another fits.
    while (
      attempts < pool.length &&
      currentDay.some((area) => area.module === candidate.module && area.id === candidate.id)
    ) {
      poolIndex += 1;
      candidate = pool[poolIndex % pool.length];
      attempts += 1;
    }

    selected.push(candidate);
    poolIndex += 1;
  }

  return selected;
}

/**
 * Split a day's budget across its areas in 5-minute steps, proportional to
 * weakness. Leftover steps go to the weakest areas, so a weaker area never
 * gets fewer minutes than a stronger one.
 */
function allocateMinutes(areas: FocusAreaScore[], budget: number): number[] {
  if (areas.length === 0) return [];
  const weights = areas.map((area) => Math.max(100 - area.accuracy, 20));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const totalSteps = Math.round(budget / MINUTE_STEP);

  const steps = weights.map((weight) => Math.floor((totalSteps * weight) / totalWeight));
  let leftover = totalSteps - steps.reduce((sum, step) => sum + step, 0);
  for (let i = 0; leftover > 0; i = (i + 1) % steps.length) {
    steps[i] += 1;
    leftover -= 1;
  }

  return steps.map((step) => step * MINUTE_STEP);
}

export function generateStudyPlan(
  result: DiagnosticResult,
  dailyMinutes: number = DEFAULT_STUDY_MINUTES,
): StudyDay[] {
  const perDay = topicsPerDay(dailyMinutes);
  const selected = selectFocusAreas(result, PLAN_LENGTH * perDay, perDay);
  if (selected.length === 0) return [];

  return Array.from({ length: PLAN_LENGTH }, (_, dayIdx) => {
    const chunk = selected.slice(dayIdx * perDay, (dayIdx + 1) * perDay);
    const seen = new Set<string>();
    const dayAreas = chunk
      .filter((area) => {
        const key = `${area.module}:${area.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort(focusAreaComparator);
    const minutes = allocateMinutes(dayAreas, dailyMinutes);

    return {
      day: dayIdx + 1,
      totalMinutes: dailyMinutes,
      topics: dayAreas.map((area, i) => ({
        id: area.id,
        module: area.module,
        moduleName: area.moduleName,
        focus: area.focus,
        questionTypes: [...area.questionTypes],
        accuracy: area.accuracy,
        minutes: minutes[i],
      })),
    };
  });
}
