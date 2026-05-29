/* ============================================================
   SportMeet — App  (UI logic, usa Store do store.js)
   ============================================================ */

/* ── utilitários globais ─────────────────────────────────── */
function $$(sel, ctx) { return (ctx || document).querySelectorAll(sel); }
function $(sel,  ctx) { return (ctx || document).querySelector(sel); }
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function setHTML(id, val) { const el = document.getElementById(id); if (el) el.innerHTML   = val; }
function show(id)  { const el = document.getElementById(id); if (el) el.style.display = ''; }
function hide(id)  { const el = document.getElementById(id); if (el) el.style.display = 'none'; }

function showToast(msg, dur) {
  let t = document.getElementById('sm-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'sm-toast';
    Object.assign(t.style, {
      position:'fixed', bottom:'calc(80px + env(safe-area-inset-bottom,0px))', left:'50%',
      transform:'translateX(-50%)',
      background:'#111827', color:'#fff', padding:'10px 20px', borderRadius:'24px',
      fontSize:'13px', fontWeight:'600', boxShadow:'0 4px 16px rgba(0,0,0,.25)',
      zIndex:'9999', whiteSpace:'nowrap', opacity:'0', transition:'opacity .25s',
      maxWidth:'85vw', textAlign:'center', pointerEvents:'none',
    });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.opacity = '0'; }, dur || 2800);
}

function buildAvatarRow(participants, limit) {
  const sl = participants.slice(0, limit || 5);
  const rest = participants.length - sl.length;
  return sl.map(p => {
    const av = `<div class="avatar av-sm ${p.c}" title="${p.name||p.i}">${p.i}</div>`;
    if (!p.name) return av;
    const href = _personHref(p.name);
    return `<a href="${href}" style="display:inline-flex;line-height:0;border-radius:50%;transition:transform .15s" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform=''">${av}</a>`;
  }).join('')
  + (rest > 0 ? `<div class="avatar av-sm av-green" style="font-size:10px">+${rest}</div>` : '');
}

function buildEventBanner(ev) {
  return `
    <div class="ev-banner-wrap mb-16" style="border-radius:var(--r);overflow:hidden">
      <div style="background:${ev.gradient};padding:16px;display:flex;align-items:center;gap:12px">
        <div style="font-size:30px;line-height:1;background:rgba(255,255,255,.15);border-radius:10px;width:48px;height:48px;display:flex;align-items:center;justify-content:center">${ev.sport}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:16px;color:white;line-height:1.2">${ev.title}</div>
          <div style="font-size:12px;color:rgba(255,255,255,.85);margin-top:3px">${Store.fmt.full(ev.datetime)} · ${ev.duration}</div>
        </div>
      </div>
    </div>`;
}

