document.addEventListener('DOMContentLoaded', () => {
  const i18n = window.PangeaI18n;
  const menuButton = document.querySelector('[data-menu-button]');
  const navigation = document.querySelector('[data-navigation]');
  function closeMenu(restoreFocus = false) {
    const wasOpen = menuButton?.getAttribute('aria-expanded') === 'true';
    menuButton?.setAttribute('aria-expanded', 'false');
    navigation?.setAttribute('data-open', 'false');
    document.body.classList.remove('menu-open');
    if (restoreFocus && wasOpen) menuButton.focus();
  }
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    navigation?.setAttribute('data-open', String(open));
    document.body.classList.toggle('menu-open', open);
  });
  navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      // An open combobox consumes Escape before the mobile menu closes.
      if (!event.defaultPrevented) closeMenu(true);
    }
  });
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.site-header,.op-select__popup')) closeMenu();
  });
  matchMedia('(max-width:900px)').addEventListener('change', event => { if (!event.matches) closeMenu(); });
  document.querySelectorAll('.primary-nav>a').forEach(link => {
    if (new URL(link.href).pathname === location.pathname && !new URL(link.href).hash) link.setAttribute('aria-current', 'page');
  });

  const languageSelect = document.querySelector('[data-menu-language]');
  languageSelect?.addEventListener('change', () => {
    const locale = languageSelect.value;
    if (!window.PangeaLocale.availableLocales.includes(locale)) return;
    try {
      localStorage.setItem('pangea-language', locale);
      document.cookie = `pangea_locale=${encodeURIComponent(locale)}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    } catch { /* Explicit locale URLs still work without persistent storage. */ }
    const target = new URL(location.href), parts = target.pathname.split('/');
    if (window.PangeaLocale.availableLocales.includes(parts[1])) parts[1] = locale;
    else parts.splice(1, 0, locale);
    target.pathname = parts.join('/');
    closeMenu(); location.assign(target.href);
  });

  function localizedValidity(field) {
    field.setCustomValidity('');
    const validity = field.validity;
    let key = '';
    if (validity.valueMissing) key = field.type === 'checkbox' ? 'consent' : 'required';
    else if (validity.typeMismatch) key = field.type === 'email' ? 'email' : 'bad_input';
    else if (validity.tooShort) key = 'too_short';
    else if (validity.tooLong) key = 'too_long';
    else if (validity.rangeUnderflow) key = 'range_underflow';
    else if (validity.rangeOverflow) key = 'range_overflow';
    else if (validity.patternMismatch) key = 'pattern';
    else if (validity.badInput) key = 'bad_input';
    else if (validity.stepMismatch) key = 'step';
    if (key) field.setCustomValidity(i18n.t('validation.' + key, {
      min: field.minLength > 0 ? i18n.number(field.minLength) : field.min,
      max: field.maxLength > 0 ? i18n.number(field.maxLength) : field.max,
    }));
  }

  document.querySelectorAll('[data-gallery-thumb]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-gallery-thumb]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      const main = document.querySelector('[data-gallery-main]');
      if (main) main.style.backgroundPosition = button.dataset.position || 'center';
    });
  });

  document.querySelectorAll('form[data-api-form]').forEach(form => {
    const startedAt = form.querySelector('[name="startedAt"]');
    if (startedAt) startedAt.value = String(Date.now());
    form.addEventListener('invalid', event => {
      const field = event.target;
      localizedValidity(field); field.setAttribute('aria-invalid', 'true');
      const trigger = field.hidden ? field.parentElement.querySelector('[role="combobox"]') : null;
      trigger?.setAttribute('aria-invalid', 'true');
      const status = form.querySelector('[data-form-status]');
      status.textContent = i18n.t('validation.summary'); status.dataset.state = 'error';
    }, true);
    for (const type of ['input', 'change']) form.addEventListener(type, event => {
      const field = event.target;
      if (typeof field.setCustomValidity !== 'function') return;
      field.setCustomValidity(''); field.removeAttribute('aria-invalid');
      if (field.hidden) field.parentElement.querySelector('[role="combobox"]')?.removeAttribute('aria-invalid');
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (form.getAttribute('aria-busy') === 'true') return;
      const status = form.querySelector('[data-form-status]');
      const submit = form.querySelector('button[type="submit"]');
      status.textContent = i18n.t('form.pending'); status.dataset.state = 'pending';
      submit.disabled = true; form.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch(form.action, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.code || 'request_failed');
        const reference = result.reference ? ' ' + i18n.t('form.reference', { reference: result.reference }) : '';
        status.textContent = `${form.dataset.successMessage || i18n.t('form.success')}${reference}`;
        status.dataset.state = 'success'; form.reset();
        if (startedAt) startedAt.value = String(Date.now());
      } catch (error) {
        const code = ['rate_limited', 'invalid_request'].includes(error.message) ? error.message : 'service_unavailable';
        status.textContent = i18n.t('form.error.' + code);
        status.dataset.state = 'error';
      } finally {
        submit.disabled = false; form.setAttribute('aria-busy', 'false'); status.focus();
      }
    });
  });
});
