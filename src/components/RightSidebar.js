"use client";
import { useEffect, useState } from 'react';
import AskVTAI from './AskVTAI';
import TopTopics from './TopTopics';
import SimilarNewsTopics from './SimilarNewsTopics';
import { buildApiUrl } from '../lib/api';

export default function RightSidebar() {
  const [activeTab, setActiveTab] = useState('Last Day');
  const [categories, setCategories] = useState([]);
  const newsSummaryTabs = ['Last Day', 'Last Week', 'Last Month'];
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const categoriesUrl = buildApiUrl('/categories/');

    if (!categoriesUrl) {
      setError('API base URL is not configured.');
      setCategories([]);
      return () => controller.abort();
    }

    fetch(categoriesUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((fetchError) => {
        if (fetchError.name === 'AbortError') return;
        setError('Unable to load topics right now.');
        setCategories([]);
      });

    return () => controller.abort();
  }, []);

  return (
    <div>
      {/* Ask VT AI Section */}
      <AskVTAI activeTab={activeTab} setActiveTab={setActiveTab} newsSummaryTabs={newsSummaryTabs} />

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {/* Top Topics Section */}
      <TopTopics topics={categories} />

      {/* Similar News Topics Section */}
      <SimilarNewsTopics topics={categories} />
    </div>
  );
}
