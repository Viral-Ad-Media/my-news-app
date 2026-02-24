// components/LeftSidebar.js

"use client";
// import DailyIndex from './DailyIndex';
import CoverageDetails from './CoverageDetails';
import ExchangeRate from './ExchangeRate';
import { buildApiUrl } from '../lib/api';

export default function LeftSidebar({ articleId }) {
  const coverageUrl = articleId ? buildApiUrl(`/news/${articleId}/coverage/`) : '';

  return (
    <div>
      {/* ExchangeRate Section */}
      <ExchangeRate />

      {/* Daily Index Section */}
      {/* <DailyIndex indexValue={indexValue} sentiment={sentiment} /> */}

      {/* Coverage Details Section */}
      {coverageUrl && <CoverageDetails apiUrl={coverageUrl} />}
    </div>
  );
}
