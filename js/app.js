/* ============================================================
   SportMeet — JavaScript
   ============================================================ */

/* ── Feed cards data (5 eventos) ──────────────────────────── */
const FEED_CARDS = [
  {
    name: 'Corrida no Parque',
    sport: '🏃',
    bg: 'linear-gradient(135deg,#22C55E 0%,#16A34A 45%,#15803D 100%)',
    age: '20-30 anos',
    time: 'Sábado · 07:00',
    place: 'Parque Ibirapuera',
    ci: 'P', cn: 'Pedro', cc: 'av-orange'
  },
  {
    name: 'Futebol Society',
    sport: '⚽',
    bg: 'linear-gradient(135deg,#3B82F6 0%,#2563EB 50%,#1D4ED8 100%)',
    age: 'Aberto',
    time: 'Dom · 16:00',
    place: 'Rua Princesa Isabel, 450',
    ci: 'M', cn: 'Marcos', cc: 'av-blue'
  },
  {
    name: 'Tênis no Clube',
    sport: '🎾',
    bg: 'linear-gradient(135deg,#F97316 0%,#EA580C 50%,#C2410C 100%)',
    age: '25-35 anos',
    time: 'Ter · 19:30',
    place: 'Clube Esportivo Pinheiros',
    ci: 'A', cn: 'Ana', cc: 'av-pink'
  },
  {
    name: 'Basquete 3×3',
    sport: '🏀',
    bg: 'linear-gradient(135deg,#8B5CF6 0%,#7C3AED 50%,#6D28D9 100%)',
    age: '18-30 anos',
    time: 'Qua · 18:00',
    place: 'Quadra Brooklin',
    ci: 'L', cn: 'Lucas', cc: 'av-green'
  },
  {
    name: 'Natação Livre',
    sport: '🏊',
    bg: 'linear-gradient(135deg,#06B6D4 0%,#0891B2 50%,#0E7490 100%)',
    age: 'Todos',
    time: 'Sex · 06:30',
    place: 'SESC Pompéia',
    ci: 'C', cn: 'Camila', cc: 'av-teal'
  },
];

let feedIndex = 0;

/* ── Build card HTML ─────────────────────────────────────── */
function buildCard(card, posClass, id) {
  return `
    <div class="swipe-card ${posClass}" ${id ? 'id="' + id + '"' : ''}>
      <div class="card-image" style="background:${card.bg}">
        <div class="card-sport-icon">${card.sport}</div>
        <div class="card-age-badge">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          ${card.age}
        </div>
      </div>
      <div class="card-body">
        <div>
          <div class="card-title">${card.name}</div>
          <div class="card-meta">
            <div class="card-meta-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${card.time}
            </div>
            <div class="card-meta-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${card.place}
            </div>
          </div>
        </div>
        <div class="card-creator">
          <div class="card-creator-avatar ${card.cc}">${card.ci}</div>
          <span>Criado por <b style="color:var(--text-2)">${card.cn}</b></span>
        </div>
      </div>
    </div>`;
}

/* ── Render up to 3 cards (behind2, behind1, front) ──────── */
function renderFeedStack() {
  const stack = document.getElementById('swipe-stack');
  if (!stack) return;

  const total = FEED_CARDS.length;
  if (feedIndex >= total) {
    stack.innerHTML = '<div class="feed-empty"><p>Sem mais eventos por agora 👋</p></div>';
    return;
  }

  let html = '';
  if (feedIndex + 2 < total) {
    html += buildCard(FEED_CARDS[feedIndex + 2], 'behind2', '');
  }
  if (feedIndex + 1 < total) {
    html += buildCard(FEED_CARDS[feedIndex + 1], 'behind1', '');
  }
  html += buildCard(FEED_CARDS[feedIndex], '', 'front-card');
  stack.innerHTML = html;
}

