import { normalizeArticleCoverage } from "../lib/lopsided";

export default function CoverageBar({
  article,
  sources,
  left,
  center,
  right,
  compact = false,
  showLegend = true,
}) {
  const normalized = normalizeArticleCoverage(
    article || {
      total_sources: sources,
      left_coverage: left,
      center_coverage: center,
      right_coverage: right,
    }
  );

  const total =
    Number.isInteger(sources) && sources > 0
      ? sources
      : normalized.totalSources;

  const hasBreakdown =
    article ||
    typeof left === "number" ||
    typeof center === "number" ||
    typeof right === "number";

  if (!hasBreakdown) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        {Number.isInteger(sources) && sources > 0
          ? `${sources} reported source${sources === 1 ? "" : "s"}`
          : "Source coverage unavailable"}
      </p>
    );
  }

  const { left: lPct, center: cPct, right: rPct, dominantMeta } = normalized;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-medium text-foreground/90 tabular-nums">
          {total} {total === 1 ? "reported source" : "reported sources"}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${dominantMeta.pillClass}`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${dominantMeta.dotClass}`}
          />
          {dominantMeta.badgeLabel}
        </span>
      </div>

      <div
        role="img"
        aria-label={`Media bias distribution: Left ${lPct}%, Center ${cPct}%, Right ${rPct}% across ${total} sources`}
        className={`flex w-full overflow-hidden rounded-md border border-border bg-muted ${
          compact ? "h-5" : "h-6"
        }`}
      >
        {lPct > 0 && (
          <div
            style={{ width: `${lPct}%` }}
            className="flex items-center justify-center bg-blue-700 text-white text-[11px] font-semibold tabular-nums border-r border-background/80 px-1 truncate"
            title={`From the Left: ${lPct}%`}
          >
            {lPct >= 14 ? `L ${lPct}%` : "L"}
          </div>
        )}
        {cPct > 0 && (
          <div
            style={{ width: `${cPct}%` }}
            className="flex items-center justify-center bg-purple-700 text-white text-[11px] font-semibold tabular-nums border-r border-background/80 px-1 truncate"
            title={`From the Center: ${cPct}%`}
          >
            {cPct >= 14 ? `C ${cPct}%` : "C"}
          </div>
        )}
        {rPct > 0 && (
          <div
            style={{ width: `${rPct}%` }}
            className="flex items-center justify-center bg-red-700 text-white text-[11px] font-semibold tabular-nums px-1 truncate"
            title={`From the Right: ${rPct}%`}
          >
            {rPct >= 14 ? `R ${rPct}%` : "R"}
          </div>
        )}
      </div>

      {showLegend && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground tabular-nums">
          <span className="inline-flex items-center gap-1">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-sm bg-blue-700 border border-blue-900/30"
            />
            Left {lPct}%
          </span>
          <span className="inline-flex items-center gap-1">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-sm bg-purple-700 border border-purple-900/30"
            />
            Center {cPct}%
          </span>
          <span className="inline-flex items-center gap-1">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-sm bg-red-700 border border-red-900/30"
            />
            Right {rPct}%
          </span>
        </div>
      )}
    </div>
  );
}
