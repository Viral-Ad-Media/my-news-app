'use client';
import { useEffect, useState } from 'react';
import { buildApiUrl, listItems } from './api';

export default function useCategories() {
  const [state, setState] = useState({ categories: [], loading: true, error: '' });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const categories = [];
      try {
        let page = 1, data;
        do {
          const url = buildApiUrl(`/categories/?page_size=100&page=${page++}`);
          if (!url) throw Error('News service is not configured.');
          const res = await fetch(url, { signal: controller.signal });
          if (!res.ok) throw Error('Unable to load categories. Please reload to retry.');
          data = await res.json(); categories.push(...listItems(data));
        } while (data.next && !controller.signal.aborted);
        if (!controller.signal.aborted) setState({ categories, loading: false, error: '' });
      } catch (err) {
        if (!controller.signal.aborted) setState({ categories: [], loading: false, error: err.message });
      }
    }
    load(); return () => controller.abort();
  }, []);
  return state;
}