function _gradientColor(g) {
  const m = g.match(/#[0-9a-fA-F]{6}/);
  return m ? m[0] : '#22C55E';
}

/* ── roteador ── */
document.addEventListener('DOMContentLoaded', () => {
  Store.load();
  const page = location.pathname.split('/').pop().replace('.html','') || 'index';
  const routes = {
    '':                        initHome,
    'index':                   initHome,
    'buscar':                  initSearch,
    'resultados':              initResults,
    'detalhes':                initDetails,
    'adicionado-agenda':       initAdded,
    'criar-evento':            initCreateForm,
    'convidar-amigos':         initInvite,
    'evento-criado':           initCreated,
    'agenda':                  initAgenda,
    'confirmar-cancelamento':  initCancelConfirm,
    'evento-cancelado':        initCancelled,
    'perfil':                  initProfile,
    'notificacoes':            initNotifications,
    'amigo':                   initFriendProfile,
    'lista':                   initLista,
  };
  (routes[page] || (() => {}))();
});

/* ============================================================
   HOME
   ============================================================ */
/* ── path helper ── */
function _inPages() { return location.pathname.includes('/pages/'); }
function _detailsHref(id) { return (_inPages() ? '' : 'pages/') + 'detalhes.html?id=' + id; }

/* ── person profile link ── resolves to friend page if known, else stranger view */
function _personHref(name, explicitId) {
  const base = _inPages() ? '' : 'pages/';
  if (explicitId) return base + 'amigo.html?id=' + explicitId;
  const match = Store.getFriends().find(f => f.name.toLowerCase() === (name||'').toLowerCase());
  if (match) return base + 'amigo.html?id=' + match.id;
  return base + 'amigo.html?name=' + encodeURIComponent(name || 'Usuário');
}

function initHome() {
  // Sync header avatar with stored profile
  const u = Store.getUser();
  const headerAv = document.getElementById('header-avatar');
  if (headerAv) {
    headerAv.textContent = u.initials;
    headerAv.className   = 'avatar av-md ' + u.colorClass;
  }
  _renderHomeWeek();
  _renderHomeInvites();
  _renderFeed();
  _updateBadge();
}

function _renderHomeInvites() {
  const el = document.getElementById('home-invites');
  if (!el) return;
  const invites = Store.getNotifications().filter(n => n.type === 'invite').slice(0, 3);
  if (invites.length === 0) {
    el.innerHTML = '<div class="mini-event" style="color:var(--text-4);font-size:12px">Nenhum convite pendente</div>';
    return;
  }
  el.innerHTML = invites.map(n => {
    const ph = (_inPages() ? '' : 'pages/') + 'notificacoes.html';
    return `
    <a href="${ph}" style="text-decoration:none;color:inherit;display:block">
      <div class="mini-invite">
        <div class="avatar av-sm ${n.fromColor}">${n.fromInitial}</div>
        <div>
          <div class="mini-invite-name">${n.from}</div>
          <div class="mini-invite-sport">${n.label}</div>
        </div>
      </div>
    </a>`;
  }).join('');
}

function _renderHomeWeek() {
  const myEvs = Store.getMyEvents();
  const container = document.getElementById('week-events');
  if (!container) return;
  if (myEvs.length === 0) {
    container.innerHTML = '<div class="mini-event" style="color:var(--text-4);font-size:12px">Nenhum evento esta semana</div>';
    return;
  }
  container.innerHTML = myEvs.slice(0,4).map(ev =>
    `<div class="mini-event">
      <span class="dot" style="background:${_gradientColor(ev.gradient)}"></span>
      <span>${ev.sport} ${ev.title} · ${Store.fmt.dow(ev.datetime)}</span>
    </div>`
  ).join('');
}

function _updateBadge() {
  const badge = document.getElementById('badge-new');
  if (!badge) return;
  const n = Store.getNewCount();
  if (n <= 0) { badge.style.display = 'none'; return; }
  badge.textContent = n + ' novo' + (n !== 1 ? 's' : '');
  badge.style.display = '';
}

/* ── feed / swipe ── */
function _renderFeed() {
  const stack = document.getElementById('swipe-stack');
  if (!stack) return;

  // Fresh clone action buttons to remove stale listeners
  ['btn-accept','btn-reject'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { const n = el.cloneNode(true); el.parentNode.replaceChild(n, el); }
  });

  const cards = Store.getFeedStack();
  if (cards.length === 0) {
    stack.innerHTML = '<div class="feed-empty"><p>Você viu todos os eventos por agora 👋<br><small>Volte mais tarde!</small></p></div>';
    return;
  }

  stack.innerHTML = cards.slice().reverse().map((card, ri) => {
    const i      = cards.length - 1 - ri;
    const cls    = i === 0 ? '' : i === 1 ? 'behind1' : 'behind2';
    const frontId = i === 0 ? 'id="front-card"' : '';
    const desc   = card.description ? card.description.slice(0, 80) + (card.description.length > 80 ? '…' : '') : '';
    const profileHref = _personHref(card.createdBy);
    return `
      <div class="swipe-card ${cls}" ${frontId} style="user-select:none">
        ${i === 0 ? `
          <div class="swipe-overlay left"  id="swipe-label-no">PASSA</div>
          <div class="swipe-overlay right" id="swipe-label-yes">ENTRA</div>
        ` : ''}
        <div class="card-bg" style="background:${card.gradient}">
          <div class="card-top-badges">
            <div class="card-age-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              ${card.ageRange}
            </div>
          </div>
          <div class="card-emoji-xl">${card.sport}</div>
          <div class="card-info-overlay">
            <div class="card-title-w">${card.title}</div>
            <div class="card-meta-w">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${Store.fmt.full(card.datetime)} · ${card.duration}
            </div>
            <div class="card-meta-w">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${card.local}
            </div>
            ${desc ? `<div class="card-desc-w">${desc}</div>` : ''}
            <div class="card-creator-w" onclick="event.stopPropagation();location.href='${profileHref}'">
              <div class="avatar av-xs ${card.creatorColor}">${card.creatorInitial}</div>
              <span>${card.createdBy}</span>
              <a href="${_detailsHref(card.id)}" class="card-details-link-w" onclick="event.stopPropagation()">Ver detalhes</a>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');

  const frontCard = document.getElementById('front-card');
  const labelNo   = document.getElementById('swipe-label-no');
  const labelYes  = document.getElementById('swipe-label-yes');

  if (frontCard) {
    let startX = 0, startY = 0, dx = 0, dragging = false;

    /* ── touch ── */
    frontCard.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dx = 0; dragging = false;
      frontCard.style.transition = 'none';
    }, { passive: true });

    frontCard.addEventListener('touchmove', e => {
      dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (!dragging && Math.abs(dx) < Math.abs(dy)) return;
      dragging = true;
      frontCard.style.transform = `translateX(${dx}px) rotate(${dx * 0.07}deg)`;
      frontCard.style.opacity   = String(Math.max(0.3, 1 - Math.abs(dx) / 260));
      // Show directional label
      if (labelNo)  labelNo.style.opacity  = dx < 0 ? String(Math.min(1, Math.abs(dx) / 70)) : '0';
      if (labelYes) labelYes.style.opacity = dx > 0 ? String(Math.min(1, Math.abs(dx) / 70)) : '0';
    }, { passive: true });

    frontCard.addEventListener('touchend', () => {
      frontCard.style.transition = 'transform .35s ease, opacity .35s ease';
      if (labelNo)  labelNo.style.opacity  = '0';
      if (labelYes) labelYes.style.opacity = '0';
      if (dragging && dx > 80)        { _doAccept(); }
      else if (dragging && dx < -80)  { _doReject(); }
      else { frontCard.style.transform = ''; frontCard.style.opacity = '1'; }
      dx = 0; dragging = false;
    });

    /* ── mouse drag (desktop) ── */
    let mouseDown = false;
    frontCard.addEventListener('mousedown', e => {
      if (e.target.closest('a')) return; // don't start drag on links
      mouseDown = true; startX = e.clientX; startY = e.clientY; dx = 0; dragging = false;
      frontCard.style.transition = 'none';
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!mouseDown) return;
      dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!dragging && Math.abs(dx) < Math.abs(dy) && Math.abs(dy) > 5) { mouseDown = false; return; }
      if (Math.abs(dx) > 5) dragging = true;
      if (!dragging) return;
      frontCard.style.transform = `translateX(${dx}px) rotate(${dx * 0.05}deg)`;
      frontCard.style.opacity   = String(Math.max(0.3, 1 - Math.abs(dx) / 260));
      if (labelNo)  labelNo.style.opacity  = dx < 0 ? String(Math.min(1, Math.abs(dx) / 70)) : '0';
      if (labelYes) labelYes.style.opacity = dx > 0 ? String(Math.min(1, Math.abs(dx) / 70)) : '0';
    });
    document.addEventListener('mouseup', () => {
      if (!mouseDown) return;
      mouseDown = false;
      if (labelNo)  labelNo.style.opacity  = '0';
      if (labelYes) labelYes.style.opacity = '0';
      frontCard.style.transition = 'transform .35s ease, opacity .35s ease';
      if (dragging && dx > 80)        { _doAccept(); }
      else if (dragging && dx < -80)  { _doReject(); }
      else { frontCard.style.transform = ''; frontCard.style.opacity = '1'; }
      dx = 0; dragging = false;
    });
  }

  function _doAccept() {
    _dismissCard('right', () => {
      const card = Store.getCurrentFeedCard();
      Store.acceptCurrentFeed();
      if (card) Store.setPending('eventId', card.id);
      _updateBadge();
      window.location.href = (_inPages() ? '' : 'pages/') + 'adicionado-agenda.html';
    });
  }
  function _doReject() {
    _dismissCard('left', () => {
      Store.rejectCurrentFeed();
      _updateBadge();
      _renderFeed();
    });
  }

  document.getElementById('btn-accept')?.addEventListener('click', _doAccept);
  document.getElementById('btn-reject')?.addEventListener('click', _doReject);
}

function _dismissCard(dir, cb) {
  const card = document.getElementById('front-card');
  if (!card) return cb();
  card.style.transition = 'transform .35s ease, opacity .35s ease';
  card.style.transform  = dir === 'right' ? 'translateX(160%) rotate(22deg)' : 'translateX(-160%) rotate(-22deg)';
  card.style.opacity    = '0';
  setTimeout(cb, 360);
}

/* ============================================================
   BUSCAR  — smart filters + live search
   ============================================================ */
function initSearch() {
  // Restore previous state
  const prevSearch   = Store.getPending('search')   || '';
  const prevActivity = Store.getPending('filterActivity') || '';
  const prevPeriod   = Store.getPending('filterPeriod')   || '';
  const prevDate     = Store.getPending('filterDate')     || '';
  const prevAge      = Store.getPending('filterAge')      || '';

  /* ── search input ── */
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    if (prevSearch) searchInput.value = prevSearch;
    searchInput.addEventListener('input', _doLiveSearch);
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { _saveSearchFilters(); window.location.href = 'resultados.html'; }
    });
  }

  /* ── activity autocomplete ── */
  const actInput = document.getElementById('filter-activity');
  if (actInput) {
    if (prevActivity) actInput.value = prevActivity;
    _attachActivityAutocomplete(actInput, {
      onSelect: () => _doLiveSearch(),
    });
    actInput.addEventListener('input', _doLiveSearch);
  }

  /* ── date picker ── */
  const btnDate   = document.getElementById('filter-date-btn');
  const hiddenDT  = document.getElementById('filter-date-val');
  const dateDisp  = document.getElementById('filter-date-disp');
  if (btnDate && hiddenDT) {
    if (prevDate) {
      hiddenDT.value = prevDate;
      _updateFilterDateDisplay(prevDate, dateDisp);
      btnDate.classList.add('has-value');
    }
    btnDate.addEventListener('click', () => {
      _showDateTimePicker(iso => {
        hiddenDT.value = iso;
        _updateFilterDateDisplay(iso, dateDisp);
        btnDate.classList.add('has-value');
        _doLiveSearch();
      }, hiddenDT.value);
    });
    // Clear button
    const clearBtn = btnDate.querySelector('.search-filter-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', e => {
        e.stopPropagation();
        hiddenDT.value = '';
        if (dateDisp) { dateDisp.textContent = 'Qualquer data'; dateDisp.style.color = ''; }
        btnDate.classList.remove('has-value');
        _doLiveSearch();
      });
    }
  }

  /* ── age range ── */
  const ageContainer = document.getElementById('filter-age-ctrl');
  const ageHidden    = document.getElementById('filter-age-val');
  if (ageContainer && ageHidden) {
    _buildAgeRangeUI(ageContainer, ageHidden, () => _doLiveSearch());
    if (prevAge) ageHidden.value = prevAge;
  }

  /* ── period pills ── */
  $$('.period-pill').forEach(p => {
    if (prevPeriod && p.dataset.val === prevPeriod) p.classList.add('active');
    p.addEventListener('click', () => {
      const was = p.classList.contains('active');
      $$('.period-pill').forEach(x => x.classList.remove('active'));
      if (!was) p.classList.add('active');
      _doLiveSearch();
    });
  });

  /* ── location autocomplete ── */
  const localInput = document.getElementById('filter-local');
  if (localInput) _attachLocationAutocomplete(localInput, () => _doLiveSearch());

  /* ── buscar button ── */
  document.getElementById('filter-btn')?.addEventListener('click', e => {
    e.preventDefault();
    _saveSearchFilters();
    window.location.href = 'resultados.html';
  });

  _doLiveSearch();
}

function _updateFilterDateDisplay(iso, el) {
  if (!el || !iso) return;
  try {
    const d = new Date(iso);
    const DOW  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    const MONS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    el.textContent = DOW[d.getDay()] + ', ' + d.getDate() + ' ' + MONS[d.getMonth()] + ' às ' +
      String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    el.style.color = 'var(--text-1)';
  } catch(_) {}
}

function _doLiveSearch() {
  const container = document.getElementById('live-results');
  if (!container) return;

  const q        = document.getElementById('search-input')?.value.trim() || '';
  const activity = document.getElementById('filter-activity')?.value.trim() || '';
  const period   = $('.period-pill.active')?.dataset.val || '';
  const dateVal  = document.getElementById('filter-date-val')?.value || '';
  const ageVal   = document.getElementById('filter-age-val')?.value || '';
  const local    = document.getElementById('filter-local')?.value.trim() || '';

  // Build filter array for Store.search
  const filters = [];
  if (activity) filters.push(activity);
  if (period)   filters.push(period);
  if (local)    filters.push(local);
  if (ageVal && ageVal !== 'Livre') filters.push(ageVal);

  if (!q && filters.length === 0) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  let results = Store.search(q, filters);

  // Date filter (not in store.search): filter by same calendar day
  if (dateVal) {
    const d = new Date(dateVal);
    const targetDate = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    results = results.filter(ev => ev.datetime.startsWith(targetDate));
  }

  results = results.slice(0, 8);
  container.style.display = 'block';

  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:20px">
        <div class="empty-icon">🔍</div>
        <div class="empty-title" style="font-size:14px">Nenhum resultado</div>
        <div class="empty-sub">Tente outros termos ou filtros.</div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div style="font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--text-3);margin-bottom:10px">
      ${results.length} resultado${results.length !== 1 ? 's' : ''}
    </div>
    ${results.map(ev => {
      const alreadyIn = Store.isMyEvent(ev.id);
      const profHref  = _personHref(ev.createdBy);
      return `
        <div class="result-card" onclick="location.href='detalhes.html?id=${ev.id}'">
          <div class="result-thumb" style="background:${ev.gradient};font-size:22px;color:transparent;text-shadow:0 0 0 white">${ev.sport}</div>
          <div class="result-info">
            <div class="result-name">${ev.title}</div>
            <div class="result-addr">${ev.local} · ${ev.region}</div>
            <div class="result-tags">
              <span class="tag">${Store.fmt.short(ev.datetime)}</span>
              <span class="tag">${ev.ageRange}</span>
              ${alreadyIn ? '<span class="tag" style="background:var(--green-light);color:var(--green-dark)">Na agenda ✓</span>' : ''}
            </div>
            <div class="result-creator" style="margin-top:4px">
              <a href="${profHref}" class="creator-link" onclick="event.stopPropagation()">
                <div class="avatar av-sm ${ev.creatorColor}" style="width:18px;height:18px;font-size:8px">${ev.creatorInitial}</div>
                ${ev.createdBy}
              </a>
            </div>
          </div>
          <div class="result-actions"><span class="link-orange">VER ›</span></div>
        </div>`;
    }).join('')}
    <a href="resultados.html" class="btn btn-outline mt-8" style="font-size:13px" onclick="event.preventDefault();_saveSearchFilters();location.href='resultados.html'">Ver todos os resultados →</a>`;
}

function _saveSearchFilters() {
  Store.setPending('search',         document.getElementById('search-input')?.value.trim()  || '');
  Store.setPending('filterActivity', document.getElementById('filter-activity')?.value.trim() || '');
  Store.setPending('filterPeriod',   $('.period-pill.active')?.dataset.val || '');
  Store.setPending('filterDate',     document.getElementById('filter-date-val')?.value || '');
  Store.setPending('filterAge',      document.getElementById('filter-age-val')?.value  || '');
  // legacy filters key for resultados.html
  const filters = [];
  const activity = document.getElementById('filter-activity')?.value.trim();
  const period   = $('.period-pill.active')?.dataset.val;
  const local    = document.getElementById('filter-local')?.value.trim();
  if (activity) filters.push(activity);
  if (period)   filters.push(period);
  if (local)    filters.push(local);
  Store.setPending('filters', filters);
}

/* ============================================================
   RESULTADOS
   ============================================================ */
function initResults() {
  const filters  = Store.getPending('filters') || [];
  const query    = Store.getPending('search')  || '';
  const results  = Store.search(query, filters);
  const meta     = document.getElementById('results-meta');
  const list     = document.getElementById('results-list');
  if (!list) return;

  const terms = query ? [query, ...filters] : [...filters];
  const ctx   = terms.length ? ' · ' + terms.join(' · ') : '';
  if (meta) meta.innerHTML = `<b>${results.length} resultado${results.length !== 1 ? 's' : ''}</b>${ctx}`;

  if (results.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">Nenhum resultado encontrado</div>
        <div class="empty-sub">Tente outros termos ou ajuste os filtros.</div>
      </div>`;
    return;
  }

  list.innerHTML = results.map(ev => {
    const alreadyIn  = Store.isMyEvent(ev.id);
    const profHref   = _personHref(ev.createdBy);
    return `
      <div class="result-card" onclick="location.href='detalhes.html?id=${ev.id}'">
        <div class="result-thumb" style="background:${ev.gradient};font-size:22px;color:transparent;text-shadow:0 0 0 white">${ev.sport}</div>
        <div class="result-info">
          <div class="result-name">${ev.title}</div>
          <div class="result-addr">${ev.address}</div>
          <div class="result-tags">
            <span class="tag">${Store.fmt.short(ev.datetime)}</span>
            <span class="tag">${ev.ageRange}</span>
            ${alreadyIn ? '<span class="tag" style="background:var(--green-light);color:var(--green-dark)">Na agenda ✓</span>' : ''}
          </div>
          <div class="result-creator">
            <a href="${profHref}" class="creator-link" onclick="event.stopPropagation()">
              <div class="avatar av-sm ${ev.creatorColor}" style="width:20px;height:20px;font-size:9px">${ev.creatorInitial}</div>
              Criado por <b>${ev.createdBy}</b>
            </a>
          </div>
        </div>
        <div class="result-actions"><span class="link-orange">VER ›</span></div>
      </div>`;
  }).join('');
}

/* ============================================================
   DETALHES  (?id=X)
   ============================================================ */
function initDetails() {
  const id = new URLSearchParams(location.search).get('id');
  const ev = id ? Store.getEventById(id) : null;

  if (!ev) {
    const sc = document.querySelector('.screen-content');
    if (sc) sc.innerHTML = '<div class="empty-state"><div class="empty-icon">😕</div><div class="empty-title">Evento não encontrado</div></div>';
    return;
  }

  setText('det-title',     ev.title);
  setText('det-map-label', ev.address || ev.local);

  const bannerWrap = document.getElementById('det-banner');
  if (bannerWrap) bannerWrap.innerHTML = buildEventBanner(ev);

  setText('det-horario', Store.fmt.full(ev.datetime) + ' — duração ' + ev.duration);
  setText('det-local',   ev.local);
  if (ev.address !== ev.local) setText('det-address', ev.address);
  setText('det-age',     ev.ageRange);
  setText('det-desc',    ev.description || 'Sem descrição disponível.');

  // Clickable creator
  const creatorEl = document.getElementById('det-creator');
  if (creatorEl) {
    const href = _personHref(ev.createdBy);
    creatorEl.innerHTML = `<a href="${href}" class="creator-link">
      <div class="avatar av-xs ${ev.creatorColor}" style="width:26px;height:26px;font-size:10px">${ev.creatorInitial}</div>
      <span>Criado por <b>${ev.createdBy}</b></span>
    </a>`;
  }

  const partCount = ev.participants.length;
  setText('det-part-label', 'Participantes · ' + partCount + ' de ' + ev.maxParticipants);
  const partRow = document.getElementById('det-avatars');
  if (partRow) partRow.innerHTML = buildAvatarRow(ev.participants, 6);

  const badgeEl = document.getElementById('det-status-badge');
  if (badgeEl) {
    badgeEl.textContent = ev.isOpen ? 'Aberto' : 'Privado';
    badgeEl.style.background = ev.isOpen ? 'var(--green-light)' : '#FEE2E2';
    badgeEl.style.color      = ev.isOpen ? 'var(--green-dark)' : 'var(--red)';
  }

  const alreadyIn = Store.isMyEvent(ev.id);
  const btnAdd    = document.getElementById('btn-add');
  const btnCancel = document.getElementById('btn-cancel');

  if (alreadyIn) {
    if (btnAdd)    btnAdd.style.display    = 'none';
    if (btnCancel) {
      btnCancel.style.display = '';
      btnCancel.href = 'confirmar-cancelamento.html?id=' + ev.id;
    }
  } else {
    if (btnCancel) btnCancel.style.display = 'none';
    if (btnAdd) {
      btnAdd.style.display = '';
      btnAdd.addEventListener('click', e => {
        e.preventDefault();
        Store.setPending('eventId', ev.id);
        Store.joinEvent({ ...ev, source:'search' });
        window.location.href = 'adicionado-agenda.html';
      });
    }
  }
}

/* ============================================================
   ADICIONADO À AGENDA
   ============================================================ */
function initAdded() {
  const evId = Store.getPending('eventId') || Store._s?._pendingEventId;
  const ev   = evId ? Store.getEventById(evId) : null;

  if (ev) {
    const timeEl = document.getElementById('ev-added-time');
    const locEl  = document.getElementById('ev-added-local');
    const infoEl = document.getElementById('ev-added-info');
    if (timeEl) timeEl.innerHTML = '<b>' + Store.fmt.short(ev.datetime) + '</b> — ' + ev.title;
    if (locEl)  locEl.textContent  = ev.local;
    if (infoEl) infoEl.textContent = 'Duração: ' + ev.duration + ' · ' + ev.participants.length + ' de ' + ev.maxParticipants + ' vagas';
  }
}

/* ============================================================
   CRIAR EVENTO  — activity autocomplete + age range + location + date
   ============================================================ */
function initCreateForm() {
  /* ── activity autocomplete ── */
  const tipoInput = document.getElementById('input-tipo');
  if (tipoInput) {
    _attachActivityAutocomplete(tipoInput, {
      onSelect: (data) => {
        // store selected activity data for later
        tipoInput.dataset.slug  = data.slug  || '';
        tipoInput.dataset.emoji = data.emoji || '';
        tipoInput.dataset.gradient = data.gradient || '';
      },
    });
  }

  /* ── location autocomplete ── */
  const localInput = document.getElementById('input-local');
  if (localInput) _attachLocationAutocomplete(localInput);

  /* ── date/time picker ── */
  const btnDate  = document.getElementById('btn-datetime');
  const hiddenDT = document.getElementById('input-datetime');
  if (btnDate && hiddenDT) {
    function updateDateBtn(iso) {
      if (!iso) return;
      hiddenDT.value = iso;
      try {
        const d = new Date(iso);
        const DOW  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
        const MONS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
        const text = DOW[d.getDay()] + ', ' + d.getDate() + ' de ' + MONS[d.getMonth()]
                   + ' · ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
        const dispEl = document.getElementById('dt-display');
        if (dispEl) { dispEl.textContent = text; dispEl.style.color = 'var(--text-1)'; }
        else        { btnDate.textContent = text; btnDate.style.color = 'var(--text-1)'; }
      } catch(_) {}
    }
    if (hiddenDT.value) updateDateBtn(hiddenDT.value);
    btnDate.addEventListener('click', () => {
      _showDateTimePicker(iso => updateDateBtn(iso), hiddenDT.value);
    });
  }

  /* ── age range sliders ── */
  const ageContainer = document.getElementById('age-range-ctrl');
  const ageHidden    = document.getElementById('input-faixa');
  if (ageContainer && ageHidden) {
    _buildAgeRangeUI(ageContainer, ageHidden);
  }

  /* ── toggle ── */
  $$('.toggle-switch').forEach(sw => {
    sw.addEventListener('click', () => {
      sw.classList.toggle('off');
      const sub = sw.closest('.toggle-row')?.querySelector('.toggle-sub');
      if (sub) sub.textContent = sw.classList.contains('off') ? 'Apenas convidados podem entrar' : 'Qualquer pessoa pode entrar';
    });
  });

  /* ── proceed ── */
  document.getElementById('invite-friends-btn')?.addEventListener('click', e => {
    const local   = document.getElementById('input-local')?.value.trim();
    const ativ    = document.getElementById('input-atividade')?.value.trim();
    const tipoVal = document.getElementById('input-tipo')?.value.trim();
    const dtVal   = document.getElementById('input-datetime')?.value;
    const duracao = document.getElementById('input-duracao')?.value || '1h';
    const faixa   = document.getElementById('input-faixa')?.value || 'Livre';
    const maxPart = document.getElementById('input-max')?.value.trim();
    const desc    = document.getElementById('input-desc')?.value.trim();
    const aberto  = !$('.toggle-switch')?.classList.contains('off');
    const localInput2 = document.getElementById('input-local');
    const tipoInput2  = document.getElementById('input-tipo');

    if (!local) { e.preventDefault(); showToast('Informe o local do evento.'); return; }
    if (!ativ)  { e.preventDefault(); showToast('Informe o título do evento.'); return; }
    if (!dtVal) { e.preventDefault(); showToast('Selecione a data e hora.'); return; }

    // Resolve sport from activity autocomplete
    const slug     = tipoInput2?.dataset.slug  || (tipoVal || 'outro').toLowerCase().replace(/\s+/g,'');
    const emoji    = tipoInput2?.dataset.emoji || '🏅';
    const gradient = tipoInput2?.dataset.gradient || 'linear-gradient(135deg,#6B7280,#374151)';

    Store.setPending('createData', {
      local, ativ, isoDatetime: dtVal, duracao, faixa, maxPart, desc, aberto,
      sportSlug:    slug,
      sportEmoji:   emoji,
      gradient:     gradient,
      localAddress: localInput2?.dataset.address || local,
      region:       localInput2?.dataset.region  || '',
    });
  });
}

/* ============================================================
   CONVIDAR AMIGOS
   ============================================================ */
function initInvite() {
  const friends   = Store.getFriends();
  const container = document.getElementById('friend-list');
  if (!container) return;
  const selected  = new Set([0,1,2]);
  const countEl   = document.getElementById('selected-count');
  const inviteBtn = document.getElementById('invite-btn');

  /* search filter */
  const searchEl = document.getElementById('friend-search');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      const q = searchEl.value.trim().toLowerCase();
      container.querySelectorAll('.friend-item').forEach(item => {
        const name = item.querySelector('.friend-name')?.textContent.toLowerCase() || '';
        item.style.display = name.includes(q) ? '' : 'none';
      });
    });
  }

  container.innerHTML = friends.map((f, i) => `
    <div class="friend-item" data-idx="${i}">
      <div class="avatar av-md ${f.color}">${f.initial}</div>
      <div class="friend-info">
        <div class="friend-name">${f.name}</div>
        <div class="friend-sport">${f.sports.map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' · ')}</div>
      </div>
      <div class="friend-check" id="fcheck-${i}"></div>
    </div>`).join('');

  function refresh() {
    friends.forEach((_, i) => {
      const box = document.getElementById('fcheck-' + i);
      if (!box) return;
      if (selected.has(i)) {
        box.classList.add('checked');
        box.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      } else {
        box.classList.remove('checked');
        box.innerHTML = '';
      }
    });
    const n = selected.size;
    if (countEl)   countEl.textContent   = n + ' SELECIONADO' + (n !== 1 ? 'S' : '');
    if (inviteBtn) inviteBtn.textContent = 'CONVIDAR · ' + n + ' AMIGO' + (n !== 1 ? 'S' : '');
  }

  container.querySelectorAll('.friend-item').forEach(item => {
    item.addEventListener('click', () => {
      const i = +item.dataset.idx;
      selected.has(i) ? selected.delete(i) : selected.add(i);
      refresh();
    });
  });

  inviteBtn?.addEventListener('click', () => Store.setPending('selectedFriends', [...selected]));

  refresh();
}

/* ============================================================
   EVENTO CRIADO
   ============================================================ */
function initCreated() {
  const data = Store.getPending('createData');
  if (!data) return;
  const ev = Store.createEvent(data);
  Store.clearPending('createData');
  Store.setPending('eventId', ev.id);

  const count = (Store.getPending('selectedFriends') || [0,1,2]).length;
  const timeEl = document.getElementById('ev-created-time');
  const locEl  = document.getElementById('ev-created-local');
  const frdEl  = document.getElementById('ev-created-friends');
  if (timeEl) timeEl.innerHTML = '<b>' + Store.fmt.short(ev.datetime) + '</b> — ' + ev.title;
  if (locEl)  locEl.textContent = ev.local;
  if (frdEl)  frdEl.textContent = count + (count !== 1 ? ' amigos convidados' : ' amigo convidado');

  const detBtn = document.getElementById('btn-see-details');
  if (detBtn) detBtn.href = 'detalhes.html?id=' + ev.id;

  document.getElementById('btn-share')?.addEventListener('click', () => {
    const url = location.origin + '/pages/detalhes.html?id=' + ev.id;
    navigator.clipboard?.writeText(url)
      .then(() => showToast('Link copiado! 🔗'))
      .catch(() => showToast('Compartilhe o link do evento! 🔗'));
  });
}

/* ============================================================
   AGENDA
   ============================================================ */
function initAgenda() {
  _renderCalendar();
  _renderAgendaEvents();
}

function _renderAgendaEvents() {
  const list = document.getElementById('agenda-events-list');
  if (!list) return;
  const evs = Store.getMyEvents();

  if (evs.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <div class="empty-title">Nenhum evento na agenda</div>
        <div class="empty-sub">Busque eventos ou crie o seu próprio!</div>
      </div>`;
    return;
  }

  const sorted = [...evs].sort((a,b) => a.datetime.localeCompare(b.datetime));
  list.innerHTML = sorted.map(ev => `
    <a href="detalhes.html?id=${ev.id}" class="event-row" data-day="${Store.fmt.day(ev.datetime)}" style="text-decoration:none;color:inherit">
      <div class="event-date">
        <div class="event-date-day">${Store.fmt.dow(ev.datetime)}</div>
        <div class="event-date-num">${Store.fmt.day(ev.datetime)}</div>
      </div>
      <div class="event-row-info">
        <div class="event-row-name">${ev.sport} ${ev.title}</div>
        <div class="event-row-sub">${Store.fmt.time(ev.datetime)} · ${ev.local}</div>
      </div>
      <div class="event-row-arrow">›</div>
    </a>`).join('');
}

/* ── mini-calendário ── */
function _renderCalendar() {
  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  const MONTHS_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const today = new Date();
  let year = today.getFullYear(), month = today.getMonth(), selDay = today.getDate();

  function eventDays(y, m) {
    return Store.getMyEvents()
      .filter(ev => { const d = new Date(ev.datetime); return d.getFullYear()===y && d.getMonth()===m; })
      .map(ev => new Date(ev.datetime).getDate());
  }

  function render() {
    document.getElementById('cal-month').textContent = MONTHS_FULL[month] + ' ' + year;
    grid.innerHTML = '';
    ['S','T','Q','Q','S','S','D'].forEach(h => {
      const el = document.createElement('div'); el.className='cal-head'; el.textContent=h; grid.appendChild(el);
    });
    const firstDay = new Date(year,month,1).getDay();
    const offset   = firstDay===0 ? 6 : firstDay-1;
    const prevDays = new Date(year,month,0).getDate();
    for (let i=offset-1;i>=0;i--) {
      const el=document.createElement('div');el.className='cal-day empty';el.textContent=prevDays-i;grid.appendChild(el);
    }
    const days  = new Date(year,month+1,0).getDate();
    const evDays = eventDays(year, month);
    for (let d=1;d<=days;d++) {
      const el = document.createElement('div');
      let cls  = 'cal-day';
      if (d===today.getDate()&&year===today.getFullYear()&&month===today.getMonth()) cls+=' today';
      if (d===selDay) cls+=' selected';
      if (evDays.includes(d)) cls+=' has-event';
      el.className = cls; el.textContent = d;
      el.addEventListener('click', () => { selDay=d; render(); _highlightDay(d); });
      grid.appendChild(el);
    }
    const used = grid.querySelectorAll(':not(.cal-head)').length;
    const rem  = (7 - used%7)%7;
    for (let i=1;i<=rem&&rem<7;i++) {
      const el=document.createElement('div');el.className='cal-day empty';el.textContent=i;grid.appendChild(el);
    }
  }

  document.getElementById('cal-prev')?.addEventListener('click',()=>{month--;if(month<0){month=11;year--;}render();});
  document.getElementById('cal-next')?.addEventListener('click',()=>{month++;if(month>11){month=0;year++;}render();});
  render();
  _highlightDay(selDay);
}

function _highlightDay(day) {
  $$('.event-row').forEach(row => {
    row.classList.remove('highlight');
    row.querySelector('.event-date')?.classList.remove('orange');
  });
  const target = $(`.event-row[data-day="${day}"]`);
  if (target) {
    target.classList.add('highlight');
    target.querySelector('.event-date')?.classList.add('orange');
    target.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }
}

/* ============================================================
   CONFIRMAR CANCELAMENTO  (?id=X)
   ============================================================ */
function initCancelConfirm() {
  const id = new URLSearchParams(location.search).get('id');
  const ev = id ? Store.getEventById(id) : null;
  Store.setPending('cancelId', id);
  if (ev) {
    setText('ev-cancel-name', '"' + ev.title + '"');
    setText('ev-cancel-date', Store.fmt.full(ev.datetime) + '?');
  }
  const simBtn = document.getElementById('btn-sim-cancelar');
  if (simBtn) simBtn.href = 'evento-cancelado.html?id=' + id;
}

/* ============================================================
   EVENTO CANCELADO  (?id=X)
   ============================================================ */
function initCancelled() {
  const id = new URLSearchParams(location.search).get('id') || Store.getPending('cancelId');
  const ev = id ? Store.getEventById(id) : null;
  if (ev) Store.cancelEvent(id);
  Store.clearPending('cancelId');

  if (ev) {
    setText('ev-day-label', Store.fmt.dow(ev.datetime));
    setText('ev-day-num',   String(Store.fmt.day(ev.datetime)));
    setText('ev-title',     ev.title);
    setText('ev-sub',       Store.fmt.time(ev.datetime) + ' · ' + ev.local);
    setText('ev-notif',     'Os participantes foram notificados.');
  }
}

/* ============================================================
   PERFIL  — sem abas: lista plana com stats clicáveis
   ============================================================ */
const SPORT_EMOJIS = { corrida:'🏃', futebol:'⚽', basquete:'🏀', tênis:'🎾', natação:'🏊', vôlei:'🏐', ciclismo:'🚴', yoga:'🧘', escalada:'🧗', outro:'🏅' };

function initProfile() {
  const u = Store.getUser();

  /* hero */
  setText('prof-name',     u.name);
  setText('prof-user',     '@' + u.username);
  setText('prof-bio',      u.bio || '');
  setText('prof-location', u.location || '');
  setText('prof-initials', u.initials);
  const av = document.getElementById('prof-avatar');
  if (av) { av.className = 'profile-avatar'; av.classList.add(u.colorClass); }

  /* stats — clickable */
  setText('stat-participated', u.stats.participated);
  setText('stat-created',      u.stats.created);
  setText('stat-friends',      u.stats.friends);

  // Make stat items navigate
  document.getElementById('stat-link-participated')?.setAttribute('href', 'lista.html?tipo=participados');
  document.getElementById('stat-link-created')?.setAttribute('href',      'lista.html?tipo=criados');
  document.getElementById('stat-link-friends')?.setAttribute('href',      'lista.html?tipo=amigos');

  /* atividades preferidas */
  const prefs   = u.preferences?.activities || u.sports || [];
  const prefsEl = document.getElementById('prof-sports');
  if (prefsEl) {
    prefsEl.innerHTML = prefs.length
      ? prefs.map(s => `<div class="sport-chip"><span>${SPORT_EMOJIS[s.toLowerCase()] || '🏅'}</span> ${s.charAt(0).toUpperCase()+s.slice(1)}</div>`).join('')
      : '<div style="color:var(--text-4);font-size:13px">Nenhuma atividade preferida</div>';
  }

  /* próximo evento */
  const nextEl = document.getElementById('prof-next-event');
  const evs    = Store.getMyEvents().sort((a,b) => a.datetime.localeCompare(b.datetime));
  if (nextEl && evs.length > 0) {
    const ev = evs[0];
    nextEl.href = 'detalhes.html?id=' + ev.id;
    setText('prof-next-name', ev.sport + ' ' + ev.title);
    setText('prof-next-sub',  Store.fmt.short(ev.datetime) + ' · ' + ev.local);
    setText('prof-next-dow',  Store.fmt.dow(ev.datetime));
    setText('prof-next-day',  Store.fmt.day(ev.datetime));
  } else if (nextEl) {
    nextEl.style.display = 'none';
  }

  /* editar perfil */
  document.getElementById('btn-edit-profile')?.addEventListener('click', _openEditModal);
}

function _renderProfileEvents() {
  const container = document.getElementById('prof-events-list');
  if (!container) return;
  const evs = Store.getMyEvents().sort((a,b) => a.datetime.localeCompare(b.datetime));
  if (evs.length === 0) {
    container.innerHTML = '<div style="color:var(--text-4);font-size:13px;padding:12px 0 4px">Sem outros eventos na agenda.</div>';
    return;
  }
  container.innerHTML = evs.map(ev => `
    <a href="detalhes.html?id=${ev.id}" class="event-row" style="text-decoration:none;color:inherit;margin-bottom:8px">
      <div class="event-date">
        <div class="event-date-day">${Store.fmt.dow(ev.datetime)}</div>
        <div class="event-date-num">${Store.fmt.day(ev.datetime)}</div>
      </div>
      <div class="event-row-info">
        <div class="event-row-name">${ev.sport} ${ev.title}</div>
        <div class="event-row-sub">${Store.fmt.time(ev.datetime)} · ${ev.local}</div>
      </div>
      <div class="event-row-arrow">›</div>
    </a>`).join('');
}

function _openEditModal() {
  const u = Store.getUser();
  if (document.getElementById('edit-modal')) return;

  const prefs   = u.preferences || { activities: [], bairro: '' };
  const tagHtml = (prefs.activities || []).map(a => {
    const act = Store.getActivities().find(x => x.name === a);
    return `<div class="activity-tag" data-name="${a}">${act ? act.emoji + ' ' : ''}${a} <button class="tag-remove" data-name="${a}">✕</button></div>`;
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'edit-modal';
  Object.assign(modal.style, {
    position:'fixed', inset:'0', background:'rgba(0,0,0,.55)', zIndex:'2000',
    display:'flex', alignItems:'flex-end', justifyContent:'center',
  });
  modal.innerHTML = `
    <div id="edit-sheet" style="background:white;width:100%;max-width:430px;border-radius:20px 20px 0 0;padding:24px 20px calc(36px + env(safe-area-inset-bottom,0px));max-height:88vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <span style="font-weight:700;font-size:17px">Editar perfil</span>
        <button id="edit-close" style="font-size:22px;background:none;border:none;cursor:pointer;color:#6B7280;width:36px;height:36px;display:flex;align-items:center;justify-content:center">✕</button>
      </div>
      <div class="form-group">
        <label class="form-label">Nome</label>
        <input class="form-input" id="edit-name" value="${u.name}" placeholder="Seu nome completo">
      </div>
      <div class="form-group">
        <label class="form-label">Usuário</label>
        <input class="form-input" id="edit-username" value="${u.username}" placeholder="seuusuario">
      </div>
      <div class="form-group">
        <label class="form-label">Bio</label>
        <textarea class="form-input" id="edit-bio" placeholder="Conte um pouco sobre você...">${u.bio||''}</textarea>
      </div>
      <div class="form-group" style="position:relative">
        <label class="form-label">Bairro (São Paulo)</label>
        <input class="form-input" id="edit-bairro" value="${prefs.bairro||u.location||''}" placeholder="Ex: Brooklin, Pinheiros..." autocomplete="off">
      </div>
      <div class="form-group" style="position:relative">
        <label class="form-label">Atividades preferidas</label>
        <div class="activity-tags" id="edit-pref-tags">${tagHtml}</div>
        <input class="form-input" id="edit-pref-input" placeholder="Digite para buscar..." autocomplete="off">
        <div style="font-size:11px;color:var(--text-4);margin-top:4px">Essas atividades vão influenciar seu feed</div>
      </div>
      <button class="btn btn-green" id="edit-save" style="margin-top:8px">SALVAR ALTERAÇÕES</button>
    </div>`;
  document.body.appendChild(modal);

  /* bairro autocomplete */
  _attachBairroAutocomplete(document.getElementById('edit-bairro'));

  /* preferred activities multi-select */
  const prefInput  = document.getElementById('edit-pref-input');
  const prefTags   = document.getElementById('edit-pref-tags');
  if (prefInput && prefTags) {
    // Wire existing tag remove buttons
    prefTags.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('.activity-tag')?.remove());
    });

    _attachActivityAutocomplete(prefInput, {
      container: prefTags,  // pass pre-existing tags container
      multi:     true,
      onChange:  () => {},
    });
  }

  document.getElementById('edit-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  document.getElementById('edit-save').addEventListener('click', () => {
    const name     = document.getElementById('edit-name').value.trim();
    const username = document.getElementById('edit-username').value.trim().replace(/\s+/g,'').toLowerCase();
    const bio      = document.getElementById('edit-bio').value.trim();
    const bairro   = document.getElementById('edit-bairro').value.trim();

    if (!name) { showToast('Nome não pode estar vazio.'); return; }

    const initials = name.split(' ').filter(Boolean).map(w=>w[0]).join('').substring(0,2).toUpperCase();
    const newActivities = Array.from(prefTags.querySelectorAll('.activity-tag')).map(t => t.dataset.name);
    const displayLocation = bairro ? bairro + ', São Paulo' : u.location;

    Store.updateUser({ name, username, bio, location: displayLocation, initials });
    Store.updatePreferences({ activities: newActivities, bairro });

    // Update profile display
    setText('prof-name',     name);
    setText('prof-user',     '@' + username);
    setText('prof-bio',      bio);
    setText('prof-location', displayLocation);
    setText('prof-initials', initials);
    // Update avatar color class
    const profAv = document.getElementById('prof-avatar');
    if (profAv) { profAv.className = 'profile-avatar'; profAv.classList.add(u.colorClass); }

    // Refresh preferred activities chips
    const prefsEl = document.getElementById('prof-sports');
    if (prefsEl) {
      prefsEl.innerHTML = newActivities.length
        ? newActivities.map(s => `<div class="sport-chip"><span>${SPORT_EMOJIS[s.toLowerCase()] || '🏅'}</span> ${s.charAt(0).toUpperCase()+s.slice(1)}</div>`).join('')
        : '<div style="color:var(--text-4);font-size:13px">Nenhuma atividade preferida</div>';
    }

    modal.remove();
    showToast('Perfil atualizado ✓');
  });
}

