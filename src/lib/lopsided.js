// Shared utilities for AllSides-style multi-perspective & lopsided coverage analysis.

export const BIAS_META = {
  left: {
    key: "left",
    shortLabel: "L",
    columnLabel: "From the Left",
    badgeLabel: "Left-Leaning",
    blindspotLabel: "Right Blindspot",
    description: "Coverage driven primarily by Left and Lean Left outlets.",
    pillClass:
      "bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800",
    headerClass:
      "border-l-4 border-l-blue-700 bg-blue-50/60 text-blue-950 dark:bg-blue-950/30 dark:text-blue-100",
    barClass: "bg-blue-700 text-white",
    dotClass: "bg-blue-700",
  },
  center: {
    key: "center",
    shortLabel: "C",
    columnLabel: "From the Center",
    badgeLabel: "Center-Focused",
    blindspotLabel: "Partisan Blindspot",
    description: "Coverage anchored by wire services and centrist newsrooms.",
    pillClass:
      "bg-purple-50 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800",
    headerClass:
      "border-l-4 border-l-purple-700 bg-purple-50/60 text-purple-950 dark:bg-purple-950/30 dark:text-purple-100",
    barClass: "bg-purple-700 text-white",
    dotClass: "bg-purple-700",
  },
  right: {
    key: "right",
    shortLabel: "R",
    columnLabel: "From the Right",
    badgeLabel: "Right-Leaning",
    blindspotLabel: "Left Blindspot",
    description: "Coverage driven primarily by Right and Lean Right outlets.",
    pillClass:
      "bg-red-50 text-red-900 border-red-300 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800",
    headerClass:
      "border-l-4 border-l-red-700 bg-red-50/60 text-red-950 dark:bg-red-950/30 dark:text-red-100",
    barClass: "bg-red-700 text-white",
    dotClass: "bg-red-700",
  },
  polarized: {
    key: "polarized",
    shortLabel: "L/R",
    columnLabel: "Polarized Framing",
    badgeLabel: "Polarized · Center Blindspot",
    blindspotLabel: "Center Blindspot",
    description:
      "Heavily covered by Left and Right commentators with minimal centrist synthesis.",
    pillClass:
      "bg-amber-50 text-amber-950 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800",
    headerClass:
      "border-l-4 border-l-amber-600 bg-amber-50/60 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100",
    barClass: "bg-amber-600 text-white",
    dotClass: "bg-amber-600",
  },
  balanced: {
    key: "balanced",
    shortLabel: "L·C·R",
    columnLabel: "Balanced Roundup",
    badgeLabel: "Balanced Coverage",
    blindspotLabel: "Full Spectrum",
    description: "Comparable attention across Left, Center, and Right newsrooms.",
    pillClass:
      "bg-emerald-50 text-emerald-950 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800",
    headerClass:
      "border-l-4 border-l-emerald-700 bg-emerald-50/60 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100",
    barClass: "bg-emerald-700 text-white",
    dotClass: "bg-emerald-700",
  },
};

export function getBiasBadgeStyle(biasRating = "") {
  const lower = String(biasRating).toLowerCase();
  if (lower.includes("left")) {
    return BIAS_META.left.pillClass;
  }
  if (lower.includes("right")) {
    return BIAS_META.right.pillClass;
  }
  return BIAS_META.center.pillClass;
}

