// Self-contained topic art: no stock photos, remote assets, scripts or raw HTML.
const ICONS = {
  sport: '<circle cx="80" cy="80" r="52"/><path d="m80 54 25 18-10 29H65L55 72Zm0-26v26m-49 11 24 7m-8 53 18-24m48 24-18-24m34-36-24 7"/>',
  entertainment: '<path d="M48 120V44l70-14v76M48 62l70-14"/><ellipse cx="34" cy="122" rx="17" ry="11"/><ellipse cx="104" cy="108" rx="17" ry="11"/>',
  culture: '<path d="m26 48 54-24 54 24H26Zm8 86h92M44 61v56m24-56v56m24-56v56m24-56v56M30 122h100"/>',
  health: '<path d="M60 28h40v32h32v40h-32v32H60v-32H28V60h32Z"/>',
  science: '<circle cx="80" cy="80" r="9"/><ellipse cx="80" cy="80" rx="61" ry="22"/><ellipse cx="80" cy="80" rx="61" ry="22" transform="rotate(60 80 80)"/><ellipse cx="80" cy="80" rx="61" ry="22" transform="rotate(120 80 80)"/>',
  technology: '<rect x="47" y="47" width="66" height="66" rx="10"/><path d="M65 20v27m30-27v27m-30 66v27m30-27v27M20 65h27m-27 30h27m66-30h27m-27 30h27"/><rect x="65" y="65" width="30" height="30" rx="3"/>',
  finance: '<path d="M25 130h110M40 113V82h18v31m15 0V59h18v54m15 0V32h18v81M34 57l29-21 25 9 37-26"/>',
  business: '<rect x="24" y="48" width="112" height="84" rx="8"/><path d="M57 48V30h46v18M24 80q56 34 112 0M70 85h20v19H70Z"/>',
  education: '<path d="M80 132V38q-32-21-59-8v91q29-12 59 11Zm0 0V38q32-21 59-8v91q-29-12-59 11Z"/>',
  environment: '<path d="M39 119C15 57 84 24 133 27c7 52-19 113-77 101M30 139 111 53M58 112V81m22 9h26"/>',
  politics: '<path d="m22 57 58-34 58 34H22Zm12 74h92M42 69v47m25-47v47m26-47v47m25-47v47M27 122h106"/>',
  travel: '<path d="m20 97 47-16 31-50 16 1-18 46 34-7 13 11-51 13-27 37-12-2 12-29-37 7Z"/>',
  lifestyle: '<path d="M80 132 30 84C-5 46 47 9 80 48c33-39 85-2 50 36Z"/>',
  world: '<circle cx="80" cy="80" r="57"/><ellipse cx="80" cy="80" rx="26" ry="57"/><path d="M23 80h114M31 51h98M31 109h98"/>',
  local: '<path d="m24 71 56-47 56 47M39 65v67h82V65M68 132V94h25v38"/>',
  news: '<rect x="28" y="27" width="104" height="108" rx="5"/><path d="M44 47h72M44 65h72M44 83h28v30H44Zm43 0h29m-29 15h29m-29 15h29"/>',
};
const escape = value => String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
function lines(value) {
  const chunks=[];
  let line='';
  for(const word of String(value).split(/\s+/)) {
    // Long URLs or unbroken text are split without allowing SVG overflow.
    for(const chunk of Array.from(word).join('').match(/.{1,27}/gu) || ['']) {
      if((line+' '+chunk).trim().length>27) { chunks.push(line); line=chunk; }
      else line=(line+' '+chunk).trim();
    }
  }
  if(line) chunks.push(line);
  return chunks.slice(0,5);
}
export function renderNewsIllustration({ story, topic, title }) {
  topic=Object.hasOwn(ICONS,topic) ? topic : 'news';
  story=String(story || 'news').slice(0,160);
  title=String(title || 'News report').slice(0,180);
  let seed=2166136261;
  for(const char of story) seed=Math.imul(seed ^ char.codePointAt(0),16777619)>>>0;
  const hue=seed%360;
  const marks=Array.from({length:24},(_,i)=>{
    const digit=story.charCodeAt(i%story.length);
    return `<path d="M${33+i*24} ${328-(digit%23)}v${8+(digit%31)}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400" role="img" aria-labelledby="title description"><title id="title">${escape(title)}</title><desc id="description">${escape(topic)} topic illustration. No photograph supplied. Story ${escape(story)}.</desc><rect width="640" height="400" fill="hsl(${hue} 28% 95%)"/><circle cx="535" cy="126" r="122" fill="hsl(${hue} 35% 89%)"/><g fill="none" stroke="hsl(${hue} 40% 35%)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" transform="translate(439 45) scale(.9)">${ICONS[topic]}</g><text x="36" y="44" font-family="Arial,sans-serif" font-size="13" letter-spacing="2" fill="#9b3e18">${escape(topic.toUpperCase())} · TOPIC ILLUSTRATION</text><text x="36" y="100" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="#222">${lines(title).map((line,i)=>`<tspan x="36" dy="${i?34:0}">${escape(line)}</tspan>`).join('')}</text><g stroke="hsl(${hue} 35% 48%)" stroke-width="3" opacity=".5">${marks}</g><text x="36" y="378" font-family="Arial,sans-serif" font-size="12" fill="#555">AbokiNews · Illustration, not an event photograph</text></svg>`;
}