/* ── Feed — aceitar / recusar ────────────────────────────── */
function initFeedCards() {
  const stack = document.getElementById('swipe-stack');
  if (!stack) return;

  renderFeedStack();

  // Delegação: os botões estão fora do stack mas operam nele
  document.getElementById('btn-accept')?.addEventListener('click', () => {
    dismissCard('right', () => {
      window.location.href = 'pages/adicionado-agenda.html';
    });
  });

  document.getElementById('btn-reject')?.addEventListener('click', () => {
    dismissCard('left', () => {
      feedIndex++;
      renderFeedStack();
    });
  });
}

function dismissCard(dir, callback) {
  const card = document.getElementById('front-card');
  if (!card) return;
  card.style.transition = 'transform .35s ease, opacity .35s ease';
  card.style.transform = dir === 'right'
    ? 'translateX(160%) rotate(22deg)'
    : 'translateX(-160%) rotate(-22deg)';
  card.style.opacity = '0';
  setTimeout(callback, 360);
}

/* ============================================================
   Calendar — Agenda
   ============================================================ */
function initCalendar() {
  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  const MONTHS = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];
  const TODAY_YEAR = 2026, TODAY_MONTH = 3, TODAY_DAY = 24;

  // Dias com eventos — dinâmico conforme sessionStorage
  function getEventDays(y, m) {
    const days = [];
    if (y === 2026 && m === 3) {
      days.push(30); // Basquete — sempre
      if (sessionStorage.getItem('sm_futebol_adicionado') === 'true') days.push(26);
      if (sessionStorage.getItem('sm_corrida_criada') === 'true')     days.push(29);
    }
    return days;
  }

  let year = TODAY_YEAR, month = TODAY_MONTH, selectedDay = 24;

  function render() {
    const label = document.getElementById('cal-month');
    if (label) label.textContent = MONTHS[month] + ' ' + year;
    grid.innerHTML = '';

    ['S','T','Q','Q','S','S','D'].forEach(h => {
      const el = document.createElement('div');
      el.className = 'cal-head';
      el.textContent = h;
      grid.appendChild(el);
    });

    const firstWeekDay = new Date(year, month, 1).getDay();
    const offset = firstWeekDay === 0 ? 6 : firstWeekDay - 1;
    const prevDays = new Date(year, month, 0).getDate();
    for (let i = offset - 1; i >= 0; i--) {
      const el = document.createElement('div');
      el.className = 'cal-day empty';
      el.textContent = prevDays - i;
      grid.appendChild(el);
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const eventDays = getEventDays(year, month);

    for (let d = 1; d <= daysInMonth; d++) {
      const el = document.createElement('div');
      let cls = 'cal-day';
      if (d === TODAY_DAY && year === TODAY_YEAR && month === TODAY_MONTH) cls += ' today';
      if (d === selectedDay) cls += ' selected';
      if (eventDays.includes(d)) cls += ' has-event';
      el.className = cls;
      el.textContent = d;
      el.addEventListener('click', () => {
        selectedDay = d;
        render();
        updateEventHighlight(d);
      });
      grid.appendChild(el);
    }

    const totalCells = grid.querySelectorAll(':not(.cal-head)').length;
    const remainder = (7 - totalCells % 7) % 7;
    for (let i = 1; i <= remainder && remainder < 7; i++) {
      const el = document.createElement('div');
      el.className = 'cal-day empty';
      el.textContent = i;
      grid.appendChild(el);
    }
  }

  document.getElementById('cal-prev')?.addEventListener('click', () => {
    month--;
    if (month < 0) { month = 11; year--; }
    render();
  });
  document.getElementById('cal-next')?.addEventListener('click', () => {
    month++;
    if (month > 11) { month = 0; year++; }
    render();
  });

  render();
  updateEventHighlight(selectedDay); // inicia sem destaque (hoje = 24)
}

/* ── Destaca evento na lista pelo dia (qualquer mês) ──────── */
function updateEventHighlight(day) {
  document.querySelectorAll('.event-row').forEach(row => {
    row.classList.remove('highlight');
    const badge = row.querySelector('.event-date');
    if (badge) badge.classList.remove('orange');
  });
  // Regra: dia 29 selecionado em qualquer mês → destaca evento 29/4
  const targetDay = day === 29 ? 29 : day;
  const target = document.querySelector('.event-row[data-day="' + targetDay + '"]');
  if (target) {
    target.classList.add('highlight');
    const badge = target.querySelector('.event-date');
    if (badge) badge.classList.add('orange');
  }
}

