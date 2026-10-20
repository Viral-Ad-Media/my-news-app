"use client";

import DailyIndex from "./DailyIndex";
import CoverageDetails from "./CoverageDetails";
import ExchangeRate from "./ExchangeRate";
import { buildApiUrl } from "../lib/api";

export default function LeftSidebar({ articleId }) {
  const coverageUrl = articleId
    ? buildApiUrl(`/news/${articleId}/coverage/`)
    : "";

  return (
    <div className="space-y-6">
      <ExchangeRate />
      <DailyIndex apiUrl={coverageUrl} />
      {coverageUrl && <CoverageDetails apiUrl={coverageUrl} />}
    </div>
  );
}
