"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '../lib/i18n';
import ArticleBody from './ArticleBody';

const requests = new Map();
function translate(id, language, part) {
  const key = `${id}:${language}:${part}`;
  const existing = requests.get(key);
  if (existing && Date.now() - existing.time < 60000) return existing.promise;
  const promise = (async () => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const response = await fetch(`/api/reader/translations/${id}?language=${language}&part=${part}`, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
      if (response.status === 202) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      const data = await response.json();
      if (!response.ok || data.language !== language) throw Error('Translation unavailable');
      return data;
    }
    throw Error('Translation is still being prepared');
  })();
  requests.set(key, { time: Date.now(), promise });
  if (requests.size > 256) requests.delete(requests.keys().next().value);
  promise.catch(() => { if (requests.get(key)?.promise === promise) requests.delete(key); });
  return promise;
}

export default function LocalizedArticleText({ articleId, field, original = '', full = false, body = false, affiliateLinks = [] }) {
  const { lang, langMeta } = useLanguage();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setResult(null); setError(false);
    if (lang !== 'en' && articleId) translate(articleId, lang, full ? 'full' : 'brief').then(data => { if (active) setResult({ language: lang, text: data[field] }); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [articleId, field, full, lang, original]);
  const translated = result?.language === lang;
  const text = translated ? result.text : original;
  if (body) return <div lang={translated ? lang : 'en'} dir={translated ? langMeta.dir : 'ltr'}>{lang !== 'en' && <p role="status" className="text-xs text-muted-foreground mb-3">{error ? 'Translation unavailable. Showing the English original.' : translated ? 'Machine translation · Check the original report for exact wording.' : 'Translating report… English original shown while loading.'}</p>}<ArticleBody content={text} affiliateLinks={affiliateLinks} /></div>;
  return <span lang={translated ? lang : 'en'} dir={translated ? langMeta.dir : 'ltr'}>{text}{lang !== 'en' && field === 'title' && <small className="block text-xs font-normal text-muted-foreground" role="status">{error ? 'Translation unavailable · English original' : translated ? '' : 'Translating…'}</small>}</span>;
}