/* ============================================================
   Agenda — exibe eventos dinamicamente
   ============================================================ */
function updateAgendaEvents() {
  const futebolRow  = document.getElementById('agenda-futebol');
  const corridaRow  = document.getElementById('agenda-corrida');
  const detailBox   = document.getElementById('corrida-detail');

  if (futebolRow) {
    futebolRow.style.display =
      sessionStorage.getItem('sm_futebol_adicionado') === 'true' ? '' : 'none';
  }
  if (corridaRow) {
    corridaRow.style.display =
      sessionStorage.getItem('sm_corrida_criada') === 'true' ? '' : 'none';
  }
  if (detailBox) {
    detailBox.style.display =
      sessionStorage.getItem('sm_corrida_criada') === 'true' ? '' : 'none';
  }
}

/* ============================================================
   Home — "Esta semana" dinâmica
   ============================================================ */
function updateHomeEvents() {
  const futebolItem  = document.getElementById('week-futebol');
  const corridaItem  = document.getElementById('week-corrida');

  if (futebolItem) {
    futebolItem.style.display =
      sessionStorage.getItem('sm_futebol_adicionado') === 'true' ? '' : 'none';
  }
  if (corridaItem) {
    corridaItem.style.display =
      sessionStorage.getItem('sm_corrida_criada') === 'true' ? '' : 'none';
  }
}

/* ============================================================
   Filtros — Buscar
   ============================================================ */
function initFilters() {
  // Grupos com data-single: seleção única + permite desmarcar
  document.querySelectorAll('.filter-group[data-single]').forEach(group => {
    group.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const wasActive = pill.classList.contains('active');
        group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        if (!wasActive) pill.classList.add('active');
      });
    });
  });

  // Grupos sem data-single: múltipla seleção + permite desmarcar
  document.querySelectorAll('.filter-group:not([data-single])').forEach(group => {
    group.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => pill.classList.toggle('active'));
    });
  });
}

/* ── Salva filtros ativos antes de ir para resultados ──────── */
function saveFilters() {
  const activePills = document.querySelectorAll('.filter-group .pill.active');
  const filters = Array.from(activePills).map(p => p.textContent.trim());
  const search  = document.getElementById('search-input')?.value.trim() || '';
  sessionStorage.setItem('sm_filters', JSON.stringify(filters));
  sessionStorage.setItem('sm_search',  search);
}

/* ============================================================
   Resultados — lê filtros do sessionStorage
   ============================================================ */
function initResults() {
  const meta = document.getElementById('results-meta');
  if (!meta) return;
  const filters = JSON.parse(sessionStorage.getItem('sm_filters') || '[]');
  const search  = sessionStorage.getItem('sm_search') || '';
  const all = search ? [search, ...filters] : filters;
  const context = all.length > 0 ? ' · ' + all.join(' · ') : '';
  meta.innerHTML = '<b>2 resultados</b> encontrados' + context;
}

/* ============================================================
   Seleção de amigos — Convidar
   ============================================================ */
function initFriendSelection() {
  const container = document.getElementById('friend-list');
  if (!container) return;

  const items     = container.querySelectorAll('.friend-item');
  const countEl   = document.getElementById('selected-count');
  const inviteBtn = document.getElementById('invite-btn');
  const selected  = new Set([0, 1, 2]); // Bruno, Alice, Carlos pré-selecionados

  function refresh() {
    items.forEach((item, i) => {
      const box = item.querySelector('.friend-check');
      if (selected.has(i)) {
        box.classList.add('checked');
        box.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      } else {
        box.classList.remove('checked');
        box.innerHTML = '';
      }
    });
    const n = selected.size;
    if (countEl)   countEl.textContent  = n + ' SELECIONADO' + (n !== 1 ? 'S' : '');
    if (inviteBtn) inviteBtn.textContent = 'CONVIDAR · ' + n + ' AMIGO' + (n !== 1 ? 'S' : '');
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      selected.has(i) ? selected.delete(i) : selected.add(i);
      refresh();
    });
  });

  refresh();
}