function resetDemo() {
  Store.reset();
  const isPages = location.pathname.includes('/pages/');
  window.location.href = isPages ? '../index.html' : 'index.html';
}

/* ============================================================
   LISTA  (?tipo=amigos|participados|criados)
   ============================================================ */
function initLista() {
  const tipo = new URLSearchParams(location.search).get('tipo') || 'amigos';

  const titleMap = { amigos:'Meus amigos', participados:'Eventos participados', criados:'Eventos criados' };
  const titleEl  = document.querySelector('.screen-title');
  if (titleEl) titleEl.textContent = titleMap[tipo] || 'Lista';

  const container = document.getElementById('lista-content');
  if (!container) return;

  if (tipo === 'amigos') {
    const friends = Store.getFriends();
    container.innerHTML = `
      <div class="lista-header">${friends.length} amigo${friends.length !== 1 ? 's' : ''}</div>
      ${friends.map(f => `
        <a href="amigo.html?id=${f.id}" class="friend-item" style="text-decoration:none;color:inherit">
          <div class="avatar av-md ${f.color}">${f.initial}</div>
          <div class="friend-info">
            <div class="friend-name">${f.name}</div>
            <div class="friend-sport">${f.sports.map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' · ')}</div>
          </div>
          <div style="color:var(--text-4);font-size:18px">›</div>
        </a>`).join('')}`;

  } else if (tipo === 'participados') {
    const evs = Store.getMyEvents().sort((a,b) => a.datetime.localeCompare(b.datetime));
    container.innerHTML = `
      <div class="lista-header">${evs.length} evento${evs.length !== 1 ? 's' : ''}</div>
      ${evs.length === 0
        ? '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-title">Sem eventos</div></div>'
        : evs.map(ev => `
        <a href="detalhes.html?id=${ev.id}" class="event-row" style="text-decoration:none;color:inherit;margin-bottom:8px">
          <div class="event-date">
            <div class="event-date-day">${Store.fmt.dow(ev.datetime)}</div>
            <div class="event-date-num">${Store.fmt.day(ev.datetime)}</div>
          </div>
          <div class="event-row-info">
            <div class="event-row-name">${ev.sport} ${ev.title}</div>
            <div class="event-row-sub">${Store.fmt.time(ev.datetime)} · ${ev.local}</div>
          </div>
          <div class="event-row-arrow">›</div>
        </a>`).join('')}`;

  } else if (tipo === 'criados') {
    const evs = Store.getMyCreated().sort((a,b) => a.datetime.localeCompare(b.datetime));
    container.innerHTML = `
      <div class="lista-header">${evs.length} evento${evs.length !== 1 ? 's' : ''} criado${evs.length !== 1 ? 's' : ''}</div>
      ${evs.length === 0
        ? '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-title">Nenhum evento criado</div><div class="empty-sub">Crie seu primeiro evento!</div></div>'
        : evs.map(ev => `
        <a href="detalhes.html?id=${ev.id}" class="event-row" style="text-decoration:none;color:inherit;margin-bottom:8px">
          <div class="event-date">
            <div class="event-date-day">${Store.fmt.dow(ev.datetime)}</div>
            <div class="event-date-num">${Store.fmt.day(ev.datetime)}</div>
          </div>
          <div class="event-row-info">
            <div class="event-row-name">${ev.sport} ${ev.title}</div>
            <div class="event-row-sub">${Store.fmt.time(ev.datetime)} · ${ev.local}</div>
          </div>
          <div class="event-row-arrow">›</div>
        </a>`).join('')}`;
  }
}

