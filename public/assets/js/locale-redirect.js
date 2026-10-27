/* Generated locale gateway. Explicit locale URLs always take precedence. */
(() => {
  const published=["en","pt-BR"], fallback="en";
  let saved='';
  try { saved=localStorage.getItem('pangea-language')||''; } catch {}
  if (!saved) { try { saved=decodeURIComponent(document.cookie.split(';').map(value=>value.trim()).find(value=>value.startsWith('pangea_locale='))?.slice(14)||''); } catch {} }
  const preferences=[saved,...(navigator.languages||[])];
  const locale=preferences.map(value=>published.find(code=>code.toLowerCase()===value.toLowerCase())||published.find(code=>code.split('-')[0]===value.split('-')[0])).find(Boolean)||fallback;
  location.replace('/'+locale+'/'+location.search+location.hash);
})();
