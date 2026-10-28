export const COUNTRIES = [
  ["ng", "Nigeria"], ["us", "United States"], ["gb", "United Kingdom"],
  ["ca", "Canada"], ["au", "Australia"], ["nz", "New Zealand"],
  ["gh", "Ghana"], ["ke", "Kenya"], ["za", "South Africa"], ["eg", "Egypt"],
  ["ma", "Morocco"], ["tz", "Tanzania"], ["ug", "Uganda"], ["et", "Ethiopia"],
  ["rw", "Rwanda"], ["sn", "Senegal"], ["cm", "Cameroon"], ["ci", "Côte d’Ivoire"],
  ["de", "Germany"], ["fr", "France"], ["es", "Spain"], ["it", "Italy"],
  ["pt", "Portugal"], ["nl", "Netherlands"], ["be", "Belgium"], ["ch", "Switzerland"],
  ["at", "Austria"], ["ie", "Ireland"], ["se", "Sweden"], ["no", "Norway"],
  ["dk", "Denmark"], ["fi", "Finland"], ["pl", "Poland"], ["gr", "Greece"],
  ["ua", "Ukraine"], ["tr", "Türkiye"], ["ro", "Romania"], ["cz", "Czechia"],
  ["in", "India"], ["pk", "Pakistan"], ["bd", "Bangladesh"], ["lk", "Sri Lanka"],
  ["cn", "China"], ["jp", "Japan"], ["kr", "South Korea"], ["sg", "Singapore"],
  ["my", "Malaysia"], ["id", "Indonesia"], ["ph", "Philippines"], ["th", "Thailand"], ["vn", "Vietnam"],
  ["ae", "United Arab Emirates"], ["sa", "Saudi Arabia"], ["qa", "Qatar"], ["il", "Israel"],
  ["br", "Brazil"], ["mx", "Mexico"], ["ar", "Argentina"], ["cl", "Chile"], ["co", "Colombia"], ["pe", "Peru"],
].map(([code, name]) => ({ code, name }));

export function normalizeCountry(value) {
  const code = String(value || "").toLowerCase() === "uk" ? "gb" : String(value || "").toLowerCase();
  return COUNTRIES.some(country => country.code === code) ? code : "";
}

export function countryName(code, language = "en") {
  const country = COUNTRIES.find(item => item.code === code);
  if (!country) return "Your country";
  try { return new Intl.DisplayNames([language], { type: "region" }).of(code.toUpperCase()) || country.name; }
  catch { return country.name; }
}

export function inferBrowserCountry(timeZone, language) {
  const exact = {
    "Africa/Lagos": "ng", "Africa/Accra": "gh", "Africa/Nairobi": "ke", "Africa/Johannesburg": "za", "Africa/Cairo": "eg",
    "Europe/London": "gb", "Europe/Paris": "fr", "Europe/Berlin": "de", "Europe/Madrid": "es", "Europe/Rome": "it", "Europe/Lisbon": "pt",
    "Asia/Kolkata": "in", "Asia/Calcutta": "in", "Asia/Tokyo": "jp", "Asia/Seoul": "kr", "Asia/Shanghai": "cn", "Asia/Singapore": "sg", "Asia/Dubai": "ae",
    "America/New_York": "us", "America/Chicago": "us", "America/Denver": "us", "America/Los_Angeles": "us", "America/Phoenix": "us", "America/Detroit": "us", "America/Anchorage": "us", "Pacific/Honolulu": "us",
    "America/Toronto": "ca", "America/Vancouver": "ca", "America/Mexico_City": "mx", "America/Sao_Paulo": "br",
    "Australia/Sydney": "au", "Australia/Melbourne": "au", "Australia/Perth": "au", "Pacific/Auckland": "nz",
  };
  return exact[timeZone] || normalizeCountry(String(language).split(/[-_]/)[1]);
}

export function articleMatchesCountry(article, code) {
  const aliases = { ng: ["nigeria"], us: ["usa", "united states", "united states of america"], gb: ["uk", "united kingdom"] };
  const accepted = [code, ...(aliases[code] || []), countryName(code).toLowerCase()];
  return String(article.location || "").toLowerCase().split(/[,;|]/).some(value => accepted.includes(value.trim()));
}
