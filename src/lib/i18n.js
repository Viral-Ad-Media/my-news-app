"use client";

import { useEffect, useState } from "react";

export const LANGUAGE_STORAGE_KEY = "news-lang";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "fr", label: "French", nativeLabel: "Français", dir: "ltr" },
  { code: "es", label: "Spanish", nativeLabel: "Español", dir: "ltr" },
  { code: "ha", label: "Hausa", nativeLabel: "Hausa", dir: "ltr" },
  { code: "yo", label: "Yoruba", nativeLabel: "Yorùbá", dir: "ltr" },
  { code: "ig", label: "Igbo", nativeLabel: "Igbo", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
];

export const UI_TRANSLATIONS = {
  en: {
    nav_home: "Home",
    nav_feed: "My Feed",
    nav_saved: "Saved News",
    nav_topics: "Topics",
    nav_local: "Local News",
    nav_timelines: "Timelines",
    nav_lopsided: "Lopsided",
    nav_dashboard: "Dashboard",
    nav_login: "Login",
    nav_signup: "Sign Up",
    nav_logout: "Logout",
    nav_logging_out: "Logging out…",
    header_search_placeholder: "Search stories",
    header_search_btn: "Search",
    header_country: "Country",
    header_language: "Language",
    country_ng: "Nigeria",
    country_us: "United States",
    country_gb: "United Kingdom",
    home_title: "Your news, in focus.",
    home_subtitle: "Nigeria and beyond. Read the story, follow the source.",
    briefing_title: "Latest briefing",
    read_story: "Read story",
    latest_news: "Latest News",
    your_news_feed: "Your News Feed",
    feed_tailored: "Tailored to your subscribed beats and reading preferences.",
    choose_topics: "Choose your topics",
    reader_dashboard: "Reader Dashboard",
    ask_ai_title: "Ask Aboki AI",
    ask_ai_desc: "Answers use stories stored in this news app.",
    ask_ai_prompt: "What are the latest headlines?",
    ask_ai_placeholder: "Ask a question",
    ask_ai_btn: "Ask",
    ask_ai_thinking: "Thinking…",
    explore_topics: "Explore topics",
    more_to_explore: "More to explore",
    briefing_recap: "Briefing Recap",
    full_timeline: "Full timeline",
    footer_tagline: "Multi-perspective reporting · Left · Center · Right",
    translate_heading: "Multi-Language Reader",
    translate_button: "Translate story",
    translate_restoring: "Show original English",
  },
  fr: {
    nav_home: "Accueil",
    nav_feed: "Mon Fil",
    nav_saved: "Favoris",
    nav_topics: "Sujets",
    nav_local: "Infos Locales",
    nav_timelines: "Chronologie",
    nav_lopsided: "Perspectives",
    nav_dashboard: "Tableau de bord",
    nav_login: "Connexion",
    nav_signup: "S’inscrire",
    nav_logout: "Déconnexion",
    nav_logging_out: "Déconnexion…",
    header_search_placeholder: "Rechercher des articles",
    header_search_btn: "Rechercher",
    header_country: "Pays",
    header_language: "Langue",
    country_ng: "Nigéria",
    country_us: "États-Unis",
    country_gb: "Royaume-Uni",
    home_title: "Votre actualité, en clair.",
    home_subtitle: "Le Nigéria et le monde. Lisez l’article, suivez la source.",
    briefing_title: "Dernier point presse",
    read_story: "Lire l’article",
    latest_news: "Dernières actualités",
    your_news_feed: "Votre fil d’actualité",
    feed_tailored: "Adapté à vos sujets suivis et préférences de lecture.",
    choose_topics: "Choisir vos sujets",
    reader_dashboard: "Tableau de bord",
    ask_ai_title: "Demander à Aboki IA",
    ask_ai_desc: "Les réponses utilisent les articles stockés dans l’application.",
    ask_ai_prompt: "Quels sont les derniers titres ?",
    ask_ai_placeholder: "Posez une question",
    ask_ai_btn: "Demander",
    ask_ai_thinking: "Réflexion…",
    explore_topics: "Explorer les sujets",
    more_to_explore: "Plus à découvrir",
    briefing_recap: "Résumé rapide",
    full_timeline: "Chronologie complète",
    footer_tagline: "Information multi-perspectives · Gauche · Centre · Droite",
    translate_heading: "Lecteur multilingue",
    translate_button: "Traduire l’article",
    translate_restoring: "Afficher l’original (anglais)",
  },
  es: {
    nav_home: "Inicio",
    nav_feed: "Mi Feed",
    nav_saved: "Guardados",
    nav_topics: "Temas",
    nav_local: "Noticias Locales",
    nav_timelines: "Cronología",
    nav_lopsided: "Perspectivas",
    nav_dashboard: "Panel",
    nav_login: "Iniciar sesión",
    nav_signup: "Registrarse",
    nav_logout: "Cerrar sesión",
    nav_logging_out: "Cerrando…",
    header_search_placeholder: "Buscar noticias",
    header_search_btn: "Buscar",
    header_country: "País",
    header_language: "Idioma",
    country_ng: "Nigeria",
    country_us: "Estados Unidos",
    country_gb: "Reino Unido",
    home_title: "Tus noticias, en foco.",
    home_subtitle: "Nigeria y el mundo. Lee la historia, sigue la fuente.",
    briefing_title: "Último informe",
    read_story: "Leer historia",
    latest_news: "Últimas noticias",
    your_news_feed: "Tu feed de noticias",
    feed_tailored: "Adaptado a tus temas suscritos y preferencias de lectura.",
    choose_topics: "Elige tus temas",
    reader_dashboard: "Panel del lector",
    ask_ai_title: "Preguntar a Aboki IA",
    ask_ai_desc: "Las respuestas usan las noticias almacenadas en esta aplicación.",
    ask_ai_prompt: "¿Cuáles son los últimos titulares?",
    ask_ai_placeholder: "Haz una pregunta",
    ask_ai_btn: "Preguntar",
    ask_ai_thinking: "Pensando…",
    explore_topics: "Explorar temas",
    more_to_explore: "Más para explorar",
    briefing_recap: "Resumen de noticias",
    full_timeline: "Cronología completa",
    footer_tagline: "Periodismo multiperspectiva · Izquierda · Centro · Derecha",
    translate_heading: "Lector multilingüe",
    translate_button: "Traducir artículo",
    translate_restoring: "Ver original en inglés",
  },
  ha: {
    nav_home: "Gida",
    nav_feed: "Labaraina",
    nav_saved: "Ajiyayyu",
    nav_topics: "Batutuwa",
    nav_local: "Labaran Kasa",
    nav_timelines: "Jerin Lokaci",
    nav_lopsided: "Ra’ayoyi",
    nav_dashboard: "Shafin Mai Karatu",
    nav_login: "Shiga",
    nav_signup: "Yi Rajista",
    nav_logout: "Fita",
    nav_logging_out: "Ana fita…",
    header_search_placeholder: "Nemi labarai",
    header_search_btn: "Nema",
    header_country: "Kasa",
    header_language: "Harshe",
    country_ng: "Najeriya",
    country_us: "Amurka",
    country_gb: "Birtaniya",
    home_title: "Labaranku, a bayyane.",
    home_subtitle: "Najeriya da duniya baki daya. Karanta labarin, bi majiyar.",
    briefing_title: "Muhimman labarai",
    read_story: "Karanta cikakken labari",
    latest_news: "Sabbin Labarai",
    your_news_feed: "Zababbun Labaranku",
    feed_tailored: "An tsara shi bisa batutuwan da kuka zaba.",
    choose_topics: "Zabi batutuwa",
    reader_dashboard: "Shafin Mai Karatu",
    ask_ai_title: "Tambayi Aboki AI",
    ask_ai_desc: "Amsoshi sun fito ne daga labaran da aka adana.",
    ask_ai_prompt: "Menene sabbin kanun labarai?",
    ask_ai_placeholder: "Rubuta tambaya",
    ask_ai_btn: "Tambaya",
    ask_ai_thinking: "Ana nazari…",
    explore_topics: "Binciki batutuwa",
    more_to_explore: "Karin batutuwa",
    briefing_recap: "Takaitaccen Labarai",
    full_timeline: "Dukkan jerin lokaci",
    footer_tagline: "Rahotanni masu daidaito · Hagu · Tsakiya · Dama",
    translate_heading: "Fassarar Harsuna",
    translate_button: "Fassara labari",
    translate_restoring: "Nuna Turanci na asali",
  },
  yo: {
    nav_home: "Ilé",
    nav_feed: "Ìròyìn Mi",
    nav_saved: "Àwọn Àkópamọ́",
    nav_topics: "Àwọn Kókó",
    nav_local: "Ìròyìn Ibílẹ̀",
    nav_timelines: "Àkójọpọ̀ Àkókò",
    nav_lopsided: "Ojú-ìwòye",
    nav_dashboard: "Ojú-ewé Olùkà",
    nav_login: "Wọlé",
    nav_signup: "Forúkọsílẹ̀",
    nav_logout: "Jáde",
    nav_logging_out: "Ń jáde…",
    header_search_placeholder: "Wá ìròyìn",
    header_search_btn: "Wá",
    header_country: "Orílẹ̀-èdè",
    header_language: "Èdè",
    country_ng: "Nàìjíríà",
    country_us: "Amẹ́ríkà",
    country_gb: "Ilẹ̀ Gẹ̀ẹ́sì",
    home_title: "Ìròyìn rẹ, ní kedere.",
    home_subtitle: "Nàìjíríà àti àgbáyé. Ka ìtàn náà, tẹ̀lé orísun rẹ̀.",
    briefing_title: "Ìròyìn Pàtàkì",
    read_story: "Ka ìròyìn náà",
    latest_news: "Ìròyìn Tuntun",
    your_news_feed: "Àkójọ Ìròyìn Rẹ",
    feed_tailored: "A ṣètò rẹ̀ gẹ́gẹ́ bí àwọn kókó ìròyìn tí o yàn.",
    choose_topics: "Yan àwọn kókó",
    reader_dashboard: "Ojú-ewé Olùkà",
    ask_ai_title: "Bèèrè lọ́wọ́ Aboki AI",
    ask_ai_desc: "Àwọn ìdáhùn wá láti inú ìròyìn tí a fipamọ́.",
    ask_ai_prompt: "Kí ni àwọn akọlé ìròyìn tuntun?",
    ask_ai_placeholder: "Bèèrè ìbéèrè",
    ask_ai_btn: "Bèèrè",
    ask_ai_thinking: "Ń ronú…",
    explore_topics: "Ṣàwárí àwọn kókó",
    more_to_explore: "Àwọn kókó míràn",
    briefing_recap: "Àkótán Ìròyìn",
    full_timeline: "Gbogbo àkójọpọ̀ àkókò",
    footer_tagline: "Ìròyìn ojú-ìwòye púpọ̀ · Òsì · Àárín · Ọ̀tún",
    translate_heading: "Ìtumọ̀ Èdè",
    translate_button: "Túọ̀ ìròyìn yìí",
    translate_restoring: "Fi èdè Gẹ̀ẹ́sì hàn",
  },
  ig: {
    nav_home: "Ụlọ",
    nav_feed: "Akụkọ M",
    nav_saved: "Akụkọ Edebere",
    nav_topics: "Isiokwu",
    nav_local: "Akụkọ Obodo",
    nav_timelines: "Usoro Oge",
    nav_lopsided: "Echiche Dị Iche",
    nav_dashboard: "ọdụ Ọgụụ",
    nav_login: "Banye",
    nav_signup: "Debanye Aha",
    nav_logout: "Pụọ",
    nav_logging_out: "Na-apụ…",
    header_search_placeholder: "Chọọ akụkọ",
    header_search_btn: "Chọọ",
    header_country: "Obodo",
    header_language: "Asụsụ",
    country_ng: "Naịjirịa",
    country_us: "Amerịka",
    country_gb: "Obodo Oyibo",
    home_title: "Akụkọ gị, nke ọma.",
    home_subtitle: "Naịjirịa na ụwa niile. Gụọ akụkọ ahụ, soro ebe ọ si.",
    briefing_title: "Achịkọta Akụkọ",
    read_story: "Gụọ akụkọ a",
    latest_news: "Akụkọ Kachasị Ọhụrụ",
    your_news_feed: "Akụkọ Nhọrọ Gị",
    feed_tailored: "Ahaziri maka isiokwu na ọgụgụ ị họpụtara.",
    choose_topics: "Họrọ isiokwu",
    reader_dashboard: "Ọdụ Ọgụụ",
    ask_ai_title: "Jụọ Aboki AI",
    ask_ai_desc: "Azịza si n’akụkọ echekwara n’ime ngwa a.",
    ask_ai_prompt: "Gịnị bụ isi akụkọ ọhụrụ?",
    ask_ai_placeholder: "Jụọ ajụjụ",
    ask_ai_btn: "Jụọ",
    ask_ai_thinking: "Na-eche…",
    explore_topics: "Chọpụta isiokwu",
    more_to_explore: "Isiokwu ndị ọzọ",
    briefing_recap: "Nchịkọta Ngwa Ngwa",
    full_timeline: "Usoro oge zuru ezu",
    footer_tagline: "Akụkọ si n’akụkụ niile · Ekpe · Etiti · Nri",
    translate_heading: "Ntụgharị Asụsụ",
    translate_button: "Tụgharịa akụkọ a",
    translate_restoring: "Gosi Bekee mbụ",
  },
  ar: {
    nav_home: "الرئيسية",
    nav_feed: "موجزي",
    nav_saved: "المحفوظات",
    nav_topics: "المواضيع",
    nav_local: "أخبار محلية",
    nav_timelines: "الخط الزمني",
    nav_lopsided: "توازن التغطية",
    nav_dashboard: "لوحة القارئ",
    nav_login: "تسجيل الدخول",
    nav_signup: "إنشاء حساب",
    nav_logout: "تسجيل الخروج",
    nav_logging_out: "جارٍ الخروج…",
    header_search_placeholder: "ابحث في الأخبار",
    header_search_btn: "بحث",
    header_country: "الدولة",
    header_language: "اللغة",
    country_ng: "نيجيريا",
    country_us: "الولايات المتحدة",
    country_gb: "المملكة المتحدة",
    home_title: "أخبارك، بوضوح تام.",
    home_subtitle: "نيجيريا والعالم. اقرأ الخبر وتابع المصدر.",
    briefing_title: "أحدث الموجزات",
    read_story: "اقرأ الخبر",
    latest_news: "آخر الأخبار",
    your_news_feed: "موجز أخبارك",
    feed_tailored: "مخصص حسب المواضيع وتفضيلات القراءة الخاصة بك.",
    choose_topics: "اختر مواضيعك",
    reader_dashboard: "لوحة القارئ",
    ask_ai_title: "اسأل ذكاء أبوكي",
    ask_ai_desc: "تعتمد الإجابات على الأخبار المخزنة في التطبيق.",
    ask_ai_prompt: "ما هي أحدث العناوين؟",
    ask_ai_placeholder: "اطرح سؤالاً",
    ask_ai_btn: "اسأل",
    ask_ai_thinking: "جارٍ التفكير…",
    explore_topics: "استكشف المواضيع",
    more_to_explore: "المزيد للاستكشاف",
    briefing_recap: "ملخص سريع",
    full_timeline: "الخط الزمني الكامل",
    footer_tagline: "تغطية متعددة الزوايا · يسار · وسط · يمين",
    translate_heading: "قارئ متعدد اللغات",
    translate_button: "ترجمة المقال",
    translate_restoring: "عرض النص الأصلي (الإنجليزية)",
  },
};

