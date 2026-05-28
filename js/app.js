/* ============================================================
   SportMeet — JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCalendar();
  initFilters();
  initFriendSelection();
  initToggle();
  initCreateForm();
  initFeedCards();
});

/* ============================================================
   Calendar — renderiza dinamicamente (Agenda)
   ============================================================ */
function initCalendar() {
  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  const MONTHS = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];
  const EVENT_DAYS = [26, 29, 30]; // dias com eventos em Abril 2026
  const TODAY = 24;

  let year = 2026;
  let month = 3; // Abril (0-indexed)
  let selectedDay = 29; // Corrida no Ibirapuera pré-selecionada

  function render() {
    const label = document.getElementById('cal-month');
    if (label) label.textContent = MONTHS[month] + ' ' + year;

    grid.innerHTML = '';

    // Cabeçalhos de dias da semana (semana começa na segunda)
    ['S','T','Q','Q','S','S','D'].forEach(h => {
      const el = document.createElement('div');
      el.className = 'cal-head';
      el.textContent = h;
      grid.appendChild(el);
    });

    // Offset: quantos dias da semana anterior preencher
    // Para Abril 2026: dia 1 é quarta-feira (getDay()=3), base segunda → offset=2
    const firstWeekDay = new Date(year, month, 1).getDay(); // 0=Dom
    const offset = firstWeekDay === 0 ? 6 : firstWeekDay - 1;

    // Dias do mês anterior (exibidos em cinza claro)
    const prevDays = new Date(year, month, 0).getDate();
    for (let i = offset - 1; i >= 0; i--) {
      const el = document.createElement('div');
      el.className = 'cal-day empty';
      el.textContent = prevDays - i;
      grid.appendChild(el);
    }

    // Dias do mês atual
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const el = document.createElement('div');
      let cls = 'cal-day';
      if (d === TODAY && year === 2026 && month === 3) cls += ' today';
      if (d === selectedDay) cls += ' selected';
      if (EVENT_DAYS.includes(d)) cls += ' has-event';
      el.className = cls;
      el.textContent = d;

      el.addEventListener('click', () => {
        selectedDay = d;
        render();
        updateEventHighlight(d);
      });

      grid.appendChild(el);
    }

    // Completar última linha com dias do próximo mês
    const totalCells = grid.querySelectorAll('.cal-day, .cal-head, .empty').length;
    const remainder = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remainder && remainder < 7; i++) {
      const el = document.createElement('div');
      el.className = 'cal-day empty';
      el.textContent = i;
      grid.appendChild(el);
    }
  }

  // Destaca o evento correspondente ao dia selecionado
  function updateEventHighlight(day) {
    const rows = document.querySelectorAll('.event-row');
    rows.forEach(row => row.classList.remove('highlight'));
    const target = document.querySelector('[data-day="' + day + '"]');
    if (target) target.classList.add('highlight');
  }

  // Navegação de mês
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
  updateEventHighlight(selectedDay);
}

/* ============================================================
   Filter Pills — seleção de filtros (Buscar)
   ============================================================ */
function initFilters() {
  const groups = document.querySelectorAll('.filter-group[data-single]');
  groups.forEach(group => {
    const pills = group.querySelectorAll('.pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        // Dentro do mesmo grupo, desativa os outros
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });
  });

  // Grupos sem data-single permitem múltipla seleção
  const multiGroups = document.querySelectorAll('.filter-group:not([data-single])');
  multiGroups.forEach(group => {
    const pills = group.querySelectorAll('.pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pill.classList.toggle('active');
      });
    });
  });
}

/* ============================================================
   Friend Selection — contar amigos selecionados (Convidar)
   ============================================================ */
function initFriendSelection() {
  const container = document.getElementById('friend-list');
  if (!container) return;

  const items    = container.querySelectorAll('.friend-item');
  const countEl  = document.getElementById('selected-count');
  const inviteBtn = document.getElementById('invite-btn');

  // Índices pré-selecionados: Bruno (0), Alice (1), Carlos (2)
  const selected = new Set([0, 1, 2]);

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
   Toggle Switch — abrir/fechar evento (Criar)
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
   Create Event Form — validação simples
   ============================================================ */
function initCreateForm() {
  const btn = document.getElementById('invite-friends-btn');
  if (!btn) return;

  btn.addEventListener('click', e => {
    const local    = document.getElementById('input-local')?.value.trim();
    const ativ     = document.getElementById('input-atividade')?.value.trim();
    const horario  = document.getElementById('input-horario')?.value.trim();

    if (!local || !ativ || !horario) {
      e.preventDefault();
      showToast('Preencha Local, Atividade e Horário antes de continuar.');
      return;
    }

    // Salva dados para a próxima tela
    sessionStorage.setItem('sm_local',    local);
    sessionStorage.setItem('sm_ativ',     ativ);
    sessionStorage.setItem('sm_horario',  horario);
  });

  // Preenche com dados já salvos (ao voltar)
  const savedLocal = sessionStorage.getItem('sm_local');
  if (savedLocal) {
    const el = document.getElementById('input-local');
    if (el) el.value = savedLocal;
  }
}

/* ============================================================
   Feed Cards — swipe de aceitar / recusar
   ============================================================ */
function initFeedCards() {
  const acceptBtn = document.getElementById('btn-accept');
  const rejectBtn = document.getElementById('btn-reject');
  const card      = document.getElementById('front-card');
  if (!card) return;

  function animateCard(dir) {
    card.style.transition = 'transform .35s ease, opacity .35s ease';
    card.style.transform  = dir === 'right'
      ? 'translateX(140%) rotate(20deg)'
      : 'translateX(-140%) rotate(-20deg)';
    card.style.opacity = '0';
    setTimeout(() => {
      card.style.display = 'none';
      showToast(dir === 'right' ? 'Evento adicionado à sua agenda! ✓' : 'Evento descartado.');
    }, 360);
  }

  acceptBtn?.addEventListener('click', () => animateCard('right'));
  rejectBtn?.addEventListener('click', () => animateCard('left'));
}

/* ============================================================
   Toast helper
   ============================================================ */
function showToast(msg) {
  let toast = document.getElementById('sm-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sm-toast';
    Object.assign(toast.style, {
      position:     'fixed',
      bottom:       '96px',
      left:         '50%',
      transform:    'translateX(-50%)',
      background:   '#111827',
      color:        '#fff',
      padding:      '10px 20px',
      borderRadius: '24px',
      fontSize:     '13px',
      fontWeight:   '600',
      boxShadow:    '0 4px 16px rgba(0,0,0,.25)',
      zIndex:       '9999',
      whiteSpace:   'nowrap',
      opacity:      '0',
      transition:   'opacity .25s',
      maxWidth:     '85vw',
      textAlign:    'center',
    });
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2800);
}
