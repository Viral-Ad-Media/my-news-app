"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "../lib/i18n";
export default function AskVTAI() {
  const { t } = useLanguage();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function ask(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setAnswer(null);
    try {
      const response = await fetch("/api/reader/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.detail || "Unable to answer right now.");
      setAnswer(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className="rounded-xl border border-border bg-muted/40 p-4 mb-6">
      <h2 className="text-2xl font-bold">{t("ask_ai_title", "Ask Aboki AI")}</h2>
      <p className="text-sm my-2">
        {t("ask_ai_desc", "Answers use stories stored in this news app.")}
      </p>
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
          disabled={loading}
          type="submit"
          className="mt-2 min-w-24"
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
      {answer && (
        <div className="mt-3" role="status" aria-live="polite">
          <p className="whitespace-pre-line">{answer.answer}</p>
          <ul className="mt-3">
            {answer.sources.map((source) => (
              <li key={source.id}>
                <Link className="underline text-sm" href={`/news/${source.id}`}>
                  {source.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