export function getLanguageMeta(code) {
  return (
    SUPPORTED_LANGUAGES.find((item) => item.code === code) ||
    SUPPORTED_LANGUAGES[0]
  );
}

export function applyLanguageToDocument(code) {
  if (typeof document === "undefined") return;
  const meta = getLanguageMeta(code);
  document.documentElement.lang = meta.code;
  document.documentElement.dir = meta.dir;
}

export function useLanguage() {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const sync = () => {
      try {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";
        const valid = SUPPORTED_LANGUAGES.some((l) => l.code === stored)
          ? stored
          : "en";
        setLangState(valid);
        applyLanguageToDocument(valid);
      } catch {
        setLangState("en");
      }
    };

    sync();
    window.addEventListener("news-language", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("news-language", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function setLanguage(nextCode) {
    const meta = getLanguageMeta(nextCode);
    setLangState(meta.code);
    try {
      if (meta.code === "en") {
        localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      } else {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, meta.code);
      }
    } catch {
      // Ignore storage errors
    }
    applyLanguageToDocument(meta.code);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("news-language"));
    }
  }

  function t(key, fallback = "") {
    const dict = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;
    return dict[key] || UI_TRANSLATIONS.en[key] || fallback || key;
  }

  return {
    lang,
    langMeta: getLanguageMeta(lang),
    setLanguage,
    t,
    languages: SUPPORTED_LANGUAGES,
  };
}
