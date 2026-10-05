export default function CoverageBar({ sources }) {
  return (
    <p className="mt-2 text-xs">
      {Number.isInteger(sources) && sources > 0
        ? `${sources} reported source${sources === 1 ? "" : "s"}`
        : "Source coverage unavailable"}
    </p>
  );
}