export function normalizeArticleCoverage(article = {}) {
  const hasExplicitCoverage =
    typeof article.left_coverage === "number" &&
    typeof article.center_coverage === "number" &&
    typeof article.right_coverage === "number";

  let left = hasExplicitCoverage ? article.left_coverage : 34;
  let center = hasExplicitCoverage ? article.center_coverage : 33;
  let right = hasExplicitCoverage ? article.right_coverage : 33;

  const sum = left + center + right;
  if (sum <= 0) {
    left = 33;
    center = 34;
    right = 33;
  } else if (sum !== 100) {
    left = Math.round((left / sum) * 100);
    center = Math.round((center / sum) * 100);
    right = Math.max(0, 100 - left - center);
  }

  let dominant = article.dominant_bias || "balanced";
  if (!BIAS_META[dominant]) {
    if (center <= 22 && left >= 35 && right >= 35) dominant = "polarized";
    else if (left >= right + 12 || left >= 44) dominant = "left";
    else if (right >= left + 12 || right >= 44) dominant = "right";
    else if (center >= 45) dominant = "center";
    else dominant = "balanced";
  }

  const isLopsided =
    typeof article.is_lopsided === "boolean"
      ? article.is_lopsided
      : dominant !== "balanced" ||
        Math.max(left, right) >= 42 ||
        Math.min(left, center, right) <= 22;

  const rawPerspectives = Array.isArray(article.perspectives)
    ? article.perspectives
    : [];

  const sourceName =
    typeof article.source === "string"
      ? article.source
      : article.source?.name || "AllSides Wire";
  const fallbackUrl = article.article_url || `/news/${article.id || ""}`;

  const perspectives =
    rawPerspectives.length > 0
      ? rawPerspectives
      : [
          {
            bucket: "left",
            label: "From the Left",
            bias_rating: "Lean Left",
            source: "Progressive Desk",
            title: article.title || "Story coverage from left-leaning outlets",
            summary:
              article.description ||
              "Emphasizes public accountability, institutional safeguards, and distributional impact.",
            url: fallbackUrl,
          },
          {
            bucket: "center",
            label: "From the Center",
            bias_rating: "Center",
            source: sourceName,
            title: article.title || "Primary wire report",
            summary:
              article.description ||
              "Focuses on verified timeline details, official statements, and procedural context.",
            url: fallbackUrl,
          },
          {
            bucket: "right",
            label: "From the Right",
            bias_rating: "Lean Right",
            source: "Market & Fiscal Desk",
            title: article.title || "Story coverage from right-leaning outlets",
            summary:
              article.description ||
              "Highlights fiscal discipline, private-sector growth, and regulatory trade-offs.",
            url: fallbackUrl,
          },
        ];

  // Extract structured editorial callouts ("The Details:", "For Context:", etc.)
  const paragraphs = String(article.content || article.description || "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(
      (p) => p && !p.startsWith("Original summary by AbokiNews")
    );

  const callouts = [];
  for (const para of paragraphs) {
    const match = para.match(
      /^(The Details|For Context|Leading Up|Latest Developments|Media Framing|Perspectives|Blame Game|'[^']+'|On [^:]+|SpaceX|Doubled Down|More Recently|What The Times Left Out):\s*(.+)$/i
    );
    if (match) {
      callouts.push({ heading: match[1].trim(), body: match[2].trim() });
    }
  }

  let blindspotNote = "Balanced tri-column coverage across the spectrum";
  if (center <= 22 && left >= 35 && right >= 35) {
    blindspotNote = `Center Blindspot (${center}% Center vs ${left}% Left / ${right}% Right)`;
  } else if (left <= 24) {
    blindspotNote = `Left Blindspot (only ${left}% from Left-leaning outlets)`;
  } else if (right <= 24) {
    blindspotNote = `Right Blindspot (only ${right}% from Right-leaning outlets)`;
  } else if (left >= right + 12) {
    blindspotNote = `Skews Left (+${left - right} pts over Right outlets)`;
  } else if (right >= left + 12) {
    blindspotNote = `Skews Right (+${right - left} pts over Left outlets)`;
  }

  return {
    left,
    center,
    right,
    dominant,
    dominantMeta: BIAS_META[dominant] || BIAS_META.balanced,
    isLopsided,
    blindspotNote,
    perspectives,
    callouts,
    totalSources: Math.max(
      Number(article.total_sources) || 0,
      perspectives.length,
      1
    ),
  };
}
