/* Framework-free Godot UI parity. Events are local intents; no services are called. */
(() => {
  'use strict';
  const assetBase = new URL('.', document.currentScript.src);
  const initialized = new WeakMap();
  let sequence = 0, listening = null;
  const uid = prefix => `op-${prefix}-${++sequence}`;
  const emit = (node, type, detail) => node.dispatchEvent(new CustomEvent(`op:${type}`, { bubbles: true, detail }));
  const nodes = (root, selector) => [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
  function once(node, feature, setup) {
    const features = initialized.get(node) || new Set();
    if (features.has(feature)) return;
    features.add(feature); initialized.set(node, features); setup();
  }
  function selectCard(card) {
    if (card.disabled) return;
    const group = card.closest('[data-card-group]');
    group.querySelectorAll('.op-card').forEach(peer => {
      peer.setAttribute('aria-checked', String(peer === card)); peer.tabIndex = peer === card ? 0 : -1;
    });
    const value = card.dataset.card || card.querySelector('strong')?.textContent || '';
    const status = group.parentElement.querySelector('[data-card-status]');
    if (status) status.textContent = `${card.querySelector('strong')?.textContent || value} selected.`;
    emit(group, 'selection', { value, card });
  }
  function cards(group) {
    const enabled = () => [...group.querySelectorAll('.op-card:not(:disabled)')];
    const selected = enabled().find(card => card.getAttribute('aria-checked') === 'true') || enabled()[0];
    enabled().forEach(card => { card.tabIndex = card === selected ? 0 : -1; });
    group.addEventListener('click', event => { const card = event.target.closest('.op-card'); if (card && !card.dataset.cancelActivation) selectCard(card); });
    group.addEventListener('keydown', event => {
      const card = event.target.closest('.op-card'), options = enabled(); if (!card) return;
      let index = options.indexOf(card);
      if (['ArrowLeft', 'ArrowUp'].includes(event.key)) index--;
      else if (['ArrowRight', 'ArrowDown'].includes(event.key)) index++;
      else if (event.key === 'Home') index = 0; else if (event.key === 'End') index = options.length - 1; else return;
      event.preventDefault(); const next = options[(index + options.length) % options.length];
      next?.focus(); if (next) selectCard(next);
    });
  }
  function feedback(button) {
    const update = () => button.style.setProperty('--op-hover-scale', Math.min(1.04, 1 + 12 / Math.max(1, button.offsetWidth, button.offsetHeight)));
    new ResizeObserver(update).observe(button); update();
    const cancel = () => { if (button.classList.contains('is-held')) button.dataset.cancelActivation = 'true'; button.classList.remove('is-held'); };
    button.addEventListener('pointerdown', event => { delete button.dataset.cancelActivation; if (!button.disabled && event.button === 0) button.classList.add('is-held'); });
    button.addEventListener('keydown', event => {
      if (event.key === 'Escape') cancel();
      else if ([' ', 'Enter'].includes(event.key) && !event.repeat) { delete button.dataset.cancelActivation; button.classList.add('is-held'); }
    });
    button.addEventListener('click', event => {
      if (button.dataset.cancelActivation) { event.preventDefault(); event.stopImmediatePropagation(); }
      button.classList.remove('is-held');
    }, true);
    for (const type of ['pointercancel', 'pointerleave', 'blur']) button.addEventListener(type, cancel);
    for (const type of ['pointerup', 'keyup']) button.addEventListener(type, () => button.classList.remove('is-held'));
    window.addEventListener('blur', cancel);
  }
  function tabs(tablist) {
    const options = () => [...tablist.querySelectorAll('[role=tab]:not(:disabled)')];
    function select(tab, focus = false) {
      if (!tab || tab.disabled) return;
      const panels = new Set();
      options().forEach(peer => {
        const active = peer === tab; peer.setAttribute('aria-selected', String(active)); peer.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(peer.getAttribute('aria-controls')); if (panel) panels.add(panel);
      });
      panels.forEach(panel => { panel.hidden = true; });
      const activePanel = document.getElementById(tab.getAttribute('aria-controls'));
      if (activePanel) { activePanel.hidden = false; activePanel.setAttribute('aria-labelledby', tab.id); }
      if (focus) tab.focus();
      emit(tablist, 'tab', { value: tab.dataset.value || tab.textContent.trim(), index: options().indexOf(tab) });
    }
    tablist.addEventListener('click', event => select(event.target.closest('[role=tab]')));
    tablist.addEventListener('keydown', event => {
      const all = options(), index = all.indexOf(event.target); if (index < 0) return;
      const direction = getComputedStyle(tablist).direction === 'rtl' ? -1 : 1;
      let next = index;
      if (event.key === 'ArrowRight') next += direction; else if (event.key === 'ArrowLeft') next -= direction;
      else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = all.length - 1; else return;
      event.preventDefault(); select(all[(next + all.length) % all.length], true);
    });
    select(options().find(tab => tab.getAttribute('aria-selected') === 'true') || options()[0]);
  }
  function dropdown(select) {
    const wrapper = document.createElement('div'); wrapper.className = 'op-select'; select.before(wrapper); wrapper.append(select);
    const button = document.createElement('button'); button.type = 'button'; button.className = 'op-button op-button--secondary op-select__trigger';
    button.setAttribute('role', 'combobox'); button.setAttribute('aria-haspopup', 'listbox'); button.setAttribute('aria-expanded', 'false');
    const caption = document.createElement('span'), arrow = document.createElement('img');
    arrow.src = new URL('assets/godot/icon-arrow.png', assetBase).href; arrow.alt = ''; button.append(caption, arrow); wrapper.append(button);
    const popup = document.createElement('div'); popup.id = uid('options'); popup.className = 'op-select__popup'; popup.role = 'listbox'; popup.hidden = true; document.body.append(popup);
    button.setAttribute('aria-controls', popup.id);
    const labels = [...select.labels || []];
    labels.forEach(label => { if (!label.id) label.id = uid('label'); label.addEventListener('click', event => { if (event.target === label) button.focus(); }); });
    if (labels.length) button.setAttribute('aria-labelledby', labels.map(label => label.id).join(' '));
    else button.setAttribute('aria-label', select.getAttribute('aria-label') || 'Select an option');
    let active = select.selectedIndex, search = '', lastTyped = 0;
    const options = () => [...select.options];
    function close() { popup.hidden = true; button.setAttribute('aria-expanded', 'false'); button.removeAttribute('aria-activedescendant'); }
    function sync() {
      caption.textContent = select.selectedOptions[0]?.textContent || 'Select'; button.disabled = select.disabled;
      button.setAttribute('aria-required', String(select.required));
      popup.replaceChildren(...options().map((option, index) => {
        const row = document.createElement('div'); row.id = `${popup.id}-${index}`; row.className = 'op-select__option'; row.role = 'option'; row.textContent = option.textContent; row.dataset.index = index;
        row.setAttribute('aria-selected', String(option.selected)); row.setAttribute('aria-disabled', String(option.disabled || !!option.closest('optgroup:disabled'))); return row;
      }));
      if (button.disabled) close();
    }
    function position() {
      if (popup.hidden) return;
      const rect = button.getBoundingClientRect(), below = innerHeight - rect.bottom - 8, above = rect.top - 8, height = Math.min(360, Math.max(below, above));
      popup.style.width = `${Math.min(rect.width, innerWidth - 16)}px`; popup.style.maxHeight = `${height}px`;
      popup.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - popup.offsetWidth - 8))}px`;
      popup.style.top = `${below >= Math.min(360, popup.scrollHeight) || below >= above ? rect.bottom + 4 : Math.max(8, rect.top - Math.min(height, popup.scrollHeight) - 4)}px`;
    }
    function activate(index) {
      active = index; [...popup.children].forEach((row, i) => row.classList.toggle('is-active', i === active));
      const row = popup.children[active];
      if (row) {
        button.setAttribute('aria-activedescendant', row.id);
        if (row.offsetTop < popup.scrollTop) popup.scrollTop = row.offsetTop;
        else if (row.offsetTop + row.offsetHeight > popup.scrollTop + popup.clientHeight) popup.scrollTop = row.offsetTop + row.offsetHeight - popup.clientHeight;
      }
    }
    function open() {
      if (select.disabled) return;
      document.querySelectorAll('.op-select__trigger[aria-expanded=true]').forEach(other => { if (other !== button) other.click(); });
      popup.hidden = false; button.setAttribute('aria-expanded', 'true'); position(); activate(select.selectedIndex);
    }
    function choose(index) {
      if (!options()[index] || popup.children[index].getAttribute('aria-disabled') === 'true') return;
      select.selectedIndex = index; select.dispatchEvent(new Event('input', { bubbles: true })); select.dispatchEvent(new Event('change', { bubbles: true })); close(); button.focus();
    }
    button.addEventListener('click', () => popup.hidden ? open() : close());
    button.addEventListener('keydown', event => {
      const enabled = options().map((o, i) => popup.children[i].getAttribute('aria-disabled') === 'true' ? -1 : i).filter(i => i >= 0);
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault(); if (popup.hidden) open(); let next = enabled.indexOf(active) + (event.key === 'ArrowUp' ? -1 : 1);
        if (event.key === 'Home') next = 0; if (event.key === 'End') next = enabled.length - 1;
        activate(enabled[Math.max(0, Math.min(enabled.length - 1, next))]);
      } else if (['Enter', ' '].includes(event.key)) { event.preventDefault(); popup.hidden ? open() : choose(active); }
      else if (event.key === 'Escape') { event.preventDefault(); close(); } else if (event.key === 'Tab') close();
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const now = Date.now(); search = now - lastTyped > 800 ? event.key : search + event.key; lastTyped = now;
        const match = enabled.find(i => options()[i].textContent.trim().toLowerCase().startsWith(search.toLowerCase()));
        if (match !== undefined) { event.preventDefault(); if (popup.hidden) open(); activate(match); }
      }
    });
    popup.addEventListener('pointerdown', event => { if (event.target.closest('[data-index]')) event.preventDefault(); });
    popup.addEventListener('click', event => { const row = event.target.closest('[data-index]'); if (row) choose(Number(row.dataset.index)); });
    document.addEventListener('pointerdown', event => { if (!wrapper.contains(event.target) && !popup.contains(event.target)) close(); });
    document.addEventListener('focusin', event => { if (!wrapper.contains(event.target) && !popup.contains(event.target)) close(); });
    window.addEventListener('resize', position); document.addEventListener('scroll', event => { if (!popup.contains(event.target)) position(); }, true);
    select.addEventListener('change', sync); select.form?.addEventListener('reset', () => queueMicrotask(sync));
    new MutationObserver(sync).observe(select, { attributes: true, childList: true, subtree: true });
    select.addEventListener('invalid', event => { event.preventDefault(); button.focus(); button.setAttribute('aria-invalid', 'true'); });
    select.addEventListener('change', () => button.removeAttribute('aria-invalid'));
    select.hidden = true; sync(); once(button, 'feedback', () => feedback(button));
  }
  function scrollbar(scroll) {
    const viewport = scroll.querySelector(':scope > .op-scroll__viewport, :scope > textarea.op-field'); if (!viewport) return;
    const horizontal = scroll.dataset.orientation === 'horizontal', axis = horizontal ? 'scrollLeft' : 'scrollTop', size = horizontal ? 'clientWidth' : 'clientHeight', total = horizontal ? 'scrollWidth' : 'scrollHeight';
    const rail = document.createElement('div'), thumb = document.createElement('div'); rail.className = 'op-scroll__rail'; rail.role = 'scrollbar'; rail.tabIndex = 0;
    rail.setAttribute('aria-label', scroll.getAttribute('aria-label') || 'Scroll content'); rail.setAttribute('aria-orientation', horizontal ? 'horizontal' : 'vertical');
    if (!viewport.id) viewport.id = uid('viewport'); rail.setAttribute('aria-controls', viewport.id); rail.setAttribute('aria-valuemin', '0');
    thumb.className = 'op-scroll__thumb'; rail.append(thumb); scroll.append(rail); scroll.classList.add('is-enhanced');
    let travel = 0, max = 0, origin = 0, originScroll = 0, dragging = false;
    function sync() {
      max = Math.max(0, viewport[total] - viewport[size]);
      const length = Math.max(0, rail[size] - 24), handle = Math.min(length, Math.max(24, length * viewport[size] / Math.max(1, viewport[total])));
      travel = Math.max(0, length - handle); thumb.style[horizontal ? 'width' : 'height'] = `${handle}px`;
      thumb.style[horizontal ? 'left' : 'top'] = `${12 + travel * viewport[axis] / Math.max(1, max)}px`;
      const disabled = max === 0 || scroll.dataset.disabled === 'true';
      rail.setAttribute('aria-disabled', String(disabled)); rail.setAttribute('aria-valuemax', String(Math.round(max))); rail.setAttribute('aria-valuenow', String(Math.round(viewport[axis]))); rail.tabIndex = disabled ? -1 : 0;
      rail.hidden = max === 0 && scroll.dataset.alwaysVisible !== 'true'; viewport.style[horizontal ? 'marginBottom' : 'marginRight'] = rail.hidden ? '0' : '';
    }
    rail.addEventListener('pointerdown', event => {
      if (rail.getAttribute('aria-disabled') === 'true' || event.button !== 0) return;
      event.preventDefault(); rail.focus(); rail.setPointerCapture(event.pointerId); const coordinate = horizontal ? event.clientX : event.clientY;
      if (event.target === thumb) { dragging = true; origin = coordinate; originScroll = viewport[axis]; rail.classList.add('is-held'); }
      else { const bounds = thumb.getBoundingClientRect(); viewport[axis] += (coordinate < (horizontal ? bounds.left : bounds.top) ? -1 : 1) * viewport[size] * .8; }
    });
    rail.addEventListener('pointermove', event => { if (dragging && travel > 0) viewport[axis] = originScroll + ((horizontal ? event.clientX : event.clientY) - origin) * max / travel; });
    const stop = () => { dragging = false; rail.classList.remove('is-held'); };
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur']) rail.addEventListener(type, stop);
    rail.addEventListener('keydown', event => {
      if (rail.getAttribute('aria-disabled') === 'true') return;
      const moves = { ArrowDown: 24, ArrowRight: 24, ArrowUp: -24, ArrowLeft: -24, PageDown: viewport[size] * .8, PageUp: -viewport[size] * .8, Home: -max, End: max };
      if (event.key in moves) { event.preventDefault(); viewport[axis] += moves[event.key]; }
    });
    rail.addEventListener('wheel', event => { if (max > 0) { event.preventDefault(); viewport[axis] += event.deltaY || event.deltaX; } }, { passive: false });
    viewport.addEventListener('scroll', sync, { passive: true }); const observer = new ResizeObserver(sync); observer.observe(viewport); if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);
    viewport.addEventListener('input', sync);
    new MutationObserver(sync).observe(viewport, { childList: true, subtree: true, characterData: true });
    new MutationObserver(sync).observe(scroll, { attributes: true, attributeFilter: ['data-disabled'] }); sync();
  }
  function listbox(list) {
    const options = () => [...list.querySelectorAll('[role=option]:not([aria-disabled=true])')];
    function select(option, focus = false) {
      if (!option || option.getAttribute('aria-disabled') === 'true') return;
      options().forEach(peer => { peer.setAttribute('aria-selected', String(peer === option)); peer.tabIndex = peer === option ? 0 : -1; });
      if (focus) { option.focus({ preventScroll: true }); option.scrollIntoView({ block: 'nearest' }); }
      emit(list, 'selection', { value: option.dataset.value || option.textContent.trim() });
    }
    list.addEventListener('click', event => select(event.target.closest('[role=option]')));
    list.addEventListener('keydown', event => {
      const all = options(); let index = all.indexOf(event.target);
      if (event.key === 'ArrowDown') index++; else if (event.key === 'ArrowUp') index--;
      else if (event.key === 'Home') index = 0; else if (event.key === 'End') index = all.length - 1; else return;
      event.preventDefault(); select(all[Math.max(0, Math.min(all.length - 1, index))], true);
    });
    const all = options(); all.forEach(option => { option.tabIndex = -1; }); if (all.length) (all.find(option => option.getAttribute('aria-selected') === 'true') || all[0]).tabIndex = 0;
  }
  function dialog(box) {
    box.addEventListener('click', event => { const action = event.target.closest('[data-dialog-result]'); if (action) box.close(action.dataset.dialogResult); });
    box.addEventListener('close', () => emit(box, box.returnValue === 'confirm' ? 'confirmed' : 'dismissed', {}));
  }
  function openDialog(box, trigger) {
    if (box.open) return; box.returnValue = ''; box.showModal();
    (box.querySelector('[data-dialog-result=cancel]') || box.querySelector('button'))?.focus();
    box.addEventListener('close', () => { if (trigger?.isConnected) trigger.focus(); }, { once: true });
  }
  function stepper(stepper) {
    let step = Math.max(0, Math.min(4, Number(stepper.dataset.step || 0)));
    function sync() {
      stepper.dataset.step = step; stepper.querySelector('[data-step-readout]').textContent = `Step ${step + 1} of 5`;
      stepper.querySelector('[data-step-back]').disabled = step === 0; stepper.querySelector('[data-step-next]').disabled = step === 4;
    }
    stepper.addEventListener('click', event => {
      if (event.target.closest('[data-step-back]')) step = Math.max(0, step - 1);
      else if (event.target.closest('[data-step-next]')) step = Math.min(4, step + 1); else return;
      sync(); emit(stepper, 'step', { step, count: 5 });
    }); sync();
  }
  function keybindings(group) {
    const peers = [...group.querySelectorAll('[data-binding]')];
    const refresh = () => peers.forEach(peer => { peer.textContent = peer.dataset.key || 'Unbound'; peer.setAttribute('aria-label', `${peer.dataset.binding}: ${peer.textContent}`); });
    peers.forEach(button => button.addEventListener('click', () => {
      if (listening) listening.cancel(); refresh(); button.textContent = 'Press a key…';
      listening = { button, cancel: refresh, capture: key => {
        const other = peers.find(peer => peer !== button && peer.dataset.key === key);
        function commit() { if (other) other.dataset.key = ''; button.dataset.key = key; refresh(); emit(group, 'binding', { action: button.dataset.binding, key, replaced: other?.dataset.binding || null }); }
        if (!other) { commit(); return; }
        const box = document.getElementById(group.dataset.conflictDialog);
        if (!box) { refresh(); emit(group, 'binding-conflict', { action: button.dataset.binding, key, other: other.dataset.binding }); return; }
        box.querySelector('[data-dialog-message]').textContent = `${key} is already assigned to ${other.dataset.binding}. Replace that binding?`;
        openDialog(box, button); box.addEventListener('close', () => { if (box.returnValue === 'confirm') commit(); else refresh(); }, { once: true }); refresh();
      } };
    })); refresh();
  }
  document.addEventListener('keydown', event => {
    if (!listening || event.repeat) return; event.preventDefault(); event.stopImmediatePropagation();
    const capture = listening; listening = null;
    if (event.key === 'Escape' || capture.button.disabled) { capture.cancel(); return; }
    capture.capture(event.key === ' ' ? 'Space' : event.key.length === 1 ? event.key.toUpperCase() : event.key);
  }, true);
  window.addEventListener('blur', () => { if (listening) { listening.cancel(); listening = null; } });
  function conversation(form) {
    const input = form.querySelector('[data-message-input]'), send = form.querySelector('[data-message-send]'), history = form.querySelector('[data-message-history]'), status = form.querySelector('[data-conversation-status]');
    function sync() {
      const unavailable = form.dataset.available === 'false', pending = form.dataset.pending === 'true';
      input.disabled = unavailable || pending; send.disabled = unavailable || pending || !input.value.trim();
      form.querySelectorAll('[role=tab]').forEach(tab => { tab.disabled = unavailable || pending; });
      status.textContent = unavailable ? form.dataset.unavailableReason || 'Conversation unavailable.' : pending ? 'Message pending…' : '';
      status.hidden = !status.textContent; form.setAttribute('aria-busy', String(pending));
    }
    form.addEventListener('submit', event => {
      event.preventDefault(); if (send.disabled) return;
      const text = input.value.trim(), mode = form.querySelector('[role=tab][aria-selected=true]')?.dataset.value || 'speak';
      const message = document.createElement('p'); message.textContent = text; message.dataset.outgoing = ''; message.dataset.mode = mode; history.append(message);
      input.value = ''; sync(); const viewport = history.closest('.op-scroll__viewport'); if (viewport) viewport.scrollTop = viewport.scrollHeight;
      emit(form, 'submit', { text, mode });
    });
    input.addEventListener('input', sync);
    input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); if (!event.repeat && !send.disabled) form.requestSubmit(); } });
    new MutationObserver(sync).observe(form, { attributes: true, attributeFilter: ['data-pending', 'data-available'] }); sync();
  }
  function tooltip(target) {
    const tip = document.createElement('div'); tip.className = 'op-tooltip'; tip.role = 'tooltip'; tip.id = uid('tooltip'); tip.hidden = true; tip.textContent = target.dataset.opTooltip; document.body.append(tip);
    target.setAttribute('aria-describedby', [target.getAttribute('aria-describedby'), tip.id].filter(Boolean).join(' '));
    function position() { if (!tip.hidden) { const rect = target.getBoundingClientRect(); tip.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - tip.offsetWidth - 8))}px`; tip.style.top = `${Math.max(8, Math.min(rect.bottom + 6, innerHeight - tip.offsetHeight - 8))}px`; } }
    const show = () => { if (!target.disabled) { tip.hidden = false; position(); } }, hide = () => { tip.hidden = true; };
    target.addEventListener('pointerenter', show); target.addEventListener('focus', show); target.addEventListener('pointerleave', hide); target.addEventListener('blur', hide);
    target.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); }); document.addEventListener('scroll', position, true); window.addEventListener('resize', position);
  }
  function init(root = document) {
    nodes(root, '.op-field-shell').forEach(node => once(node, 'field-focus', () => {
      const focus = document.createElement('span'); focus.className = 'op-field-focus'; focus.setAttribute('aria-hidden', 'true'); node.append(focus);
    }));
    for (const [selector, feature, setup] of [
      ['.op-button,.op-card', 'feedback', feedback], ['[data-card-group]', 'cards', cards], ['[data-op-tabs]', 'tabs', tabs],
      ['select[data-op-select]', 'select', dropdown], ['[data-op-scroll],.op-field-shell:has(>textarea.op-field)', 'scroll', scrollbar], ['[data-op-list]', 'list', listbox],
      ['dialog.op-dialog', 'dialog', dialog], ['[data-op-stepper]', 'stepper', stepper], ['[data-binding-group]', 'bindings', keybindings],
      ['[data-op-conversation]', 'conversation', conversation], ['[data-op-tooltip]', 'tooltip', tooltip]
    ]) nodes(root, selector).forEach(node => once(node, feature, () => setup(node)));
    nodes(root, '[data-op-dialog]').forEach(node => once(node, 'open-dialog', () => node.addEventListener('click', () => { const box = document.getElementById(node.dataset.opDialog); if (box) openDialog(box, node); })));
    nodes(root, '.op-slider').forEach(node => once(node, 'slider', () => {
      const sync = () => { node.style.setProperty('--op-value', `${100 * (node.value - Number(node.min || 0)) / (Number(node.max || 100) - Number(node.min || 0) || 1)}%`); const output = document.getElementById(node.dataset.output); if (output) output.value = node.value; };
      node.addEventListener('input', sync); node.form?.addEventListener('reset', () => queueMicrotask(sync)); sync();
    }));
    nodes(root, 'progress.op-progress').forEach(node => once(node, 'progress', () => {
      const sync = () => node.style.setProperty('--op-progress-fill', node.value >= node.max ? 'var(--op-green)' : 'var(--op-blue)');
      new MutationObserver(sync).observe(node, { attributes: true, attributeFilter: ['value', 'max'] }); sync();
    }));
  }
  window.OutpostUI = { init, openDialog, selectCard, setConversationState(form, state) {
    if (!['expanded', 'minimized', 'closed'].includes(state)) throw new Error('Invalid conversation state'); form.dataset.state = state; emit(form, 'state', { state });
  }, setMarkerZoom(marker, zoom) { marker.dataset.detail = zoom >= 1 ? 'full' : zoom >= .75 ? 'compact' : 'overview'; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init()); else init();
})();
