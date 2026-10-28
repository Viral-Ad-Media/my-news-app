"use client";

import { useEffect, useState } from "react";
import { Languages, RotateCcw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES, useLanguage } from "../lib/i18n";

export default function ArticleTranslator({
  title = "",
  description = "",
  paragraphs = [],
}) {
  const { lang, setLanguage, t } = useLanguage();
  const [targetLang, setTargetLang] = useState(lang === "en" ? "fr" : lang);
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [engineLabel, setEngineLabel] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (lang !== "en") {
      setTargetLang(lang);
    }
  }, [lang]);

  async function handleTranslate() {
    if (!targetLang || targetLang === "en") {
      setTranslated(null);
      setStatusMessage("");
      return;
    }

    setLoading(true);
    setDownloadProgress(null);
    setStatusMessage("");

    const options = {
      sourceLanguage: "en",
      targetLanguage: targetLang,
    };

    try {
      // 1. Check built-in browser Translator API exclusively via self.Translator
      if (typeof self !== "undefined" && "Translator" in self) {
        const availability = await self.Translator.availability(options);

        if (
          availability === "available" ||
          availability === "downloadable" ||
          availability === "downloading"
        ) {
          const translator = await self.Translator.create({
            ...options,
            monitor(m) {
              m.addEventListener("downloadprogress", (e) => {
                if (typeof e.loaded === "number") {
                  setDownloadProgress(Math.round(e.loaded * 100));
                }
              });
            },
          });

          const [tTitle, tDesc, ...tParas] = await Promise.all([
            title ? translator.translate(title) : Promise.resolve(""),
            description
              ? translator.translate(description)
              : Promise.resolve(""),
            ...paragraphs.map((p) => translator.translate(p)),
          ]);

          setTranslated({
            lang: targetLang,
            title: tTitle,
            description: tDesc,
            paragraphs: tParas,
          });
          setEngineLabel("On-Device Browser AI Translator");
          setLoading(false);
          setDownloadProgress(null);
          return;
        }
      }

      setTranslated(null);
      setStatusMessage("Translation for this language is unavailable in this browser. The original reporting is shown below.");
    } catch {
      setStatusMessage(
        "Client-side translation is currently unsupported in this browser.",
      );
    } finally {
      setLoading(false);
      setDownloadProgress(null);
    }
  }

  const activeTranslatedMeta =
    translated &&
    SUPPORTED_LANGUAGES.find((l) => l.code === translated.lang);

  return (
    <div className="space-y-5">
      {/* Multi-Language Translation Bar */}
      <div className="rounded-xl border border-border bg-muted/40 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Languages className="h-4 w-4 text-foreground shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <span className="text-sm font-medium">
              {t("translate_heading", "Multi-Language Reader")}
            </span>
            {engineLabel && translated && (
              <p className="text-[11px] text-muted-foreground break-words">
                {engineLabel}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select
            value={targetLang}
            onValueChange={(val) => {
              setTargetLang(val);
              setLanguage(val);
            }}
          >
            <SelectTrigger
              aria-label="Select translation language"
              className="h-8 flex-1 sm:flex-initial sm:w-40 min-w-[130px] text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="news-select">
              {SUPPORTED_LANGUAGES.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  {item.nativeLabel} ({item.label})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            size="sm"
            variant={translated ? "secondary" : "default"}
            onClick={handleTranslate}
            disabled={loading || targetLang === "en"}
            className="h-8 text-xs gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {loading
              ? downloadProgress !== null
                ? `Downloading (${downloadProgress}%)…`
                : "Translating…"
              : t("translate_button", "Translate story")}
          </Button>

          {translated && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setTranslated(null);
                setLanguage("en");
              }}
              className="h-8 text-xs gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {t("translate_restoring", "Original (EN)")}
            </Button>
          )}
        </div>
      </div>

      {statusMessage && (
        <p role="status" className="text-xs text-muted-foreground">
          {statusMessage}
        </p>
      )}

      {translated && activeTranslatedMeta && (
        <div
          lang={activeTranslatedMeta.code}
          dir={activeTranslatedMeta.dir}
          className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="text-xs">
              {activeTranslatedMeta.nativeLabel} · {activeTranslatedMeta.label}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {engineLabel}
            </span>
          </div>
          <h3 className="text-xl font-bold leading-snug">{translated.title}</h3>
          {translated.description && (
            <p className="text-sm leading-relaxed text-foreground font-medium">
              {translated.description}
            </p>
          )}
          {Array.isArray(translated.paragraphs) &&
            translated.paragraphs.length > 0 && (
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground pt-2 border-t border-border/60">
                {translated.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
