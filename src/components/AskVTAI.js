"use client";
import { useState } from "react";
import Link from "next/link";
export default function AskVTAI() {
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
    <section className="bg-gray-50 p-4 rounded mb-6">
      <h2 className="text-2xl font-bold">Ask Aboki AI</h2>
      <p className="text-sm my-2">
        Answers use stories stored in this news app.
      </p>
      <button
        className="text-sm underline mb-3"
        onClick={() => setQuestion("What are the latest stored headlines?")}
      >
        What are the latest headlines?
      </button>
      <form onSubmit={ask}>
        <label htmlFor="news-question" className="sr-only">
          Question
        </label>
        <input
          id="news-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={500}
          required
          className="border p-2 w-full"
          placeholder="Ask a question"
        />
        <button
          disabled={loading}
          className="bg-black text-white px-4 py-2 mt-2 disabled:opacity-50"
        >
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      {answer && (
        <div className="mt-3">
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