/* ============================================================
   AMIGO  — perfil (?id=X para amigo; ?name=Y para desconhecido)
   ============================================================ */
function initFriendProfile() {
  const params    = new URLSearchParams(location.search);
  const id        = params.get('id');
  const nameParam = params.get('name');
  const friend    = id ? Store.getFriendById(id) : null;
  const followBtn = document.getElementById('friend-follow-btn');

  if (friend) {
    /* ── Amigo conhecido ── */
    const titleEl = document.querySelector('.screen-title');
    if (titleEl) titleEl.textContent = friend.name;

    setText('friend-name',     friend.name);
    setText('friend-username', '@' + friend.name.toLowerCase().replace(/\s+/g,''));
    setText('friend-bio',      friend.bio || '');
    setText('friend-location', friend.location || '');
    setText('friend-initials', friend.initial);
    const avatarEl = document.getElementById('friend-avatar');
    if (avatarEl) { avatarEl.className = 'profile-avatar'; avatarEl.classList.add(friend.color); }

    setText('friend-stat-participated', friend.stats.participated);
    setText('friend-stat-created',      friend.stats.created);
    setText('friend-stat-friends',      friend.stats.friends);

    const sportsEl = document.getElementById('friend-sports');
    if (sportsEl) {
      sportsEl.innerHTML = (friend.sports||[]).map(s =>
        `<div class="sport-chip"><span>${SPORT_EMOJIS[s]||'🏅'}</span> ${s.charAt(0).toUpperCase()+s.slice(1)}</div>`
      ).join('');
    }

    const evList = document.getElementById('friend-events-list');
    if (evList) {
      const events = Store.getFriendEvents(id);
      evList.innerHTML = events.length === 0
        ? '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-title">Nenhum evento criado</div></div>'
        : events.map(ev => `
          <a href="detalhes.html?id=${ev.id}" class="event-row" style="text-decoration:none;color:inherit;margin-bottom:8px">
            <div class="event-date">
              <div class="event-date-day">${Store.fmt.dow(ev.datetime)}</div>
              <div class="event-date-num">${Store.fmt.day(ev.datetime)}</div>
            </div>
            <div class="event-row-info">
              <div class="event-row-name">${ev.sport} ${ev.title}</div>
              <div class="event-row-sub">${Store.fmt.time(ev.datetime)} · ${ev.local}</div>
            </div>
            <div class="event-row-arrow">›</div>
          </a>`).join('');
    }

    // Already a friend — show confirmed state
    if (followBtn) {
      followBtn.textContent = 'Amigo ✓';
      followBtn.className   = 'profile-edit btn-friend-confirmed';
    }

  } else if (nameParam) {
    /* ── Perfil de desconhecido (via ?name=) ── */
    const name     = decodeURIComponent(nameParam);
    const initial  = name.substring(0, 2).toUpperCase();
    const colors   = ['av-orange','av-blue','av-green','av-purple','av-pink','av-teal'];
    const randColor = colors[name.length % colors.length];

    const titleEl = document.querySelector('.screen-title');
    if (titleEl) titleEl.textContent = name;

    setText('friend-name',     name);
    setText('friend-username', '@' + name.toLowerCase().replace(/\s+/g,''));
    setText('friend-bio',      'Usuário do SportMeet');
    setText('friend-location', 'São Paulo');
    setText('friend-initials', initial);
    const avatarEl = document.getElementById('friend-avatar');
    if (avatarEl) { avatarEl.className = 'profile-avatar'; avatarEl.classList.add(randColor); }

    const evList = document.getElementById('friend-events-list');
    if (evList) evList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔒</div>
        <div class="empty-title">Perfil privado</div>
        <div class="empty-sub">Siga para ver os eventos desta pessoa.</div>
      </div>`;

    // Hide stats and activities sections (no data for stranger)
    const statsRow = document.querySelector('.stats-row');
    if (statsRow) statsRow.style.display = 'none';
    const sportsEl2 = document.getElementById('friend-sports');
    if (sportsEl2) {
      const wrap = sportsEl2.closest('.mb-16') || sportsEl2.parentElement;
      const lbl  = wrap?.previousElementSibling;
      if (lbl && lbl.classList.contains('section-label')) lbl.style.display = 'none';
      if (wrap) wrap.style.display = 'none';
    }

    // Follow button active
    let following = false;
    if (followBtn) {
      followBtn.addEventListener('click', () => {
        if (following) return;
        following = true;
        followBtn.textContent = 'Seguindo ✓';
        followBtn.className   = 'profile-edit btn-friend-confirmed';
        showToast('Pedido de seguimento enviado! 👋');
      });
    }

  } else {
    /* ── Não encontrado ── */
    const sc = document.querySelector('.screen-content');
    if (sc) sc.innerHTML = '<div class="empty-state"><div class="empty-icon">😕</div><div class="empty-title">Perfil não encontrado</div></div>';
  }
}

/* ============================================================
   NOTIFICAÇÕES
   ============================================================ */
function initNotifications() {
  const inviteList = document.getElementById('invites-list');
  const friendList = document.getElementById('friends-list');
  if (!inviteList && !friendList) return;

  function render() {
    const current = Store.getNotifications();
    const inv = current.filter(n => n.type === 'invite');
    const fri = current.filter(n => n.type === 'friend');

    if (inviteList) {
      if (inv.length === 0) {
        inviteList.innerHTML = '<p style="color:var(--text-4);font-size:13px;padding:12px 0">Nenhum convite pendente.</p>';
      } else {
        inviteList.innerHTML = inv.map(n => {
          const ph = _personHref(n.from);
          return `
          <div class="notif-item" id="notif-${n.id}">
            <a href="${ph}" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;flex:1;min-width:0">
              <div class="avatar av-md ${n.fromColor}">${n.fromInitial}</div>
              <div class="notif-info-wrap">
                <div class="notif-name">${n.from}</div>
                <div class="notif-sport">${n.sport} · ${Store.fmt.short(n.datetime)} · ${n.local}</div>
              </div>
            </a>
            <div class="notif-actions">
              <button class="notif-accept" data-id="${n.id}">Aceitar</button>
              <button class="notif-reject" data-id="${n.id}">Recusar</button>
            </div>
          </div>`;
        }).join('');
      }
    }

    if (friendList) {
      if (fri.length === 0) {
        friendList.innerHTML = '<p style="color:var(--text-4);font-size:13px;padding:12px 0">Nenhum pedido pendente.</p>';
      } else {
        friendList.innerHTML = fri.map(n => {
          const ph = _personHref(n.from);
          return `
          <div class="notif-item" id="notif-${n.id}">
            <a href="${ph}" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;flex:1;min-width:0">
              <div class="avatar av-md ${n.fromColor}">${n.fromInitial}</div>
              <div class="notif-info-wrap">
                <div class="notif-name">${n.from}</div>
                <div class="notif-sport">${n.sport}</div>
              </div>
            </a>
            <div class="notif-actions">
              <button class="notif-accept" data-id="${n.id}">Aceitar</button>
              <button class="notif-reject" data-id="${n.id}">Recusar</button>
            </div>
          </div>`;
        }).join('');
      }
    }

    $$('[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nid  = btn.dataset.id;
        const item = document.getElementById('notif-' + nid);
        const name = item?.querySelector('.notif-name')?.textContent || '';
        if (item) { item.style.transition = 'opacity .3s'; item.style.opacity = '0'; }
        setTimeout(() => {
          if (btn.classList.contains('notif-accept')) {
            Store.acceptNotif(nid);
            showToast(name + ' aceito ✓');
          } else {
            Store.dismissNotif(nid);
          }
          render();
        }, 300);
      });
    });
  }

  render();
}

/* ============================================================
   HELPERS — location autocomplete
   ============================================================ */
function _attachLocationAutocomplete(inputEl, onChangeCb) {
  const locations = Store.getLocations();
  let dropdown    = null;
  let selectedIdx = -1;

  const wrap = inputEl.closest('.form-group') || inputEl.parentNode;
  wrap.style.position = 'relative';

  function getDropdown() {
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'loc-dropdown';
      wrap.appendChild(dropdown);
    }
    return dropdown;
  }

  function closeDropdown() {
    if (dropdown) dropdown.style.display = 'none';
    selectedIdx = -1;
  }

  function showSuggestions(items) {
    const dd = getDropdown();
    if (items.length === 0) { closeDropdown(); return; }
    dd.innerHTML = items.map((l, i) => `
      <div class="loc-item" data-idx="${i}" data-name="${l.name}" data-addr="${l.address}" data-region="${l.region}">
        <span class="loc-item-icon">📍</span>
        <div>
          <div class="loc-name">${_hlMatch(l.name, inputEl.value)}</div>
          <div class="loc-sub">${l.address} · ${l.region}</div>
        </div>
      </div>`).join('');
    dd.style.display = 'block';

    dd.querySelectorAll('.loc-item').forEach(item => {
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        inputEl.value           = item.dataset.name;
        inputEl.dataset.address = item.dataset.addr;
        inputEl.dataset.region  = item.dataset.region;
        closeDropdown();
        if (onChangeCb) onChangeCb();
        inputEl.dispatchEvent(new Event('change'));
      });
    });
  }

  inputEl.addEventListener('input', () => {
    const q = inputEl.value.trim().toLowerCase();
    if (q.length < 2) { closeDropdown(); return; }
    const matches = locations.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.address.toLowerCase().includes(q) ||
      l.region.toLowerCase().includes(q)
    ).slice(0, 6);
    showSuggestions(matches);
  });

  inputEl.addEventListener('keydown', e => {
    if (!dropdown || dropdown.style.display === 'none') return;
    const items = dropdown.querySelectorAll('.loc-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
      items.forEach((it, i) => it.classList.toggle('selected', i === selectedIdx));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = Math.max(selectedIdx - 1, 0);
      items.forEach((it, i) => it.classList.toggle('selected', i === selectedIdx));
    } else if (e.key === 'Enter' && selectedIdx >= 0) {
      e.preventDefault();
      const it = items[selectedIdx];
      if (it) { inputEl.value = it.dataset.name; inputEl.dataset.address = it.dataset.addr; inputEl.dataset.region = it.dataset.region; if (onChangeCb) onChangeCb(); }
      closeDropdown();
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  inputEl.addEventListener('blur', () => setTimeout(closeDropdown, 150));
}

/* ============================================================
   HELPERS — activity autocomplete (free text + suggestions)
   ============================================================ */
function _attachActivityAutocomplete(inputEl, opts) {
  opts = opts || {};
  const activities = Store.getActivities();
  let dropdown    = null;
  let selectedIdx = -1;

  const wrap = inputEl.closest('.form-group') || inputEl.parentNode;
  wrap.style.position = 'relative';

  // Use provided tags container or create inline from opts.container
  const tagsContainer = opts.container || null;

  // Wire existing tag remove buttons (for pre-rendered tags)
  if (tagsContainer) {
    tagsContainer.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('.activity-tag')?.remove());
    });
  }

  function _addTag(name) {
    if (!tagsContainer) return;
    const existing = Array.from(tagsContainer.querySelectorAll('.activity-tag')).some(t => t.dataset.name === name);
    if (existing) return; // already exists
    const act = activities.find(a => a.name === name);
    const tag = document.createElement('div');
    tag.className    = 'activity-tag';
    tag.dataset.name = name;
    tag.innerHTML    = `${act ? act.emoji + ' ' : ''}${name} <button class="tag-remove">✕</button>`;
    tagsContainer.appendChild(tag);
    tag.querySelector('.tag-remove').addEventListener('click', () => {
      tag.remove();
      if (opts.onChange) opts.onChange();
    });
  }

  function getDropdown() {
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'loc-dropdown';
      wrap.appendChild(dropdown);
    }
    return dropdown;
  }

  function closeDropdown() {
    if (dropdown) dropdown.style.display = 'none';
    selectedIdx = -1;
  }

  function showSuggestions(items) {
    const dd = getDropdown();
    if (items.length === 0) { closeDropdown(); return; }
    dd.innerHTML = items.map((a, i) => `
      <div class="loc-item" data-idx="${i}" data-name="${a.name}" data-slug="${a.slug}" data-emoji="${a.emoji}" data-gradient="${a.gradient}">
        <span class="loc-item-icon">${a.emoji}</span>
        <div>
          <div class="loc-name">${_hlMatch(a.name, inputEl.value)}</div>
        </div>
      </div>`).join('');
    dd.style.display = 'block';

    dd.querySelectorAll('.loc-item').forEach(item => {
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        if (opts.multi && tagsContainer) {
          _addTag(item.dataset.name);
          inputEl.value = '';
          closeDropdown();
          if (opts.onChange) opts.onChange();
        } else {
          inputEl.value            = item.dataset.name;
          inputEl.dataset.slug     = item.dataset.slug;
          inputEl.dataset.emoji    = item.dataset.emoji;
          inputEl.dataset.gradient = item.dataset.gradient;
          closeDropdown();
          if (opts.onSelect) opts.onSelect(item.dataset);
        }
      });
    });
  }

  inputEl.addEventListener('input', () => {
    const q = inputEl.value.trim().toLowerCase();
    if (q.length < 1) { closeDropdown(); return; }
    const matches = activities.filter(a =>
      a.name.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q)
    ).slice(0, 8);
    showSuggestions(matches);
  });

  inputEl.addEventListener('keydown', e => {
    if (!dropdown || dropdown.style.display === 'none') {
      // Enter with no dropdown and multi-mode: skip (keep typing)
      return;
    }
    const items = dropdown.querySelectorAll('.loc-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
      items.forEach((it, i) => it.classList.toggle('selected', i === selectedIdx));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = Math.max(selectedIdx - 1, 0);
      items.forEach((it, i) => it.classList.toggle('selected', i === selectedIdx));
    } else if (e.key === 'Enter') {
      if (selectedIdx >= 0) {
        e.preventDefault();
        const it = items[selectedIdx];
        if (it) {
          if (opts.multi && tagsContainer) {
            _addTag(it.dataset.name);
            inputEl.value = '';
            if (opts.onChange) opts.onChange();
          } else {
            inputEl.value            = it.dataset.name;
            inputEl.dataset.slug     = it.dataset.slug;
            inputEl.dataset.emoji    = it.dataset.emoji;
            inputEl.dataset.gradient = it.dataset.gradient;
            if (opts.onSelect) opts.onSelect(it.dataset);
          }
        }
        closeDropdown();
      }
      // If no item selected, keep the free-text value as-is
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  inputEl.addEventListener('blur', () => setTimeout(closeDropdown, 150));
}

/* ============================================================
   HELPERS — bairro autocomplete (SP neighborhoods)
   ============================================================ */
function _attachBairroAutocomplete(inputEl, onChangeCb) {
  const bairros   = Store.getBairros();
  let dropdown    = null;
  let selectedIdx = -1;

  const wrap = inputEl.closest('.form-group') || inputEl.parentNode;
  wrap.style.position = 'relative';

  function getDropdown() {
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'loc-dropdown';
      wrap.appendChild(dropdown);
    }
    return dropdown;
  }
  function closeDropdown() { if (dropdown) dropdown.style.display = 'none'; selectedIdx = -1; }

  function showSuggestions(items) {
    const dd = getDropdown();
    if (items.length === 0) { closeDropdown(); return; }
    dd.innerHTML = items.map((b, i) => `
      <div class="loc-item" data-idx="${i}" data-name="${b}">
        <span class="loc-item-icon">🏙️</span>
        <div><div class="loc-name">${_hlMatch(b, inputEl.value)}</div></div>
      </div>`).join('');
    dd.style.display = 'block';

    dd.querySelectorAll('.loc-item').forEach(item => {
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        inputEl.value = item.dataset.name;
        closeDropdown();
        if (onChangeCb) onChangeCb();
      });
    });
  }

  inputEl.addEventListener('input', () => {
    const q = inputEl.value.trim().toLowerCase();
    if (q.length < 2) { closeDropdown(); return; }
    showSuggestions(bairros.filter(b => b.toLowerCase().includes(q)).slice(0, 8));
  });

  inputEl.addEventListener('keydown', e => {
    if (!dropdown || dropdown.style.display === 'none') return;
    const items = dropdown.querySelectorAll('.loc-item');
    if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = Math.min(selectedIdx+1, items.length-1); items.forEach((it,i) => it.classList.toggle('selected', i===selectedIdx)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = Math.max(selectedIdx-1, 0); items.forEach((it,i) => it.classList.toggle('selected', i===selectedIdx)); }
    else if (e.key === 'Enter' && selectedIdx >= 0) { e.preventDefault(); const it = items[selectedIdx]; if (it) { inputEl.value = it.dataset.name; if (onChangeCb) onChangeCb(); } closeDropdown(); }
    else if (e.key === 'Escape') closeDropdown();
  });

  inputEl.addEventListener('blur', () => setTimeout(closeDropdown, 150));
}

/* ============================================================
   HELPERS — age range slider
   ============================================================ */
function _buildAgeRangeUI(container, hiddenInput, onChangeCb) {
  container.innerHTML = `
    <div class="age-range-ctrl">
      <label class="age-livre-label">
        <input type="checkbox" id="age-livre" checked>
        <span>Livre — sem restrição de idade</span>
      </label>
      <div class="age-sliders" id="age-sliders-wrap" style="display:none">
        <div class="age-slider-row">
          <span class="age-slider-label">De</span>
          <input type="range" class="age-range-input" id="age-min" min="10" max="80" value="18" step="1">
          <span class="age-val" id="age-min-val">18 anos</span>
        </div>
        <div class="age-slider-row">
          <span class="age-slider-label">Até</span>
          <input type="range" class="age-range-input" id="age-max" min="10" max="80" value="40" step="1">
          <span class="age-val" id="age-max-val">40 anos</span>
        </div>
      </div>
    </div>`;

  const checkbox = container.querySelector('#age-livre');
  const sliders  = container.querySelector('#age-sliders-wrap');
  const minInput = container.querySelector('#age-min');
  const maxInput = container.querySelector('#age-max');
  const minVal   = container.querySelector('#age-min-val');
  const maxVal   = container.querySelector('#age-max-val');

  function updateHidden() {
    if (!hiddenInput) return;
    hiddenInput.value = checkbox.checked ? 'Livre' : (+minInput.value) + '-' + (+maxInput.value) + ' anos';
    if (onChangeCb) onChangeCb();
  }

  checkbox.addEventListener('change', () => {
    sliders.style.display = checkbox.checked ? 'none' : 'block';
    updateHidden();
  });
  minInput.addEventListener('input', () => {
    if (+minInput.value > +maxInput.value) maxInput.value = minInput.value;
    minVal.textContent = minInput.value + ' anos';
    maxVal.textContent = maxInput.value + ' anos';
    updateHidden();
  });
  maxInput.addEventListener('input', () => {
    if (+maxInput.value < +minInput.value) minInput.value = maxInput.value;
    minVal.textContent = minInput.value + ' anos';
    maxVal.textContent = maxInput.value + ' anos';
    updateHidden();
  });

  updateHidden();
}

/** Highlights the matching portion of text */
function _hlMatch(text, query) {
  if (!query) return text;
  const q   = query.trim().toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx < 0) return text;
  return text.slice(0,idx) + '<mark style="background:var(--green-light);color:var(--green-dark);border-radius:2px">' + text.slice(idx, idx+q.length) + '</mark>' + text.slice(idx+q.length);
}

/**
 * Shows a bottom-sheet date + time picker.
 */
function _showDateTimePicker(onConfirm, initialISO) {
  document.getElementById('dt-picker-overlay')?.remove();

  const now = (initialISO && !isNaN(Date.parse(initialISO))) ? new Date(initialISO) : new Date();
  let selYear  = now.getFullYear();
  let selMonth = now.getMonth();
  let selDay   = now.getDate();

  const MONTHS_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  const overlay = document.createElement('div');
  overlay.id    = 'dt-picker-overlay';
  overlay.className = 'dt-picker-overlay';

  const hourOpts = Array.from({length:24},(_,h) =>
    `<option value="${h}"${h===now.getHours()?' selected':''}>${String(h).padStart(2,'0')}</option>`
  ).join('');

  const nearMin = Math.round(now.getMinutes()/5)*5 % 60;
  const minOpts = Array.from({length:12},(_,i) => {
    const m = i*5;
    return `<option value="${m}"${m===nearMin?' selected':''}>${String(m).padStart(2,'0')}</option>`;
  }).join('');

  overlay.innerHTML = `
    <div class="dt-picker-backdrop" id="dt-backdrop"></div>
    <div class="dt-picker-sheet">
      <div class="dt-picker-header">
        <span class="dt-picker-title">Selecionar Data e Hora</span>
        <button class="dt-picker-close" id="dt-close">✕</button>
      </div>
      <div class="dt-cal-nav">
        <button class="dt-cal-arrow" id="dt-prev">‹</button>
        <span class="dt-cal-month" id="dt-month-lbl"></span>
        <button class="dt-cal-arrow" id="dt-next">›</button>
      </div>
      <div class="dt-cal-grid" id="dt-cal-grid"></div>
      <div class="dt-time-row">
        <span class="dt-time-label">⏰ Horário</span>
        <div class="dt-time-inputs">
          <select class="dt-time-sel" id="dt-hour">${hourOpts}</select>
          <span class="dt-time-sep">:</span>
          <select class="dt-time-sel" id="dt-minute">${minOpts}</select>
        </div>
      </div>
      <button class="btn btn-green" id="dt-confirm">CONFIRMAR DATA E HORA</button>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.dt-picker-sheet').classList.add('open'));

  function renderCal() {
    document.getElementById('dt-month-lbl').textContent = MONTHS_FULL[selMonth] + ' ' + selYear;
    const grid = document.getElementById('dt-cal-grid');
    grid.innerHTML = '';
    ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].forEach(h => {
      const d = document.createElement('div'); d.className = 'dt-cal-head'; d.textContent = h[0]; grid.appendChild(d);
    });
    const firstDay = new Date(selYear, selMonth, 1).getDay();
    const offset   = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < offset; i++) {
      const el = document.createElement('div'); el.className = 'dt-cal-cell empty'; grid.appendChild(el);
    }
    const days  = new Date(selYear, selMonth + 1, 0).getDate();
    const todayD = new Date();
    for (let d = 1; d <= days; d++) {
      const el  = document.createElement('div');
      let cls   = 'dt-cal-cell';
      const isToday = d===todayD.getDate() && selMonth===todayD.getMonth() && selYear===todayD.getFullYear();
      if (isToday)  cls += ' today';
      if (d === selDay) cls += ' selected';
      el.className  = cls;
      el.textContent = d;
      el.addEventListener('click', () => { selDay = d; renderCal(); });
      grid.appendChild(el);
    }
  }

  renderCal();

  document.getElementById('dt-prev').addEventListener('click', () => { selMonth--; if(selMonth<0){selMonth=11;selYear--;} renderCal(); });
  document.getElementById('dt-next').addEventListener('click', () => { selMonth++; if(selMonth>11){selMonth=0;selYear++;} renderCal(); });

  function close() {
    const sheet = overlay.querySelector('.dt-picker-sheet');
    sheet.classList.remove('open');
    setTimeout(() => overlay.remove(), 280);
  }

  document.getElementById('dt-close').addEventListener('click', close);
  document.getElementById('dt-backdrop').addEventListener('click', close);

  document.getElementById('dt-confirm').addEventListener('click', () => {
    const h   = +document.getElementById('dt-hour').value;
    const m   = +document.getElementById('dt-minute').value;
    const iso = selYear + '-'
      + String(selMonth + 1).padStart(2,'0') + '-'
      + String(selDay).padStart(2,'0') + 'T'
      + String(h).padStart(2,'0') + ':'
      + String(m).padStart(2,'0');
    onConfirm(iso);
    close();
  });
}
