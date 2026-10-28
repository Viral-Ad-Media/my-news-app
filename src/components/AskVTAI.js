"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowUpRight } from "lucide-react";
import useCountry from "../lib/use-country";
import { countryName } from "../lib/countries";
import { useLanguage } from "../lib/i18n";
export default function AskVTAI() {
  const { t, lang } = useLanguage();
  const country = useCountry();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const active = useRef(null);
  useEffect(() => { active.current?.abort(); active.current = null; setAnswer(null); setError(""); setLoading(false); return () => { active.current?.abort(); active.current = null; }; }, [country]);
  async function ask(event) {
    event.preventDefault();
    if (loading || !question.trim()) return;
    const controller = new AbortController();
    active.current = controller;
    const timer = setTimeout(() => controller.abort(), 15000);
    setLoading(true);
    setError("");
    setAnswer(null);
    try {
      const response = await fetch("/api/reader/ask", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), location: country }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.detail || "Unable to answer right now.");
      if (!controller.signal.aborted) setAnswer({ ...data, country });
    } catch (err) {
      if (active.current === controller) setError(err.name === "AbortError" ? "The request timed out. Please try again." : err.message);
    } finally {
      clearTimeout(timer);
      if (active.current === controller) setLoading(false);
    }
  }
  return (
    <section className="ask-aboki" aria-labelledby="ask-aboki-heading">
      <div className="ask-aboki-kicker"><Sparkles size={15} aria-hidden="true" /><span>Your reading companion</span></div>
      <h2 id="ask-aboki-heading">{t("ask_ai_title", "Ask Aboki AI")}</h2>
      <p className="ask-aboki-description">
        {t("ask_ai_desc", "Explore the reporting. Ask a question. Follow the sources.")}
      </p>
      <p className="ask-aboki-edition">{countryName(country, lang)} edition</p>
      <Button
        variant="link"
        className="px-0 mb-3 whitespace-normal text-left h-auto"
        type="button"
        onClick={() => setQuestion("What are the latest stored headlines?")}
      >
        {t("ask_ai_prompt", "What are the latest headlines?")}
      </Button>
      <form onSubmit={ask}>
        <label htmlFor="news-question" className="sr-only">
          Question
        </label>
        <Input
          id="news-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={500}
          required
          className="border p-2 w-full"
          placeholder={t("ask_ai_placeholder", "Ask a question")}
        />
        <Button
          disabled={loading || !country}
          type="submit"
          className="ask-aboki-submit mt-3 w-full"
          aria-busy={loading}
        >
          {loading
            ? t("ask_ai_thinking", "Thinking…")
            : t("ask_ai_btn", "Ask")}
        </Button>
      </form>
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      {answer && answer.country === country && (
        <div className="mt-3" role="status" aria-live="polite">
          {(answer.kind === "general" || (!answer.kind && !answer.sources?.length)) && <p className="whitespace-pre-line">{answer.answer}</p>}
          {answer.kind === "news" && !answer.sources?.length && <p>{answer.message || "No matching published stories were found."}</p>}
          {answer.kind !== "general" && <ul className="mt-3" aria-label="News answers">
            {(answer.sources || []).filter(source => /^\d+$/.test(String(source.id))).map((source) => (
              <li key={source.id}>
                <Link className="underline text-sm" href={`/news/${source.id}`}>
                  {source.title}<ArrowUpRight size={12} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>}
        </div>
      )}
    </section>
  );
}