/* ============================================================
   Toggle switch — Criar evento
   ============================================================ */
function initToggle() {
  document.querySelectorAll('.toggle-switch').forEach(sw => {
    sw.addEventListener('click', () => {
      sw.classList.toggle('off');
      const sub = sw.closest('.toggle-row')?.querySelector('.toggle-sub');
      if (sub) {
        sub.textContent = sw.classList.contains('off')
          ? 'Apenas convidados podem entrar'
          : 'Qualquer pessoa pode entrar';
      }
    });
  });
}

/* ============================================================
   Validação do form de criação
   ============================================================ */
function initCreateForm() {
  const btn = document.getElementById('invite-friends-btn');
  if (!btn) return;
  btn.addEventListener('click', e => {
    const local   = document.getElementById('input-local')?.value.trim();
    const ativ    = document.getElementById('input-atividade')?.value.trim();
    const horario = document.getElementById('input-horario')?.value.trim();
    if (!local || !ativ || !horario) {
      e.preventDefault();
      showToast('Preencha Local, Atividade e Horário antes de continuar.');
    }
  });
}

/* ============================================================
   Notificações — aceitar/recusar convites
   ============================================================ */
function initNotifications() {
  document.querySelectorAll('.notif-accept').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.notif-item');
      if (!item) return;
      const name = item.querySelector('.notif-name')?.textContent || 'Evento';
      item.style.transition = 'opacity .3s';
      item.style.opacity = '0';
      setTimeout(() => {
        item.remove();
        showToast('Convite de ' + name + ' aceito ✓');
        checkEmpty();
      }, 300);
    });
  });

  document.querySelectorAll('.notif-reject').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.notif-item');
      if (!item) return;
      item.style.transition = 'opacity .3s';
      item.style.opacity = '0';
      setTimeout(() => { item.remove(); checkEmpty(); }, 300);
    });
  });

  function checkEmpty() {
    const list = document.getElementById('invites-list');
    if (list && list.querySelectorAll('.notif-item').length === 0) {
      list.innerHTML = '<p style="color:var(--text-4);font-size:13px;padding:12px 0">Nenhum convite pendente.</p>';
    }
  }
}

/* ============================================================
   Marca flags de sessionStorage
   ============================================================ */
function markCorridaCriada() {
  if (document.getElementById('mark-corrida-criada')) {
    sessionStorage.setItem('sm_corrida_criada', 'true');
  }
}
function markFutebolAdicionado() {
  if (document.getElementById('mark-futebol-adicionado')) {
    sessionStorage.setItem('sm_futebol_adicionado', 'true');
  }
}

/* ============================================================
   Init principal
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  markCorridaCriada();
  markFutebolAdicionado();
  initFeedCards();
  initCalendar();
  initFilters();
  initFriendSelection();
  initToggle();
  initCreateForm();
  initResults();
  updateHomeEvents();
  updateAgendaEvents();
  initNotifications();
});

/* ============================================================
   Toast (global — pode ser chamado de onclick no HTML)
   ============================================================ */
function showToast(msg) {
  let t = document.getElementById('sm-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'sm-toast';
    Object.assign(t.style, {
      position:'fixed', bottom:'96px', left:'50%',
      transform:'translateX(-50%)',
      background:'#111827', color:'#fff',
      padding:'10px 20px', borderRadius:'24px',
      fontSize:'13px', fontWeight:'600',
      boxShadow:'0 4px 16px rgba(0,0,0,.25)',
      zIndex:'9999', whiteSpace:'nowrap',
      opacity:'0', transition:'opacity .25s',
      maxWidth:'85vw', textAlign:'center',
    });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.opacity = '0'; }, 2800);
}
