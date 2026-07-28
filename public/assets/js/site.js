const menuButton = document.querySelector('[data-menu-button]');
const navigation = document.querySelector('[data-navigation]');

const menuTranslations = {
  'pt-BR': { game: 'O jogo', press: 'Kit de imprensa', support: 'Suporte', updates: 'Receber novidades', menu: 'Menu' },
  cs: { game: 'Hra', press: 'Press kit', support: 'Podpora', updates: 'Odebírat novinky', menu: 'Nabídka' },
  da: { game: 'Spillet', press: 'Pressekit', support: 'Support', updates: 'Få opdateringer', menu: 'Menu' },
  nl: { game: 'Het spel', press: 'Perskit', support: 'Ondersteuning', updates: 'Updates ontvangen', menu: 'Menu' },
  en: { game: 'The game', press: 'Press kit', support: 'Support', updates: 'Get updates', menu: 'Menu' },
  fi: { game: 'Peli', press: 'Lehdistöpaketti', support: 'Tuki', updates: 'Saa päivityksiä', menu: 'Valikko' },
  fr: { game: 'Le jeu', press: 'Kit presse', support: 'Assistance', updates: 'Recevoir les actualités', menu: 'Menu' },
  de: { game: 'Das Spiel', press: 'Pressekit', support: 'Support', updates: 'Updates erhalten', menu: 'Menü' },
  hi: { game: 'गेम', press: 'प्रेस किट', support: 'सहायता', updates: 'अपडेट पाएं', menu: 'मेनू' },
  hu: { game: 'A játék', press: 'Sajtócsomag', support: 'Támogatás', updates: 'Frissítések kérése', menu: 'Menü' },
  it: { game: 'Il gioco', press: 'Kit stampa', support: 'Supporto', updates: 'Ricevi aggiornamenti', menu: 'Menu' },
  ja: { game: 'ゲーム', press: 'プレスキット', support: 'サポート', updates: '最新情報', menu: 'メニュー' },
  ko: { game: '게임', press: '프레스 키트', support: '지원', updates: '소식 받기', menu: '메뉴' },
  nb: { game: 'Spillet', press: 'Pressepakke', support: 'Brukerstøtte', updates: 'Få oppdateringer', menu: 'Meny' },
  pl: { game: 'Gra', press: 'Materiały prasowe', support: 'Wsparcie', updates: 'Otrzymuj aktualizacje', menu: 'Menu' },
  'pt-PT': { game: 'O jogo', press: 'Kit de imprensa', support: 'Suporte', updates: 'Receber novidades', menu: 'Menu' },
  ru: { game: 'Игра', press: 'Пресс-кит', support: 'Поддержка', updates: 'Получать новости', menu: 'Меню' },
  'zh-CN': { game: '游戏', press: '媒体资料包', support: '支持', updates: '获取更新', menu: '菜单' },
  es: { game: 'El juego', press: 'Kit de prensa', support: 'Soporte', updates: 'Recibir novedades', menu: 'Menú' },
  sv: { game: 'Spelet', press: 'Presskit', support: 'Support', updates: 'Få uppdateringar', menu: 'Meny' },
  th: { game: 'เกม', press: 'ชุดสื่อ', support: 'ฝ่ายช่วยเหลือ', updates: 'รับข่าวสาร', menu: 'เมนู' },
  'zh-TW': { game: '遊戲', press: '媒體資料包', support: '支援', updates: '獲取最新消息', menu: '選單' },
  tr: { game: 'Oyun', press: 'Basın kiti', support: 'Destek', updates: 'Güncellemeleri al', menu: 'Menü' },
  uk: { game: 'Гра', press: 'Прескіт', support: 'Підтримка', updates: 'Отримувати новини', menu: 'Меню' },
};

function applyMenuLanguage(code) {
  const translations = menuTranslations[code] || menuTranslations.en;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[key]) element.textContent = translations[key];
  });
  document.documentElement.dataset.menuLanguage = code;
}

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation?.setAttribute('data-open', String(open));
  document.body.classList.toggle('menu-open', open);
});

document.querySelectorAll('[data-navigation] a').forEach((link) => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  navigation?.setAttribute('data-open', 'false');
  document.body.classList.remove('menu-open');
}));

document.querySelectorAll('[data-gallery-thumb]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-gallery-thumb]').forEach((item) => item.setAttribute('aria-pressed', 'false'));
    button.setAttribute('aria-pressed', 'true');
    const main = document.querySelector('[data-gallery-main]');
    if (main) main.style.backgroundPosition = button.getAttribute('data-position') || 'center';
  });
});

document.querySelectorAll('[data-language-option]').forEach((button) => {
  button.addEventListener('click', () => {
    const menu = button.closest('.language-menu');
    const current = menu?.querySelector('[data-language-current]');
    const summaryImage = menu?.querySelector('summary img');
    const optionImage = button.querySelector('img');
    menu?.querySelectorAll('[data-language-option]').forEach((item) => item.removeAttribute('aria-selected'));
    button.setAttribute('aria-selected', 'true');
    if (current) current.textContent = button.querySelector('span')?.textContent || 'English';
    if (summaryImage && optionImage) summaryImage.src = optionImage.src;
    if (menu) menu.open = false;
    const code = button.dataset.code || 'en';
    localStorage.setItem('pangea-menu-language', code);
    applyMenuLanguage(code);
  });
});

const savedMenuLanguage = localStorage.getItem('pangea-menu-language') || 'en';
const savedLanguageButton = document.querySelector(`[data-language-option][data-code="${savedMenuLanguage}"]`);
if (savedLanguageButton) savedLanguageButton.click();

document.querySelectorAll('form[data-api-form]').forEach((form) => {
  const startedAt = form.querySelector('[name="startedAt"]');
  if (startedAt) startedAt.value = String(Date.now());

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-form-status]');
    const submit = form.querySelector('button[type="submit"]');
    status.textContent = 'Sending…';
    status.dataset.state = 'pending';
    submit.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.code || 'request_failed');
      const reference = result.reference ? ` Reference: ${result.reference}.` : '';
      status.textContent = `${form.dataset.successMessage || 'Thank you. Your message was received.'}${reference}`;
      status.dataset.state = 'success';
      form.reset();
      if (startedAt) startedAt.value = String(Date.now());
    } catch (error) {
      status.textContent = error.message === 'rate_limited' ? 'Too many attempts. Please try again later.' : 'We could not send this right now. Please try again.';
      status.dataset.state = 'error';
    } finally {
      submit.disabled = false;
      status.focus();
    }
  });
});
