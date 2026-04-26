import './style.css';
const PROFILE = {"day":"Day063","title":"Auto Debit Floor Forecaster","display_name_ja":"引き落とし底割れ見通し","one_sentence":"残高と引き落とし予定から不足しそうな日を先回りで見つけるツール","purpose_line_ja":"引き落としで不足しそうな日を見つけやすくするためのツールです。","use_case_line_ja":"給料日前にどの日が危ないか読めない時に使います。","how_it_works_line_ja":"入出金予定を入れると、不足予兆つきの残高推移が分かります。","core_action":"simulate","family":"autodebit_floor_forecast","mechanic":"balance_timeline","input_style":"cashflow_rows","output_style":"risk_timeline","output_label":"ここを見ればOKです","audience_promise":"危ない日を前もって把握できる。","publish_hook":"入出金予定を自分で足すと、底割れしそうな日と先に減らす候補が一つのタイムラインで見える。","engine":"brief_driven","interaction_archetype":"balance_timeline","page_archetype":"balance_bars","ui_variant":"generic","intro_variant":"generic","interaction_model":"structured_multi_field","primary_layout":"two_column_workbench","result_presentation_style":"stacked_result_cards","palette_motif":"neutral slate / white","main_cta":"サンプルで試す","input_panel_title":"まず試す入力","sample_panel_title":"サンプルで試す","guide_panel_title":"使い方のコツ","hero_panel_label":"結果の見どころ","output_shape":"balance_bars","state_model":"balance_timeline_state","core_loop":"cashflow_rows -> balance_timeline -> risk_timeline","component_pack":"balance_bars+risk_timeline","scaffold_id":"card_deck_board","single_shot_text_generator":false};
const byId = (id) => document.getElementById(id);
const state = {
  tokens: ['買う', '待つ', '比べる', '今週中'],
  lock: false,
  history: [],
  wizardStep: 0,
  wizardAnswers: {},
  matrix: { HH: [], HL: [], LH: [], LL: [] },
  options: [],
  slots: { morning: [], afternoon: [], evening: [] },
  board: { todo: [], doing: [], done: [] },
  missions: ['5分で試す', '2案比較する', '短文で説明する'],
  score: 0,
  round: 0,
  helpers: {}
};

boot();

function boot() {
  switch (PROFILE.scaffold_id) {
    case 'brief_canvas': setupBriefCanvas(); break;
    case 'card_deck_board': setupCardDeck(); break;
    case 'wizard_stepper': setupWizard(); break;
    case 'matrix_mapper': setupMatrix(); break;
    case 'weighted_calculator': setupWeightedCalc(); break;
    case 'slot_checklist_planner': setupSlotPlanner(); break;
    case 'flow_board': setupFlowBoard(); break;
    case 'roulette_game': setupRoulette(); break;
    default: setupFallback(); break;
  }
  setupCommonUi();
}

function setupCommonUi() {
  const btn = byId('sampleFillBtn');
  if (btn) {
    btn.addEventListener('click', runSample);
  }
  updateCaptureReady();
}

function runSample() {
  switch (PROFILE.scaffold_id) {
    case 'brief_canvas':
      state.helpers.runBriefSample?.();
      break;
    case 'card_deck_board':
      state.tokens = ['買う', '待つ', '比べる', '今週中'];
      renderTokenPool(byId('tokenList'));
      byId('drawBtn')?.click();
      break;
    case 'wizard_stepper':
      state.wizardAnswers = { speed: '速度', risk: '中くらい', ownership: '自分' };
      state.wizardStep = 2;
      state.helpers.renderStep?.();
      break;
    case 'matrix_mapper':
      state.matrix = {
        HH: ['請求トラブル'],
        HL: ['FAQ更新'],
        LH: ['通知チェック'],
        LL: ['色の微調整']
      };
      renderMatrix();
      break;
    case 'weighted_calculator':
      state.options = [
        { name: 'A案', speed: 5, quality: 3, cost: 4 },
        { name: 'B案', speed: 3, quality: 5, cost: 2 }
      ];
      state.helpers.recalc?.();
      break;
    case 'slot_checklist_planner':
      state.slots = {
        morning: [{ text: '請求APIを直す', done: false }],
        afternoon: [{ text: '動作確認をする', done: false }],
        evening: [{ text: '共有メモを書く', done: false }]
      };
      renderSlots();
      break;
    case 'flow_board':
      state.board = {
        todo: [{ id: 1, title: '仕様を確認する' }],
        doing: [{ id: 2, title: '画面を直す' }],
        done: [{ id: 3, title: '不具合を再現した' }]
      };
      renderBoard();
      break;
    case 'roulette_game':
      state.missions = ['5分だけ片づける', '今の案を1つ比べる', '短く言い換える'];
      state.helpers.renderPool?.();
      byId('spinBtn')?.click();
      break;
    default:
      state.helpers.runBriefSample?.();
      break;
  }
  window.setTimeout(() => updateCaptureReady(), 120);
}

function ensureCaptureMarker() {
  let marker = byId('captureReadyMarker');
  if (!marker) {
    marker = document.createElement('div');
    marker.id = 'captureReadyMarker';
    marker.hidden = true;
    document.body.appendChild(marker);
  }
  return marker;
}

function detectResultVisible() {
  const resultZone = byId('briefResultZone')
    || byId('cardStack')
    || byId('wizardSummary')
    || byId('scoreTable')
    || byId('slotMorning')
    || byId('laneTodo')
    || byId('wheelFace');
  if (!resultZone) return false;
  const text = (resultZone.innerText || '').replace(/\s+/g, ' ').trim();
  if (!text) return false;
  return !text.includes('まだ結果がありません');
}

function updateCaptureReady(extra = {}) {
  const readyState = {
    title: Boolean(document.querySelector('[data-ready-role="title"]')),
    primaryCta: Boolean(document.querySelector('[data-ready-role="primary-cta"]')),
    identityBlock: Boolean(document.querySelector('[data-ready-role="identity-block"]')),
    startBlock: Boolean(document.querySelector('[data-ready-role="start-block"]')),
    outputPreview: Boolean(document.querySelector('[data-ready-role="output-preview"]')),
    resultVisible: detectResultVisible(),
    ...extra
  };
  readyState.screenshotReady = readyState.title
    && readyState.primaryCta
    && readyState.identityBlock
    && readyState.startBlock
    && readyState.outputPreview
    && readyState.resultVisible;
  const marker = ensureCaptureMarker();
  Object.entries(readyState).forEach(([key, value]) => {
    marker.dataset[key] = String(Boolean(value));
  });
  marker.textContent = JSON.stringify(readyState);
  window.__CAPTURE_READY__ = readyState;
}

function setupCardDeck() {
  const tokenInput = byId('tokenInput');
  const tokenList = byId('tokenList');
  const cardStack = byId('cardStack');
  const historyList = byId('historyList');
  byId('addTokenBtn').addEventListener('click', () => {
    const v = (tokenInput.value || '').trim();
    if (!v) return;
    state.tokens.push(v);
    tokenInput.value = '';
    renderTokenPool(tokenList);
  });
  byId('drawBtn').addEventListener('click', () => {
    if (state.lock) return;
    const picks = shuffle([...state.tokens]).slice(0, Math.min(3, state.tokens.length));
    cardStack.innerHTML = picks.map((x) => `<div class="card">${escapeHtml(x)}</div>`).join('');
    state.history.unshift(picks.join(' × '));
    state.history = state.history.slice(0, 12);
    historyList.innerHTML = state.history.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  });
  byId('lockBtn').addEventListener('click', () => { state.lock = !state.lock; });
  renderTokenPool(tokenList);
}

function renderTokenPool(el) {
  el.innerHTML = state.tokens.map((x) => `<span class="chip">${escapeHtml(x)}</span>`).join('');
}

function setupWizard() {
  const questions = [
    { key: 'speed', q: '最優先はどれ?', c: ['速度', '品質', 'コスト'] },
    { key: 'risk', q: '許容できるリスクは?', c: ['低い', '中くらい', '高い'] },
    { key: 'ownership', q: '主導者は?', c: ['自分', 'チーム', '外部'] }
  ];
  const stepBadge = byId('stepBadge');
  const questionText = byId('questionText');
  const choiceGroup = byId('choiceGroup');
  const summary = byId('wizardSummary');
  byId('prevStepBtn').addEventListener('click', () => { state.wizardStep = Math.max(0, state.wizardStep - 1); renderStep(); });
  byId('nextStepBtn').addEventListener('click', () => {
    const cur = questions[state.wizardStep];
    const selected = document.querySelector('input[name="wizardChoice"]:checked');
    if (selected) state.wizardAnswers[cur.key] = selected.value;
    state.wizardStep = Math.min(questions.length - 1, state.wizardStep + 1);
    renderStep();
  });
  function renderStep() {
    const cur = questions[state.wizardStep];
    stepBadge.textContent = `Step ${state.wizardStep + 1}/${questions.length}`;
    questionText.textContent = cur.q;
    choiceGroup.innerHTML = cur.c.map((x) => `<label class="choice"><input type="radio" name="wizardChoice" value="${escapeHtml(x)}" ${state.wizardAnswers[cur.key]===x?'checked':''}>${escapeHtml(x)}</label>`).join('');
    summary.textContent = Object.entries(state.wizardAnswers).map(([k,v]) => `${k}: ${v}`).join('\n') || 'まだ回答がありません';
  }
  state.helpers.renderStep = renderStep;
  renderStep();
}

function setupMatrix() {
  const inputName = byId('matrixItemName');
  const impact = byId('impactRange');
  const urgency = byId('urgencyRange');
  byId('addMatrixItemBtn').addEventListener('click', () => {
    const name = (inputName.value || '').trim();
    if (!name) return;
    const i = Number(impact.value);
    const u = Number(urgency.value);
    const key = i >= 3 && u >= 3 ? 'HH' : i >= 3 ? 'HL' : u >= 3 ? 'LH' : 'LL';
    state.matrix[key].push(name);
    inputName.value = '';
    renderMatrix();
  });
  renderMatrix();
}

function renderMatrix() {
  byId('qHH').innerHTML = state.matrix.HH.length ? state.matrix.HH.map((x) => `<li>${escapeHtml(x)}</li>`).join('') : '<li class="empty-state">まだ項目がありません</li>';
  byId('qHL').innerHTML = state.matrix.HL.length ? state.matrix.HL.map((x) => `<li>${escapeHtml(x)}</li>`).join('') : '<li class="empty-state">まだ項目がありません</li>';
  byId('qLH').innerHTML = state.matrix.LH.length ? state.matrix.LH.map((x) => `<li>${escapeHtml(x)}</li>`).join('') : '<li class="empty-state">まだ項目がありません</li>';
  byId('qLL').innerHTML = state.matrix.LL.length ? state.matrix.LL.map((x) => `<li>${escapeHtml(x)}</li>`).join('') : '<li class="empty-state">まだ項目がありません</li>';
}

function setupWeightedCalc() {
  const meter = byId('weightMeter');
  const scoreTable = byId('scoreTable');
  const recalc = () => {
    const ws = Number(byId('wSpeed').value), wq = Number(byId('wQuality').value), wc = Number(byId('wCost').value);
    const sum = ws + wq + wc || 1;
    meter.textContent = `重みの比率 => 速さ:${ws} 品質:${wq} コスト:${wc}`;
    const rows = state.options.map((o) => {
      const score = (o.speed * ws + o.quality * wq + (6 - o.cost) * wc) / sum;
      return { name: o.name, score: score.toFixed(2) };
    }).sort((a,b) => Number(b.score) - Number(a.score));
    scoreTable.innerHTML = rows.length
      ? rows.map((r) => `<tr><td>${escapeHtml(r.name)}</td><td>${r.score}</td></tr>`).join('')
      : '<tr><td colspan="2" class="empty-state">まだ候補がありません。サンプルで試せます。</td></tr>';
  };
  ['wSpeed','wQuality','wCost'].forEach((id) => byId(id).addEventListener('input', recalc));
  byId('addOptionBtn').addEventListener('click', () => {
    const name = (byId('optionName').value || '').trim();
    const speed = Number(byId('optionSpeed').value || 0);
    const quality = Number(byId('optionQuality').value || 0);
    const cost = Number(byId('optionCost').value || 0);
    if (!name || !speed || !quality || !cost) return;
    state.options.push({ name, speed, quality, cost });
    byId('optionName').value = '';
    byId('optionSpeed').value = '';
    byId('optionQuality').value = '';
    byId('optionCost').value = '';
    recalc();
  });
  byId('recalcBtn').addEventListener('click', recalc);
  state.helpers.recalc = recalc;
  recalc();
}

function setupSlotPlanner() {
  byId('addTaskBtn').addEventListener('click', () => {
    const task = (byId('taskInput').value || '').trim();
    const slot = byId('slotSelect').value;
    if (!task) return;
    state.slots[slot].push({ text: task, done: false });
    byId('taskInput').value = '';
    renderSlots();
  });
  byId('carryBtn').addEventListener('click', () => {
    carry('morning', 'afternoon');
    carry('afternoon', 'evening');
    renderSlots();
  });
  renderSlots();
}

function carry(from, to) {
  const stay = [];
  state.slots[from].forEach((t) => {
    if (t.done) stay.push(t);
    else state.slots[to].push({ text: t.text, done: false });
  });
  state.slots[from] = stay;
}

function renderSlots() {
  renderSlot('morning', byId('slotMorning'));
  renderSlot('afternoon', byId('slotAfternoon'));
  renderSlot('evening', byId('slotEvening'));
}

function renderSlot(key, el) {
  el.innerHTML = state.slots[key].length
    ? state.slots[key].map((t, i) => `<label class="task"><input type="checkbox" ${t.done?'checked':''} data-slot="${key}" data-idx="${i}">${escapeHtml(t.text)}</label>`).join('')
    : '<div class="empty-state">まだ予定がありません。サンプルで試せます。</div>';
  el.querySelectorAll('input[type="checkbox"]').forEach((box) => {
    box.addEventListener('change', (e) => {
      const slot = e.target.dataset.slot;
      const idx = Number(e.target.dataset.idx);
      state.slots[slot][idx].done = e.target.checked;
    });
  });
}

function setupFlowBoard() {
  byId('addFlowCardBtn').addEventListener('click', () => {
    const title = (byId('cardTitleInput').value || '').trim();
    if (!title) return;
    state.board.todo.push({ id: Date.now(), title });
    byId('cardTitleInput').value = '';
    renderBoard();
  });
  renderBoard();
}

function renderBoard() {
  renderLane('todo', byId('laneTodo'), 'doing');
  renderLane('doing', byId('laneDoing'), 'done');
  renderLane('done', byId('laneDone'), null);
}

function renderLane(key, el, next) {
  const laneLabel = (name) => ({ doing: '進行中へ', done: '終わりへ' }[name] || name);
  el.innerHTML = state.board[key].length
    ? state.board[key].map((c, i) => `<div class="card"><div>${escapeHtml(c.title)}</div>${next ? `<button data-lane="${key}" data-idx="${i}" data-next="${next}">→ ${laneLabel(next)}</button>` : ''}</div>`).join('')
    : '<div class="empty-state">まだカードがありません。サンプルで試せます。</div>';
  el.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lane = btn.dataset.lane;
      const idx = Number(btn.dataset.idx);
      const to = btn.dataset.next;
      const [card] = state.board[lane].splice(idx, 1);
      state.board[to].push(card);
      renderBoard();
    });
  });
}

function setupRoulette() {
  const wheel = byId('wheelFace');
  const score = byId('scoreValue');
  const round = byId('roundValue');
  const missionPool = byId('missionPool');
  const history = byId('roundHistory');

  byId('addMissionBtn').addEventListener('click', () => {
    const m = (byId('missionInput').value || '').trim();
    if (!m) return;
    state.missions.push(m);
    byId('missionInput').value = '';
    renderPool();
  });
  byId('spinBtn').addEventListener('click', () => {
    if (state.missions.length === 0) return;
    const picked = state.missions[Math.floor(Math.random() * state.missions.length)];
    wheel.textContent = picked;
    state.round += 1;
    state.score += 10;
    state.history.unshift(`R${state.round}: ${picked}`);
    state.history = state.history.slice(0, 12);
    round.textContent = String(state.round);
    score.textContent = String(state.score);
    history.innerHTML = state.history.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  });
  byId('clearRoundBtn').addEventListener('click', () => {
    state.round = 0; state.score = 0; state.history = []; wheel.textContent = 'まだ回していません';
    round.textContent = '0'; score.textContent = '0'; history.innerHTML = '<li>まだ履歴がありません</li>';
  });
  function renderPool() {
    missionPool.innerHTML = state.missions.length
      ? state.missions.map((x) => `<li>${escapeHtml(x)}</li>`).join('')
      : '<li class="empty-state">まだお題がありません。サンプルで試せます。</li>';
  }
  state.helpers.renderPool = renderPool;
  renderPool();
}

function setupBriefCanvas() {
  const root = byId('briefCanvas');
  if (!root) return;
  const key = PROFILE.interaction_archetype;
  const shellClass = escapeHtml(PROFILE.ui_variant || 'generic');
  const inputTitle = escapeHtml(PROFILE.input_panel_title || 'まず入れるもの');
  const sampleTitle = escapeHtml(PROFILE.sample_panel_title || 'サンプルで試す');
  const tipsTitle = escapeHtml(PROFILE.guide_panel_title || '使い方のコツ');
  const stageLabel = escapeHtml(PROFILE.hero_panel_label || '結果の見どころ');
  const resultTitle = escapeHtml(PROFILE.output_label || 'ここを見ればOKです');
  const introChip = `<div class="tool-chip">${escapeHtml(PROFILE.display_name_ja || PROFILE.title || '')}</div>`;
  const heroHead = `
    <div class="hero-head">
      <div>
        <div class="tool-chip tool-chip--soft">${stageLabel}</div>
        <h2>${resultTitle}</h2>
        <p id="resultLead">${escapeHtml(PROFILE.use_case_line_ja || '変化した結果がここに出ます。')}</p>
      </div>
      <div class="hero-kpi"><span>いまの主役</span><strong id="heroStatValue">準備前</strong></div>
    </div>
  `;
  const sampleBlock = `
    <section class="sample-card">
      <h2>${sampleTitle}</h2>
      <p class="mini-note">サンプルを入れると、そのままスクショ向きの状態まで見られます。</p>
      <div class="pill-row" id="samplePresetRow"></div>
    </section>
  `;
  const guideBlock = `
    <section class="legend-card">
      <h2>${tipsTitle}</h2>
      <p id="resultHint" class="mini-note"></p>
    </section>
  `;

  if (key === 'route_trace') {
    root.innerHTML = `
      <div class="brief-shell brief-shell--${shellClass}">
        <section class="brief-card">
          ${introChip}
          <h2>${inputTitle}</h2>
          <p class="helper-note">${escapeHtml(PROFILE.how_it_works_line_ja || 'サンプルで状態を作り、1操作で変化を見ます。')}</p>
          <div id="briefInputZone" class="brief-form"></div>
        </section>
        <section class="result-card">
          ${heroHead}
          <div class="status-strip" id="statusStrip"></div>
          <div id="briefResultZone"></div>
        </section>
      </div>
      <div class="detail-row detail-row--${shellClass}">
        ${sampleBlock}
        ${guideBlock}
      </div>
    `;
  } else if (key === 'filter_toggle') {
    root.innerHTML = `
      <section class="result-card">
        ${heroHead}
        <div id="briefInputZone" class="brief-form"></div>
        <div class="status-strip" id="statusStrip"></div>
        <div id="briefResultZone"></div>
      </section>
      <div class="detail-row detail-row--${shellClass}">
        ${sampleBlock}
        ${guideBlock}
      </div>
    `;
  } else if (key === 'stock_scan') {
    root.innerHTML = `
      <section class="brief-card">
        ${introChip}
        <h2>${inputTitle}</h2>
        <p class="helper-note">${escapeHtml(PROFILE.how_it_works_line_ja || 'サンプルで状態を作り、1操作で変化を見ます。')}</p>
        <div id="briefInputZone" class="brief-form"></div>
      </section>
      <section class="result-card">
        ${heroHead}
        <div class="status-strip" id="statusStrip"></div>
        <div id="briefResultZone"></div>
      </section>
      <div class="detail-row detail-row--${shellClass}">
        ${sampleBlock}
        ${guideBlock}
      </div>
    `;
  } else {
    root.innerHTML = `
      <div class="brief-shell brief-shell--${shellClass}">
        <section class="brief-card">
          ${introChip}
          <h2>${inputTitle}</h2>
          <p class="helper-note">${escapeHtml(PROFILE.how_it_works_line_ja || 'サンプルで状態を作り、1操作で変化を見ます。')}</p>
          <div id="briefInputZone" class="brief-form"></div>
        </section>
        <section class="result-card">
          ${heroHead}
          <div class="status-strip" id="statusStrip"></div>
          <div id="briefResultZone"></div>
        </section>
      </div>
      <div class="detail-row detail-row--${shellClass}">
        ${sampleBlock}
        ${guideBlock}
      </div>
    `;
  }
  if (key === 'drag_fit' && PROFILE.page_archetype === 'suitcase_grid') {
    setupSuitcaseFit(root);
    return;
  }
  if (key === 'stock_scan') {
    setupPantryRestock(root);
    return;
  }
  if (key === 'drag_assign') {
    setupReceiptSplit(root);
    return;
  }
  if (key === 'seat_arrange') {
    setupSeatBalance(root);
    return;
  }
  if (key === 'budget_trim') {
    setupCartTrim(root);
    return;
  }
  if (key === 'filter_toggle') {
    setupHomeFilter(root);
    return;
  }
  if (key === 'route_trace') {
    setupIntroRoute(root);
    return;
  }
  if (key === 'block_fill') {
    setupRequestFrame(root);
    return;
  }
  if (key === 'step_replay') {
    setupMorningReplay(root);
    return;
  }
  if (key === 'compartment_fit') {
    setupBentoFit(root);
    return;
  }
  if (key === 'sort_baskets') {
    setupLaundryLoad(root);
    return;
  }
  if (key === 'flow_pick') {
    setupFridgeDinner(root);
    return;
  }
  if (key === 'plug_match') {
    setupCableMatch(root);
    return;
  }
  if (key === 'rack_place') {
    setupDryRack(root);
    return;
  }
  if (key === 'deadline_pack') {
    setupReturnBox(root);
    return;
  }
  if (key === 'prune_sort') {
    setupPhotoPurge(root);
    return;
  }
  if (key === 'trash_lane_sort') {
    setupTrashDay(root);
    return;
  }
  if (key === 'tray_sort') {
    setupDeskCheckout(root);
    return;
  }
  if (key === 'swap_compare') {
    setupToneBalance(root);
    return;
  }

  root.querySelector('#briefInputZone').innerHTML = `
    <textarea id="toolInput" class="text-input" rows="5" placeholder="ここに入力します"></textarea>
    <div class="action-row"><button id="actionBtn" class="primary-btn">まず見てみる</button></div>
  `;
  root.querySelector('#briefResultZone').innerHTML = '<div class="empty-state">まだ結果がありません。サンプルで試せます。</div>';
  root.querySelector('#resultHint').textContent = 'サンプルで埋めてから、主ボタンを押すと結果が変わります。';
  byId('actionBtn')?.addEventListener('click', () => {
    const input = (byId('toolInput').value || '').trim();
    root.querySelector('#briefResultZone').innerHTML = `<div class="route-step"><strong>${escapeHtml(input || 'サンプル入力')}</strong><small>${escapeHtml(PROFILE.capture_hook || '')}</small></div>`;
    setHeroStat('変化済み');
    setStatusCards([{ label: '状態', value: '変化あり' }, { label: '用途', value: '確認済み' }, { label: '次', value: 'スクショOK' }]);
  });
  mountPresetButtons([{ label: 'サンプル入力', action: () => { byId('toolInput').value = 'サンプル入力'; byId('actionBtn')?.click(); } }]);
  state.helpers.runBriefSample = () => { byId('toolInput').value = 'サンプル入力'; byId('actionBtn')?.click(); };
}

function setHeroStat(value) {
  const node = byId('heroStatValue');
  if (node) node.textContent = value;
}

function setResultLead(value) {
  const node = byId('resultLead');
  if (node) node.textContent = value;
}

function setResultHint(value) {
  const node = byId('resultHint');
  if (node) node.textContent = value;
}

function setStatusCards(items) {
  const strip = byId('statusStrip');
  if (!strip) return;
  strip.innerHTML = items.map((item) => `
    <div class="status-chip">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
    </div>
  `).join('');
}

function mountPresetButtons(presets) {
  const row = byId('samplePresetRow');
  if (!row) return;
  row.innerHTML = '';
  presets.forEach((preset) => {
    const btn = document.createElement('button');
    btn.className = 'ghost-pill';
    btn.type = 'button';
    btn.textContent = preset.label;
    btn.addEventListener('click', preset.action);
    row.appendChild(btn);
  });
}

function setupSuitcaseFit(root) {
  const data = {
    presets: {
      '1泊出張': [
        { name: 'シャツ', size: 'M', weight: 10, packed: true, slot: '左上' },
        { name: '充電器', size: 'S', weight: 5, packed: true, slot: '右上' },
        { name: 'PC', size: 'L', weight: 18, packed: true, slot: '左下' },
        { name: '折りたたみ傘', size: 'M', weight: 9, packed: false, reason: '雨予報だが今回は現地貸出あり' },
        { name: '替えの靴', size: 'L', weight: 16, packed: false, reason: '今回は歩き回らない' }
      ],
      '週末旅行': [
        { name: 'ワンピース', size: 'L', weight: 14, packed: true, slot: '左上' },
        { name: '洗面セット', size: 'S', weight: 6, packed: true, slot: '右上' },
        { name: '羽織り', size: 'M', weight: 11, packed: true, slot: '左下' },
        { name: '本', size: 'M', weight: 8, packed: false, reason: '電子版に置き換え' },
        { name: 'ヘアアイロン', size: 'M', weight: 10, packed: false, reason: '宿に備え付けあり' }
      ]
    }
  };
  let current = [];

  root.querySelector('#briefInputZone').innerHTML = `
    <div class="mini-note">持ち物カードを切り替えると、入る物と外す物がすぐ変わります。</div>
    <div class="item-grid" id="packControlList"></div>
  `;
  root.querySelector('#briefResultZone').innerHTML = `
    <div class="suitcase-layout">
      <div class="suitcase-box"><div class="suitcase-grid" id="suitcaseGrid"></div></div>
      <div class="overflow-list" id="overflowList"></div>
    </div>
  `;
  setResultHint('カードを押すと、スーツケース側と外す候補側が入れ替わります。');

  function render() {
    const controls = byId('packControlList');
    controls.innerHTML = current.map((item, idx) => `
      <div class="item-card ${item.packed ? 'keep' : 'cut'}">
        <div>
          <div class="item-title">${escapeHtml(item.name)}</div>
          <div class="subline">大きさ ${escapeHtml(item.size)} / 重さ ${item.weight}</div>
        </div>
        <div class="mini-actions">
          <button class="assign-btn" data-pack-idx="${idx}">${item.packed ? '外す候補へ' : '入れる'}</button>
        </div>
      </div>
    `).join('');
    controls.querySelectorAll('[data-pack-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.packIdx);
        current[idx].packed = !current[idx].packed;
        render();
      });
    });

    const packed = current.filter((item) => item.packed).slice(0, 4);
    const cut = current.filter((item) => !item.packed);
    byId('suitcaseGrid').innerHTML = ['左上', '右上', '左下', '右下'].map((slot, idx) => {
      const item = packed[idx];
      return item
        ? `<div class="pack-slot"><strong>${escapeHtml(slot)}</strong><span>${escapeHtml(item.name)}</span><span>${item.size} / ${item.weight}</span></div>`
        : `<div class="pack-slot"><strong>${escapeHtml(slot)}</strong><span>まだ空いています</span></div>`;
    }).join('');
    byId('overflowList').innerHTML = cut.length
      ? cut.map((item) => `<div class="overflow-pill"><strong>${escapeHtml(item.name)}</strong><div class="subline">${escapeHtml(item.reason || '今回は見送り')}</div></div>`).join('')
      : '<div class="empty-state">外す候補はありません。今の構成で収まっています。</div>';

    setHeroStat(`${packed.length} / 4`);
    setStatusCards([
      { label: '入る物', value: `${packed.length}点` },
      { label: '外す候補', value: `${cut.length}点` },
      { label: '余白', value: `${Math.max(0, 4 - packed.length)}枠` }
    ]);
    setResultLead(cut.length ? '外す候補まで見えるので、旅行前に減らしやすくなります。' : '今の荷物ならそのまま持っていけます。');
  }

  function applyPreset(name) {
    current = clone(data.presets[name]);
    render();
  }

  mountPresetButtons(Object.keys(data.presets).map((name) => ({ label: name, action: () => applyPreset(name) })));
  state.helpers.runBriefSample = () => applyPreset('1泊出張');
  applyPreset('1泊出張');
}

function setupPantryRestock(root) {
  const presets = {
    '買い物前': [
      { name: '米', stock: 18, unit: '%', action: '今日買う' },
      { name: '卵', stock: 8, unit: '%', action: '今日買う' },
      { name: '洗剤', stock: 42, unit: '%', action: '今週見る' },
      { name: 'コーヒー', stock: 72, unit: '%', action: 'まだ大丈夫' }
    ]
  };
  let rows = [];

  root.querySelector('#briefInputZone').innerHTML = '<div class="shelf-board" id="shelfControlList"></div>';
  root.querySelector('#briefResultZone').innerHTML = '<div class="shelf-board" id="shelfBoard"></div>';
  setResultHint('プラスとマイナスで残量を動かすと、今日買う棚だけが前に出ます。');

  function render() {
    const control = byId('shelfControlList');
    control.innerHTML = rows.map((row, idx) => `
      <div class="shelf-row ${row.stock <= 25 ? 'low' : ''}">
        <div><strong>${escapeHtml(row.name)}</strong><div class="subline">${row.stock}${row.unit}</div></div>
        <div class="action-row">
          <button class="tiny-btn" data-shelf="${idx}" data-delta="-12">-12</button>
          <button class="tiny-btn" data-shelf="${idx}" data-delta="12">+12</button>
        </div>
        <div class="subline">${escapeHtml(row.stock <= 25 ? '今日買う' : row.stock <= 50 ? '今週見る' : 'まだ大丈夫')}</div>
      </div>
    `).join('');
    control.querySelectorAll('[data-shelf]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.shelf);
        const delta = Number(btn.dataset.delta);
        rows[idx].stock = Math.max(0, Math.min(100, rows[idx].stock + delta));
        render();
      });
    });

    byId('shelfBoard').innerHTML = rows.map((row) => `
      <div class="shelf-row ${row.stock <= 25 ? 'low' : ''}">
        <div><strong>${escapeHtml(row.name)}</strong><div class="subline">${row.stock}${row.unit}</div></div>
        <div class="shelf-bar"><span style="width:${row.stock}%"></span></div>
        <div><strong>${escapeHtml(row.stock <= 25 ? '今日買う' : row.stock <= 50 ? '今週見る' : 'まだ大丈夫')}</strong></div>
      </div>
    `).join('');

    const urgent = rows.filter((row) => row.stock <= 25).length;
    setHeroStat(`${urgent}段`);
    setStatusCards([
      { label: '今日買う', value: `${urgent}つ` },
      { label: '今週見る', value: `${rows.filter((row) => row.stock > 25 && row.stock <= 50).length}つ` },
      { label: '余裕あり', value: `${rows.filter((row) => row.stock > 50).length}つ` }
    ]);
    setResultLead('残量の低い棚だけが前に出るので、買う物リストより一瞬で分かります。');
  }

  function applyPreset(name) {
    rows = clone(presets[name]);
    render();
  }

  mountPresetButtons([{ label: '買い物前の棚', action: () => applyPreset('買い物前') }]);
  state.helpers.runBriefSample = () => applyPreset('買い物前');
  applyPreset('買い物前');
}

function setupReceiptSplit(root) {
  const presets = {
    '3人で食事': {
      items: [
        { name: 'パスタ', price: 980, owner: 'Aさん' },
        { name: 'サラダ', price: 720, owner: '共有' },
        { name: 'ワイン', price: 1600, owner: 'Bさん' },
        { name: 'デザート', price: 650, owner: 'Cさん' }
      ],
      people: ['Aさん', 'Bさん', 'Cさん', '共有']
    }
  };
  let model = clone(presets['3人で食事']);

  root.querySelector('#briefInputZone').innerHTML = '<div class="receipt-items" id="receiptItemControls"></div>';
  root.querySelector('#briefResultZone').innerHTML = `
    <div class="receipt-board">
      <div class="receipt-items" id="receiptItemBoard"></div>
      <div class="person-ledger" id="personLedger"></div>
    </div>
  `;
  setResultHint('各品目の行先を押すたびに、誰がいくら払うかがその場で変わります。');

  function render() {
    const owners = model.people;
    const totals = Object.fromEntries(owners.map((name) => [name, 0]));
    model.items.forEach((item) => {
      totals[item.owner] += item.price;
    });

    const control = byId('receiptItemControls');
    const board = byId('receiptItemBoard');
    const makeItemCard = (item, idx) => `
      <div class="receipt-item">
        <div>
          <div class="item-title">${escapeHtml(item.name)}</div>
          <div class="subline">¥${item.price.toLocaleString()} / 今は ${escapeHtml(item.owner)}</div>
        </div>
        <div class="pill-row">
          ${owners.map((owner) => `<button class="assign-btn" data-receipt-idx="${idx}" data-owner="${escapeHtml(owner)}">${escapeHtml(owner)}</button>`).join('')}
        </div>
      </div>
    `;
    control.innerHTML = model.items.map(makeItemCard).join('');
    board.innerHTML = model.items.map(makeItemCard).join('');
    root.querySelectorAll('[data-receipt-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.receiptIdx);
        model.items[idx].owner = btn.dataset.owner;
        render();
      });
    });

    byId('personLedger').innerHTML = owners.map((owner) => `
      <div class="person-card">
        <strong>${escapeHtml(owner)}</strong>
        <span>¥${totals[owner].toLocaleString()}</span>
      </div>
    `).join('');
    const ordered = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    setHeroStat(`¥${ordered[0][1].toLocaleString()}`);
    setStatusCards([
      { label: 'いちばん多い人', value: ordered[0][0] },
      { label: '共有品目', value: `${model.items.filter((item) => item.owner === '共有').length}件` },
      { label: '精算差', value: `¥${(ordered[0][1] - ordered[ordered.length - 1][1]).toLocaleString()}` }
    ]);
    setResultLead('レシート品目の行先が見えるので、精算額が一瞬でまとまります。');
  }

  mountPresetButtons([{ label: '3人で食事', action: () => { model = clone(presets['3人で食事']); render(); } }]);
  state.helpers.runBriefSample = () => { model = clone(presets['3人で食事']); render(); };
  render();
}

function setupSeatBalance(root) {
  const presets = {
    '6人の会食': [
      { name: '司会', mood: 'bridge', seat: 0 },
      { name: '初参加A', mood: 'quiet', seat: 1 },
      { name: '営業', mood: 'bridge', seat: 2 },
      { name: '初参加B', mood: 'quiet', seat: 3 },
      { name: '開発', mood: 'deep', seat: 4 },
      { name: '広報', mood: 'bridge', seat: 5 }
    ]
  };
  const seatPos = [
    { left: '42%', top: '6%' },
    { left: '71%', top: '22%' },
    { left: '71%', top: '58%' },
    { left: '42%', top: '76%' },
    { left: '11%', top: '58%' },
    { left: '11%', top: '22%' }
  ];
  let guests = clone(presets['6人の会食']);

  root.querySelector('#briefInputZone').innerHTML = '<div class="guest-bench" id="guestBench"></div>';
  root.querySelector('#briefResultZone').innerHTML = `
    <div class="table-layout">
      <div class="table-ring" id="tableRing"></div>
      <div class="guest-bench" id="seatSummary"></div>
    </div>
  `;
  setResultHint('ゲストの席を1人分ずらすだけで、孤立と固まりがすぐ変わります。');

  function scoreSeat(index) {
    const guest = guests.find((item) => item.seat === index);
    if (!guest) return { cls: '', note: '空席' };
    const neighbors = [((index + 5) % 6), ((index + 1) % 6)].map((seat) => guests.find((item) => item.seat === seat)).filter(Boolean);
    const quietAround = neighbors.filter((item) => item.mood === 'quiet').length;
    if (guest.mood === 'quiet' && quietAround >= 1) return { cls: 'bad', note: '静かな人が固まり気味' };
    if (guest.mood === 'bridge') return { cls: 'good', note: 'つなぎ役になりやすい席' };
    return { cls: '', note: 'この席でも大丈夫' };
  }

  function render() {
    const bench = byId('guestBench');
    bench.innerHTML = guests.map((guest, idx) => `
      <div class="guest-row">
        <div><strong>${escapeHtml(guest.name)}</strong><div class="subline">今は ${guest.seat + 1}番席</div></div>
        <div class="mini-actions">
          <button class="assign-btn" data-seat-shift="${idx}" data-dir="-1">←</button>
          <button class="assign-btn" data-seat-shift="${idx}" data-dir="1">→</button>
        </div>
      </div>
    `).join('');
    bench.querySelectorAll('[data-seat-shift]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.seatShift);
        const dir = Number(btn.dataset.dir);
        const targetSeat = (guests[idx].seat + dir + 6) % 6;
        const swapIdx = guests.findIndex((item) => item.seat === targetSeat);
        if (swapIdx >= 0) {
          const temp = guests[idx].seat;
          guests[idx].seat = guests[swapIdx].seat;
          guests[swapIdx].seat = temp;
        }
        render();
      });
    });

    const ring = byId('tableRing');
    ring.innerHTML = guests.map((guest) => {
      const seatMeta = seatPos[guest.seat];
      const score = scoreSeat(guest.seat);
      return `<div class="seat-node ${score.cls}" style="left:${seatMeta.left};top:${seatMeta.top}">
        <strong>${escapeHtml(guest.name)}</strong>
        <div class="subline">${escapeHtml(score.note)}</div>
      </div>`;
    }).join('');

    const summary = byId('seatSummary');
    summary.innerHTML = guests.map((guest) => {
      const score = scoreSeat(guest.seat);
      return `<div class="guest-row"><div><strong>${escapeHtml(guest.name)}</strong><div class="subline">${guest.seat + 1}番席 / ${escapeHtml(score.note)}</div></div></div>`;
    }).join('');

    const bad = guests.filter((guest) => scoreSeat(guest.seat).cls === 'bad').length;
    setHeroStat(bad === 0 ? '安定' : `${bad}席注意`);
    setStatusCards([
      { label: '固まり注意', value: `${bad}席` },
      { label: 'つなぎ役', value: `${guests.filter((guest) => guest.mood === 'bridge').length}人` },
      { label: '空席', value: '0席' }
    ]);
    setResultLead(bad === 0 ? '今の席順なら初参加が孤立しにくい並びです。' : '静かな人が固まりやすい席が見えるので、1人分ずらすと落ち着きます。');
  }

  mountPresetButtons([{ label: '6人の会食', action: () => { guests = clone(presets['6人の会食']); render(); } }]);
  state.helpers.runBriefSample = () => { guests = clone(presets['6人の会食']); render(); };
  render();
}

function setupCartTrim(root) {
  const presets = {
    '予算4,000円': {
      budget: 4000,
      items: [
        { name: '牛乳', price: 220, keep: true, alt: 'そのまま' },
        { name: '洗剤', price: 680, keep: true, alt: '来週でもOK' },
        { name: 'お菓子', price: 350, keep: false, alt: '今回は見送り' },
        { name: 'パスタソース', price: 420, keep: true, alt: 'そのまま' },
        { name: '冷凍食品', price: 980, keep: true, alt: 'そのまま' },
        { name: '炭酸水', price: 540, keep: false, alt: '家の在庫を使う' },
        { name: 'ヨーグルト', price: 260, keep: true, alt: 'そのまま' }
      ]
    }
  };
  let model = clone(presets['予算4,000円']);

  root.querySelector('#briefInputZone').innerHTML = `
    <div class="mini-note">残す / 外すを切り替えると、超過額と外す候補がその場で変わります。</div>
    <div class="cart-items" id="cartControlList"></div>
  `;
  root.querySelector('#briefResultZone').innerHTML = `
    <div class="cut-board">
      <div class="cart-items" id="cartList"></div>
      <div class="overflow-list" id="cutSuggestions"></div>
    </div>
  `;
  setResultHint('外す候補が右にまとまるので、予算内へ戻す順番をそのまま使えます。');

  function render() {
    const total = model.items.filter((item) => item.keep).reduce((sum, item) => sum + item.price, 0);
    const over = Math.max(0, total - model.budget);
    const controlHtml = model.items.map((item, idx) => `
      <div class="cart-item ${item.keep ? '' : 'cut'}">
        <div><strong>${escapeHtml(item.name)}</strong><div class="subline">¥${item.price.toLocaleString()}</div></div>
        <button class="assign-btn" data-cart-idx="${idx}">${item.keep ? '外す候補へ' : '残す'}</button>
      </div>
    `).join('');
    byId('cartControlList').innerHTML = controlHtml;
    byId('cartList').innerHTML = `
      <div class="status-chip"><span>合計</span><strong>¥${total.toLocaleString()}</strong></div>
      <div class="meter"><span style="width:${Math.min(100, (total / model.budget) * 100)}%"></span></div>
      ${controlHtml}
    `;
    root.querySelectorAll('[data-cart-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.cartIdx);
        model.items[idx].keep = !model.items[idx].keep;
        render();
      });
    });
    const cuts = model.items.filter((item) => !item.keep);
    byId('cutSuggestions').innerHTML = cuts.length
      ? cuts.map((item) => `<div class="overflow-pill"><strong>${escapeHtml(item.name)}</strong><div class="subline">${escapeHtml(item.alt)}</div></div>`).join('')
      : '<div class="empty-state">外す候補はありません。今の合計で予算内です。</div>';
    setHeroStat(over > 0 ? `+¥${over.toLocaleString()}` : '予算内');
    setStatusCards([
      { label: '予算', value: `¥${model.budget.toLocaleString()}` },
      { label: '合計', value: `¥${total.toLocaleString()}` },
      { label: '外す候補', value: `${cuts.length}件` }
    ]);
    setResultLead(over > 0 ? 'まず外す候補が右に残るので、予算オーバーをすぐ戻せます。' : '今のカゴならそのまま予算内で会計できます。');
  }

  mountPresetButtons([{ label: '予算4,000円', action: () => { model = clone(presets['予算4,000円']); render(); } }]);
  state.helpers.runBriefSample = () => { model = clone(presets['予算4,000円']); render(); };
  render();
}

function setupHomeFilter(root) {
  const presets = {
    '部屋探し': {
      filters: [
        { key: '駅近', active: true },
        { key: '2階以上', active: true },
        { key: 'ペット可', active: false },
        { key: '独立洗面台', active: false }
      ],
      listings: [
        { name: 'Aマンション', tags: ['駅近', '2階以上', '独立洗面台'], note: '通勤に強い' },
        { name: 'Bレジデンス', tags: ['駅近', 'ペット可'], note: '犬と住みやすい' },
        { name: 'Cハイツ', tags: ['2階以上', '独立洗面台'], note: '静かさ重視' },
        { name: 'Dコーポ', tags: ['駅近', '2階以上', 'ペット可'], note: '条件のバランスが良い' }
      ]
    }
  };
  let model = clone(presets['部屋探し']);

  root.querySelector('#briefInputZone').innerHTML = `
    <div class="filter-toolbar" id="filterToolbar"></div>
    <div class="mini-note">条件を切り替えると、残る候補だけが前に出ます。</div>
  `;
  root.querySelector('#briefResultZone').innerHTML = '<div class="filter-board"><div class="listing-grid" id="listingGrid"></div></div>';
  setResultHint('条件を1つ変えるだけで、残る候補が減るので決め手が見えます。');

  function render() {
    const active = model.filters.filter((item) => item.active).map((item) => item.key);
    byId('filterToolbar').innerHTML = model.filters.map((filter, idx) => `
      <button class="tag-btn ${filter.active ? 'active' : ''}" data-filter-idx="${idx}">${escapeHtml(filter.key)}</button>
    `).join('');
    byId('filterToolbar').querySelectorAll('[data-filter-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.filterIdx);
        model.filters[idx].active = !model.filters[idx].active;
        render();
      });
    });
    const survivors = model.listings.filter((listing) => active.every((tag) => listing.tags.includes(tag)));
    byId('listingGrid').innerHTML = model.listings.map((listing) => {
      const alive = survivors.includes(listing);
      return `<div class="listing-card ${alive ? '' : 'dead'}">
        <div class="listing-title">${escapeHtml(listing.name)}</div>
        <div class="subline">${escapeHtml(alive ? listing.note : 'いまは条件から外れます')}</div>
        <div class="listing-badges">${listing.tags.map((tag) => `<span class="badge ${active.includes(tag) ? 'hit' : ''}">${escapeHtml(tag)}</span>`).join('')}</div>
      </div>`;
    }).join('');
    setHeroStat(`${survivors.length}件`);
    setStatusCards([
      { label: '有効条件', value: `${active.length}つ` },
      { label: '残る候補', value: `${survivors.length}件` },
      { label: '外れた候補', value: `${model.listings.length - survivors.length}件` }
    ]);
    setResultLead(survivors.length ? '残る候補だけが前に残るので、比較表より早く絞れます。' : '条件が厳しすぎるので、1つ外すと候補が戻ります。');
  }

  mountPresetButtons([{ label: '部屋探し', action: () => { model = clone(presets['部屋探し']); render(); } }]);
  state.helpers.runBriefSample = () => { model = clone(presets['部屋探し']); render(); };
  render();
}

function setupIntroRoute(root) {
  const presets = {
    '採用担当へ紹介': {
      nodes: [
        { name: '自分', type: 'start', x: 10, y: 44 },
        { name: '先輩', type: 'path', x: 34, y: 18 },
        { name: '元同僚', type: 'path', x: 36, y: 66 },
        { name: '採用担当', type: 'target', x: 72, y: 42 }
      ],
      edges: [
        ['自分', '先輩', '最近やり取りあり'],
        ['先輩', '採用担当', '同じ勉強会で接点あり'],
        ['自分', '元同僚', '半年ぶり'],
        ['元同僚', '採用担当', '面識あり']
      ],
      bestPath: ['自分', '先輩', '採用担当']
    }
  };
  let model = clone(presets['採用担当へ紹介']);

  root.querySelector('#briefInputZone').innerHTML = `
    <div class="mini-note">順路を切り替えると、一番頼みやすいルートだけが強く見えます。</div>
    <div class="action-row">
      <button id="routePrimaryBtn" class="primary-btn">頼みやすい順で見る</button>
      <button id="routeAltBtn" class="secondary-btn">別ルートを試す</button>
    </div>
  `;
  root.querySelector('#briefResultZone').innerHTML = `
    <div class="route-board">
      <div class="network-canvas" id="networkCanvas"></div>
      <div class="path-list" id="pathList"></div>
    </div>
  `;
  setResultHint('別ルートを試すと、頼みやすい順がすぐ入れ替わります。');

  function render() {
    const canvas = byId('networkCanvas');
    const nodeByName = Object.fromEntries(model.nodes.map((node) => [node.name, node]));
    const edgeLines = model.edges.map(([from, to]) => {
      const a = nodeByName[from];
      const b = nodeByName[to];
      const inPath = model.bestPath.includes(from) && model.bestPath.includes(to) && Math.abs(model.bestPath.indexOf(from) - model.bestPath.indexOf(to)) === 1;
      return `<line x1="${a.x + 8}" y1="${a.y + 8}" x2="${b.x + 8}" y2="${b.y + 8}" stroke="${inPath ? '#5dd6ff' : 'rgba(255,255,255,.22)'}" stroke-width="${inPath ? '4' : '2'}"></line>`;
    }).join('');
    canvas.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${edgeLines}</svg>` + model.nodes.map((node) => `
      <div class="network-node ${node.type} ${model.bestPath.includes(node.name) ? 'path' : ''}" style="left:${node.x}%;top:${node.y}%">
        <strong>${escapeHtml(node.name)}</strong>
      </div>
    `).join('');
    byId('pathList').innerHTML = model.bestPath.map((name, idx) => {
      const next = model.bestPath[idx + 1];
      const edge = next ? model.edges.find((item) => item[0] === name && item[1] === next) : null;
      return `<div class="route-step"><div class="route-name">${idx + 1}. ${escapeHtml(name)}</div><small>${escapeHtml(edge ? edge[2] : 'ここで紹介完了')}</small></div>`;
    }).join('');
    setHeroStat(`${model.bestPath.length - 1} hops`);
    setStatusCards([
      { label: '最初に頼む', value: model.bestPath[1] || 'なし' },
      { label: '経由人数', value: `${Math.max(0, model.bestPath.length - 2)}人` },
      { label: '終点', value: model.bestPath[model.bestPath.length - 1] }
    ]);
    setResultLead('一本の頼み順だけを強く見せるので、巨大グラフを読まなくて済みます。');
  }

  byId('routePrimaryBtn').addEventListener('click', () => {
    model.bestPath = ['自分', '先輩', '採用担当'];
    render();
  });
  byId('routeAltBtn').addEventListener('click', () => {
    model.bestPath = ['自分', '元同僚', '採用担当'];
    render();
  });

  mountPresetButtons([{ label: '採用担当へ紹介', action: () => { model = clone(presets['採用担当へ紹介']); render(); } }]);
  state.helpers.runBriefSample = () => { model = clone(presets['採用担当へ紹介']); render(); };
  render();
}

function setupRequestFrame(root) {
  const presets = {
    'レビュー依頼': [
      { label: '背景', value: '明日午前までにLPの文言確認が必要です', filled: true },
      { label: '頼みたいこと', value: '見出し3本のうち一番伝わる案を選んでほしい', filled: true },
      { label: '締切', value: '今日18時', filled: true },
      { label: '受け渡し形', value: '', filled: false }
    ]
  };
  let cards = clone(presets['レビュー依頼']);
  root.querySelector('#briefInputZone').innerHTML = '<div class="request-cards" id="requestControls"></div>';
  root.querySelector('#briefResultZone').innerHTML = '<div class="request-cards" id="requestCards"></div>';
  setResultHint('空いているカードを埋めると、お願い文の抜けが減ります。');

  function render() {
    const html = cards.map((card, idx) => `
      <div class="request-card ${card.filled ? '' : 'missing'}">
        <strong>${escapeHtml(card.label)}</strong>
        <div class="subline">${escapeHtml(card.value || 'まだ空いています')}</div>
        <div class="mini-actions"><button class="assign-btn" data-request-idx="${idx}">${card.filled ? '空に戻す' : '埋める'}</button></div>
      </div>
    `).join('');
    byId('requestControls').innerHTML = html;
    byId('requestCards').innerHTML = html;
    root.querySelectorAll('[data-request-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.requestIdx);
        cards[idx].filled = !cards[idx].filled;
        if (!cards[idx].filled) cards[idx].value = '';
        else if (!cards[idx].value) cards[idx].value = 'サンプルで埋めました';
        render();
      });
    });
    const filled = cards.filter((card) => card.filled).length;
    setHeroStat(`${filled}/4`);
    setStatusCards([
      { label: '埋まった要素', value: `${filled}枚` },
      { label: '残り', value: `${cards.length - filled}枚` },
      { label: '送れる状態', value: filled === cards.length ? 'はい' : 'あと少し' }
    ]);
    setResultLead('抜けカードが残るので、送る前に足りない所だけ見直せます。');
  }

  mountPresetButtons([{ label: 'レビュー依頼', action: () => { cards = clone(presets['レビュー依頼']); render(); } }]);
  state.helpers.runBriefSample = () => { cards = clone(presets['レビュー依頼']); render(); };
  render();
}

function setupMorningReplay(root) {
  const presets = {
    '朝の支度': [
      { step: '起きる', delay: 0 },
      { step: 'スマホを見る', delay: 12 },
      { step: '着替える', delay: 6 },
      { step: '朝食', delay: 4 },
      { step: '出発', delay: 0 }
    ]
  };
  let steps = clone(presets['朝の支度']);
  root.querySelector('#briefInputZone').innerHTML = '<div class="action-row"><button id="delayStepBtn" class="primary-btn">1段ずつ進める</button></div>';
  root.querySelector('#briefResultZone').innerHTML = '<div class="delay-list" id="delayList"></div>';
  setResultHint('進めるたびに、遅れが大きい段だけが赤く残ります。');

  function render() {
    byId('delayList').innerHTML = steps.map((item, idx) => `
      <div class="delay-card ${item.delay >= 10 ? 'bad' : item.delay === 0 ? 'good' : ''}">
        <strong>${idx + 1}. ${escapeHtml(item.step)}</strong>
        <div class="subline">${item.delay > 0 ? `${item.delay}分の遅れ` : '遅れなし'}</div>
      </div>
    `).join('');
    const worst = steps.reduce((max, item) => Math.max(max, item.delay), 0);
    setHeroStat(`${worst}分`);
    setStatusCards([
      { label: '最大の遅れ', value: `${worst}分` },
      { label: '注意段', value: `${steps.filter((item) => item.delay >= 10).length}段` },
      { label: '安定段', value: `${steps.filter((item) => item.delay === 0).length}段` }
    ]);
    setResultLead('いちばん遅れを広げる段だけが浮くので、直す場所がすぐ見えます。');
  }

  byId('delayStepBtn').addEventListener('click', () => {
    steps = steps.map((item, idx) => idx === 1 ? { ...item, delay: Math.max(0, item.delay - 4) } : item);
    render();
  });
  mountPresetButtons([{ label: '朝の支度', action: () => { steps = clone(presets['朝の支度']); render(); } }]);
  state.helpers.runBriefSample = () => { steps = clone(presets['朝の支度']); render(); };
  render();
}

function setupBentoFit(root) {
  const presets = {
    'お弁当': [
      { name: 'ごはん', box: '大きい仕切り', packed: true },
      { name: '卵焼き', box: '左上', packed: true },
      { name: '唐揚げ', box: '右上', packed: true },
      { name: 'ブロッコリー', box: '', packed: false },
      { name: 'トマト', box: '', packed: false }
    ]
  };
  let items = clone(presets['お弁当']);
  root.querySelector('#briefInputZone').innerHTML = '<div class="item-grid" id="bentoControls"></div>';
  root.querySelector('#briefResultZone').innerHTML = `
    <div class="compartment-grid">
      <div class="compartment" id="bentoA"><strong>大きい仕切り</strong></div>
      <div class="compartment" id="bentoB"><strong>左上</strong></div>
      <div class="compartment" id="bentoC"><strong>右上</strong></div>
    </div>
    <div class="overflow-list" id="bentoOverflow"></div>
  `;
  setResultHint('おかずを切り替えると、仕切りに入る物と余る物がすぐ変わります。');

  function render() {
    byId('bentoControls').innerHTML = items.map((item, idx) => `
      <div class="item-card ${item.packed ? 'keep' : 'cut'}">
        <div class="item-title">${escapeHtml(item.name)}</div>
        <button class="assign-btn" data-bento-idx="${idx}">${item.packed ? '余りへ' : '入れる'}</button>
      </div>
    `).join('');
    root.querySelectorAll('[data-bento-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.bentoIdx);
        items[idx].packed = !items[idx].packed;
        render();
      });
    });
    const packed = items.filter((item) => item.packed);
    byId('bentoA').innerHTML = '<strong>大きい仕切り</strong>' + packed.filter((item) => item.box === '大きい仕切り').map((item) => `<div>${escapeHtml(item.name)}</div>`).join('');
    byId('bentoB').innerHTML = '<strong>左上</strong>' + packed.filter((item) => item.box === '左上').map((item) => `<div>${escapeHtml(item.name)}</div>`).join('');
    byId('bentoC').innerHTML = '<strong>右上</strong>' + packed.filter((item) => item.box === '右上').map((item) => `<div>${escapeHtml(item.name)}</div>`).join('');
    const overflow = items.filter((item) => !item.packed);
    byId('bentoOverflow').innerHTML = overflow.length ? overflow.map((item) => `<div class="overflow-pill">${escapeHtml(item.name)}</div>`).join('') : '<div class="empty-state">今の構成で全部収まっています。</div>';
    setHeroStat(`${packed.length}品`);
    setStatusCards([
      { label: '入る物', value: `${packed.length}品` },
      { label: '余る物', value: `${overflow.length}品` },
      { label: '仕切り', value: '3区画' }
    ]);
    setResultLead('仕切りに収まる形が見えるので、朝の詰め方をすぐ決められます。');
  }

  mountPresetButtons([{ label: 'お弁当', action: () => { items = clone(presets['お弁当']); render(); } }]);
  state.helpers.runBriefSample = () => { items = clone(presets['お弁当']); render(); };
  render();
}

function setupLaundryLoad(root) {
  const presets = {
    '洗濯前': [
      { name: '白シャツ', lane: 'today', note: '今日回す' },
      { name: '黒Tシャツ', lane: 'today', note: '今日回す' },
      { name: 'ニット', lane: 'handwash', note: '手洗い' },
      { name: '厚手タオル', lane: 'later', note: '次の回' },
      { name: 'デニム', lane: 'later', note: '色移りが気になる' }
    ]
  };
  let items = clone(presets['洗濯前']);

  root.querySelector('#briefInputZone').innerHTML = '<div class="item-grid" id="laundryControls"></div>';
  root.querySelector('#briefResultZone').innerHTML = `
    <div class="compartment-grid">
      <div class="compartment" id="laundryToday"><strong>今回まわす</strong></div>
      <div class="compartment" id="laundryLater"><strong>後で洗う</strong></div>
      <div class="compartment" id="laundryHandwash"><strong>手洗い</strong></div>
    </div>
  `;
  setResultHint('服の行き先を変えるたび、今回まわす一回分がすぐ固まります。');

  function render() {
    byId('laundryControls').innerHTML = items.map((item, idx) => `
      <div class="item-card ${item.lane === 'today' ? 'keep' : item.lane === 'later' ? 'cut' : ''}">
        <div><div class="item-title">${escapeHtml(item.name)}</div><div class="subline">${escapeHtml(item.note)}</div></div>
        <div class="pill-row">
          <button class="assign-btn" data-laundry-idx="${idx}" data-lane="today">今回</button>
          <button class="assign-btn" data-laundry-idx="${idx}" data-lane="later">後で</button>
          <button class="assign-btn" data-laundry-idx="${idx}" data-lane="handwash">手洗い</button>
        </div>
      </div>
    `).join('');
    root.querySelectorAll('[data-laundry-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        items[Number(btn.dataset.laundryIdx)].lane = btn.dataset.lane;
        render();
      });
    });
    const laneHtml = (lane) => items.filter((item) => item.lane === lane)
      .map((item) => `<div class="overflow-pill"><strong>${escapeHtml(item.name)}</strong><div class="subline">${escapeHtml(item.note)}</div></div>`)
      .join('') || '<div class="empty-state">まだありません。</div>';
    byId('laundryToday').innerHTML = '<strong>今回まわす</strong>' + laneHtml('today');
    byId('laundryLater').innerHTML = '<strong>後で洗う</strong>' + laneHtml('later');
    byId('laundryHandwash').innerHTML = '<strong>手洗い</strong>' + laneHtml('handwash');
    setHeroStat(`${items.filter((item) => item.lane === 'today').length}点`);
    setStatusCards([
      { label: '今回', value: `${items.filter((item) => item.lane === 'today').length}点` },
      { label: '後で', value: `${items.filter((item) => item.lane === 'later').length}点` },
      { label: '手洗い', value: `${items.filter((item) => item.lane === 'handwash').length}点` }
    ]);
    setResultLead('今回まわす / 後で洗う / 手洗いが同時に見えるので、床で広げるより早く決まります。');
  }

  mountPresetButtons([{ label: '洗濯前', action: () => { items = clone(presets['洗濯前']); render(); } }]);
  state.helpers.runBriefSample = () => { items = clone(presets['洗濯前']); render(); };
  render();
}

function setupFridgeDinner(root) {
  const presets = {
    '20分夕飯': {
      ingredients: [
        { key: '卵', active: true },
        { key: 'ベーコン', active: true },
        { key: 'トマト', active: false },
        { key: 'チーズ', active: true },
        { key: '豆腐', active: false }
      ],
      meals: [
        { name: 'カルボナーラ風うどん', needs: ['卵', 'ベーコン', 'チーズ'], note: '10分で作れる' },
        { name: 'トマトオムレツ', needs: ['卵', 'トマト', 'チーズ'], note: '洗い物が少ない' },
        { name: '豆腐チャンプルー', needs: ['豆腐', '卵', 'ベーコン'], note: 'ボリュームが出る' },
        { name: 'ベーコンエッグ丼', needs: ['卵', 'ベーコン'], note: '最短でまとまる' }
      ]
    }
  };
  let model = clone(presets['20分夕飯']);

  root.querySelector('#briefInputZone').innerHTML = '<div class="filter-toolbar" id="dinnerFilters"></div>';
  root.querySelector('#briefResultZone').innerHTML = '<div class="listing-grid" id="dinnerCards"></div>';
  setResultHint('食材を切り替えるたび、今夜作れる候補だけが前に残ります。');

  function render() {
    const active = model.ingredients.filter((item) => item.active).map((item) => item.key);
    byId('dinnerFilters').innerHTML = model.ingredients.map((item, idx) => `
      <button class="tag-btn ${item.active ? 'active' : ''}" data-dinner-idx="${idx}">${escapeHtml(item.key)}</button>
    `).join('');
    byId('dinnerFilters').querySelectorAll('[data-dinner-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        model.ingredients[Number(btn.dataset.dinnerIdx)].active = !model.ingredients[Number(btn.dataset.dinnerIdx)].active;
        render();
      });
    });
    const survivors = model.meals.filter((meal) => meal.needs.every((need) => active.includes(need)));
    byId('dinnerCards').innerHTML = model.meals.map((meal) => {
      const alive = survivors.includes(meal);
      return `<div class="listing-card ${alive ? '' : 'dead'}">
        <div class="listing-title">${escapeHtml(meal.name)}</div>
        <div class="subline">${escapeHtml(alive ? meal.note : '食材が足りないので今日は外れます')}</div>
        <div class="listing-badges">${meal.needs.map((need) => `<span class="badge ${active.includes(need) ? 'hit' : ''}">${escapeHtml(need)}</span>`).join('')}</div>
      </div>`;
    }).join('');
    setHeroStat(`${survivors.length}品`);
    setStatusCards([
      { label: '今ある食材', value: `${active.length}つ` },
      { label: '作れる候補', value: `${survivors.length}品` },
      { label: '外れた候補', value: `${model.meals.length - survivors.length}品` }
    ]);
    setResultLead(survivors.length ? '検索より先に候補が数枚へ減るので、今日作る物をその場で決められます。' : '食材が少なすぎるので、1つ戻すと候補が復活します。');
  }

  mountPresetButtons([{ label: '20分夕飯', action: () => { model = clone(presets['20分夕飯']); render(); } }]);
  state.helpers.runBriefSample = () => { model = clone(presets['20分夕飯']); render(); };
  render();
}

function setupCableMatch(root) {
  const presets = {
    '出張セット': {
      devices: [
        { key: 'ノートPC', active: true, needs: ['USB-C 65W', 'USB-C ケーブル'] },
        { key: 'スマホ', active: true, needs: ['USB-C ケーブル'] },
        { key: 'イヤホン', active: false, needs: ['USB-C ケーブル'] },
        { key: 'タブレット', active: false, needs: ['USB-C 30W', 'USB-C ケーブル'] }
      ],
      accessories: ['USB-C 65W', 'USB-C 30W', 'USB-C ケーブル', 'Lightning ケーブル', 'モバイルバッテリー']
    }
  };
  let model = clone(presets['出張セット']);

  root.querySelector('#briefInputZone').innerHTML = '<div class="filter-toolbar" id="deviceFilters"></div>';
  root.querySelector('#briefResultZone').innerHTML = `
    <div class="cut-board">
      <div class="item-grid" id="requiredAccessories"></div>
      <div class="overflow-list" id="extraAccessories"></div>
    </div>
  `;
  setResultHint('端末を切り替えるたび、今日持つ充電器だけが皿に残ります。');

  function render() {
    const activeDevices = model.devices.filter((item) => item.active);
    const required = [...new Set(activeDevices.flatMap((item) => item.needs))];
    const extras = model.accessories.filter((item) => !required.includes(item));
    byId('deviceFilters').innerHTML = model.devices.map((item, idx) => `
      <button class="tag-btn ${item.active ? 'active' : ''}" data-device-idx="${idx}">${escapeHtml(item.key)}</button>
    `).join('');
    byId('deviceFilters').querySelectorAll('[data-device-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        model.devices[Number(btn.dataset.deviceIdx)].active = !model.devices[Number(btn.dataset.deviceIdx)].active;
        render();
      });
    });
    byId('requiredAccessories').innerHTML = required.length
      ? required.map((item) => `<div class="item-card keep"><div class="item-title">${escapeHtml(item)}</div><div class="subline">今日の端末に必要です</div></div>`).join('')
      : '<div class="empty-state">端末を選ぶと必要な充電器が出ます。</div>';
    byId('extraAccessories').innerHTML = extras.length
      ? extras.map((item) => `<div class="overflow-pill"><strong>${escapeHtml(item)}</strong><div class="subline">今回は置いていけます</div></div>`).join('')
      : '<div class="empty-state">余計な充電器はありません。</div>';
    setHeroStat(`${required.length}点`);
    setStatusCards([
      { label: '持つ端末', value: `${activeDevices.length}台` },
      { label: '必要な充電器', value: `${required.length}点` },
      { label: '置いていく物', value: `${extras.length}点` }
    ]);
    setResultLead('必要な充電器と置いていく物が同時に見えるので、多めに詰めるより軽くまとまります。');
  }

  mountPresetButtons([{ label: '出張セット', action: () => { model = clone(presets['出張セット']); render(); } }]);
  state.helpers.runBriefSample = () => { model = clone(presets['出張セット']); render(); };
  render();
}

function setupDryRack(root) {
  const presets = {
    '洗濯直後': [
      { name: 'バスタオル', lane: 'now', slot: '広い列', note: '乾きにくい' },
      { name: 'シャツ', lane: 'now', slot: '中央', note: 'しわを伸ばしたい' },
      { name: '靴下', lane: 'now', slot: '小物列', note: '今なら入る' },
      { name: 'パーカー', lane: 'later', slot: '', note: '今日は待機' },
      { name: 'シーツ', lane: 'later', slot: '', note: '次の晴れ日に回す' }
    ]
  };
  let items = clone(presets['洗濯直後']);

  root.querySelector('#briefInputZone').innerHTML = '<div class="item-grid" id="dryControls"></div>';
  root.querySelector('#briefResultZone').innerHTML = `
    <div class="compartment-grid">
      <div class="compartment" id="dryWide"><strong>広い列</strong></div>
      <div class="compartment" id="dryCenter"><strong>中央</strong></div>
      <div class="compartment" id="drySmall"><strong>小物列</strong></div>
    </div>
    <div class="overflow-list" id="dryWaiting"></div>
  `;
  setResultHint('干し場に掛ける / 待たせるを切り替えると、今干せる一回分がすぐ見えます。');

  function render() {
    byId('dryControls').innerHTML = items.map((item, idx) => `
      <div class="item-card ${item.lane === 'now' ? 'keep' : 'cut'}">
        <div><div class="item-title">${escapeHtml(item.name)}</div><div class="subline">${escapeHtml(item.note)}</div></div>
        <button class="assign-btn" data-dry-idx="${idx}">${item.lane === 'now' ? '待たせる' : '今干す'}</button>
      </div>
    `).join('');
    root.querySelectorAll('[data-dry-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.dryIdx);
        items[idx].lane = items[idx].lane === 'now' ? 'later' : 'now';
        render();
      });
    });
    const now = items.filter((item) => item.lane === 'now');
    const renderSlot = (slot) => now.filter((item) => item.slot === slot).map((item) => `<div class="overflow-pill"><strong>${escapeHtml(item.name)}</strong><div class="subline">${escapeHtml(item.note)}</div></div>`).join('') || '<div class="empty-state">まだ空いています。</div>';
    byId('dryWide').innerHTML = '<strong>広い列</strong>' + renderSlot('広い列');
    byId('dryCenter').innerHTML = '<strong>中央</strong>' + renderSlot('中央');
    byId('drySmall').innerHTML = '<strong>小物列</strong>' + renderSlot('小物列');
    const later = items.filter((item) => item.lane !== 'now');
    byId('dryWaiting').innerHTML = later.length ? later.map((item) => `<div class="overflow-pill"><strong>${escapeHtml(item.name)}</strong><div class="subline">${escapeHtml(item.note)}</div></div>`).join('') : '<div class="empty-state">待ち列はありません。</div>';
    setHeroStat(`${now.length}点`);
    setStatusCards([
      { label: '今干す物', value: `${now.length}点` },
      { label: '待つ物', value: `${later.length}点` },
      { label: '干し場', value: '3列' }
    ]);
    setResultLead('干し場に乗る分と待つ分が分かれるので、適当に重ねるより早く順番が決まります。');
  }

  mountPresetButtons([{ label: '洗濯直後', action: () => { items = clone(presets['洗濯直後']); render(); } }]);
  state.helpers.runBriefSample = () => { items = clone(presets['洗濯直後']); render(); };
  render();
}

function setupReturnBox(root) {
  const presets = {
    '期限が近い順': [
      { name: 'スニーカー', lane: 'now', deadline: '明日', note: 'サイズ交換' },
      { name: 'シャツ', lane: 'now', deadline: '2日後', note: '色が違った' },
      { name: 'スマホケース', lane: 'later', deadline: '5日後', note: '週末に持ち込む' },
      { name: 'ライト', lane: 'later', deadline: '1週間後', note: 'まだ迷っている' }
    ]
  };
  let items = clone(presets['期限が近い順']);

  root.querySelector('#briefInputZone').innerHTML = '<div class="item-grid" id="returnControls"></div>';
  root.querySelector('#briefResultZone').innerHTML = `
    <div class="cut-board">
      <div class="item-grid" id="returnNowBox"></div>
      <div class="overflow-list" id="returnLater"></div>
    </div>
  `;
  setResultHint('箱へ入れる / 後回しを切り替えると、今夜返す一箱分だけが残ります。');

  function render() {
    byId('returnControls').innerHTML = items.map((item, idx) => `
      <div class="item-card ${item.lane === 'now' ? 'keep' : 'cut'}">
        <div><div class="item-title">${escapeHtml(item.name)}</div><div class="subline">期限 ${escapeHtml(item.deadline)} / ${escapeHtml(item.note)}</div></div>
        <button class="assign-btn" data-return-idx="${idx}">${item.lane === 'now' ? '後回し' : '今返す箱へ'}</button>
      </div>
    `).join('');
    root.querySelectorAll('[data-return-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.returnIdx);
        items[idx].lane = items[idx].lane === 'now' ? 'later' : 'now';
        render();
      });
    });
    const now = items.filter((item) => item.lane === 'now');
    const later = items.filter((item) => item.lane !== 'now');
    byId('returnNowBox').innerHTML = now.length
      ? now.map((item) => `<div class="item-card keep"><div class="item-title">${escapeHtml(item.name)}</div><div class="subline">期限 ${escapeHtml(item.deadline)} / ${escapeHtml(item.note)}</div></div>`).join('')
      : '<div class="empty-state">今返す物を箱に入れると、ここにまとまります。</div>';
    byId('returnLater').innerHTML = later.length
      ? later.map((item) => `<div class="overflow-pill"><strong>${escapeHtml(item.name)}</strong><div class="subline">期限 ${escapeHtml(item.deadline)}</div></div>`).join('')
      : '<div class="empty-state">後回し候補はありません。</div>';
    setHeroStat(`${now.length}点`);
    setStatusCards([
      { label: '今返す物', value: `${now.length}点` },
      { label: '後回し', value: `${later.length}点` },
      { label: '最短期限', value: now[0] ? now[0].deadline : '未選択' }
    ]);
    setResultLead('期限ラベルつきで今返す物がまとまるので、玄関に積むより判断が速く進みます。');
  }

  mountPresetButtons([{ label: '期限が近い順', action: () => { items = clone(presets['期限が近い順']); render(); } }]);
  state.helpers.runBriefSample = () => { items = clone(presets['期限が近い順']); render(); };
  render();
}

function setupPhotoPurge(root) {
  const presets = {
    '旅行写真': [
      { name: '海-1', lane: 'keep', note: '表情がいちばん良い' },
      { name: '海-2', lane: 'drop', note: '少しブレている' },
      { name: '夕日-1', lane: 'keep', note: '色が残っている' },
      { name: '夕日-2', lane: 'drop', note: '同じ構図' },
      { name: '集合-1', lane: 'drop', note: '目線がずれている' }
    ]
  };
  let items = clone(presets['旅行写真']);

  root.querySelector('#briefInputZone').innerHTML = '<div class="item-grid" id="photoControls"></div>';
  root.querySelector('#briefResultZone').innerHTML = `
    <div class="cut-board">
      <div class="listing-grid" id="photoKeep"></div>
      <div class="overflow-list" id="photoDrop"></div>
    </div>
  `;
  setResultHint('残す / 削除候補を切り替えるたび、壁がすっきりしていきます。');

  function render() {
    byId('photoControls').innerHTML = items.map((item, idx) => `
      <div class="item-card ${item.lane === 'keep' ? 'keep' : 'cut'}">
        <div><div class="item-title">${escapeHtml(item.name)}</div><div class="subline">${escapeHtml(item.note)}</div></div>
        <div class="pill-row">
          <button class="assign-btn" data-photo-idx="${idx}" data-lane="keep">残す</button>
          <button class="assign-btn" data-photo-idx="${idx}" data-lane="drop">削除候補</button>
        </div>
      </div>
    `).join('');
    root.querySelectorAll('[data-photo-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        items[Number(btn.dataset.photoIdx)].lane = btn.dataset.lane;
        render();
      });
    });
    const keep = items.filter((item) => item.lane === 'keep');
    const drop = items.filter((item) => item.lane !== 'keep');
    byId('photoKeep').innerHTML = keep.length
      ? keep.map((item) => `<div class="listing-card"><div class="listing-title">${escapeHtml(item.name)}</div><div class="subline">${escapeHtml(item.note)}</div></div>`).join('')
      : '<div class="empty-state">残す写真を選ぶと、ここに残ります。</div>';
    byId('photoDrop').innerHTML = drop.length
      ? drop.map((item) => `<div class="overflow-pill"><strong>${escapeHtml(item.name)}</strong><div class="subline">${escapeHtml(item.note)}</div></div>`).join('')
      : '<div class="empty-state">削除候補はありません。</div>';
    setHeroStat(`${keep.length}枚`);
    setStatusCards([
      { label: '残す写真', value: `${keep.length}枚` },
      { label: '削除候補', value: `${drop.length}枚` },
      { label: '整理進捗', value: `${Math.round((keep.length / items.length) * 100)}%` }
    ]);
    setResultLead('残す壁と削除候補が分かれるので、一覧を眺めるだけの整理より前に進みやすくなります。');
  }

  mountPresetButtons([{ label: '旅行写真', action: () => { items = clone(presets['旅行写真']); render(); } }]);
  state.helpers.runBriefSample = () => { items = clone(presets['旅行写真']); render(); };
  render();
}

function setupTrashDay(root) {
  const presets = {
    '前夜の分別': [
      { name: '牛乳パック', lane: 'next', note: '資源回収日' },
      { name: '生ごみ袋', lane: 'tomorrow', note: '可燃で出せる' },
      { name: '段ボール', lane: 'next', note: '次回の資源日' },
      { name: '壊れた傘', lane: 'bulky', note: '粗大で確認' }
    ]
  };
  let items = clone(presets['前夜の分別']);

  root.querySelector('#briefInputZone').innerHTML = '<div class="item-grid" id="trashControls"></div>';
  root.querySelector('#briefResultZone').innerHTML = `
    <div class="compartment-grid">
      <div class="compartment" id="trashTomorrow"><strong>明日出す</strong></div>
      <div class="compartment" id="trashNext"><strong>次回</strong></div>
      <div class="compartment" id="trashBulky"><strong>粗大 / 要確認</strong></div>
    </div>
  `;
  setResultHint('出し先の列を切り替えるたび、明日出す物だけが先にまとまります。');

  function render() {
    byId('trashControls').innerHTML = items.map((item, idx) => `
      <div class="item-card ${item.lane === 'tomorrow' ? 'keep' : 'cut'}">
        <div><div class="item-title">${escapeHtml(item.name)}</div><div class="subline">${escapeHtml(item.note)}</div></div>
        <div class="pill-row">
          <button class="assign-btn" data-trash-idx="${idx}" data-lane="tomorrow">明日</button>
          <button class="assign-btn" data-trash-idx="${idx}" data-lane="next">次回</button>
          <button class="assign-btn" data-trash-idx="${idx}" data-lane="bulky">粗大</button>
        </div>
      </div>
    `).join('');
    root.querySelectorAll('[data-trash-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        items[Number(btn.dataset.trashIdx)].lane = btn.dataset.lane;
        render();
      });
    });
    const laneHtml = (lane) => items.filter((item) => item.lane === lane)
      .map((item) => `<div class="overflow-pill"><strong>${escapeHtml(item.name)}</strong><div class="subline">${escapeHtml(item.note)}</div></div>`)
      .join('') || '<div class="empty-state">まだありません。</div>';
    byId('trashTomorrow').innerHTML = '<strong>明日出す</strong>' + laneHtml('tomorrow');
    byId('trashNext').innerHTML = '<strong>次回</strong>' + laneHtml('next');
    byId('trashBulky').innerHTML = '<strong>粗大 / 要確認</strong>' + laneHtml('bulky');
    setHeroStat(`${items.filter((item) => item.lane === 'tomorrow').length}点`);
    setStatusCards([
      { label: '明日出す', value: `${items.filter((item) => item.lane === 'tomorrow').length}点` },
      { label: '次回', value: `${items.filter((item) => item.lane === 'next').length}点` },
      { label: '要確認', value: `${items.filter((item) => item.lane === 'bulky').length}点` }
    ]);
    setResultLead('明日出す列だけが先に埋まるので、自治体サイトを見続けるより前夜の準備が早く終わります。');
  }

  mountPresetButtons([{ label: '前夜の分別', action: () => { items = clone(presets['前夜の分別']); render(); } }]);
  state.helpers.runBriefSample = () => { items = clone(presets['前夜の分別']); render(); };
  render();
}

function setupDeskCheckout(root) {
  const presets = {
    '退勤前': [
      { name: 'ノートPC', lane: 'take', note: '家でも作業あり' },
      { name: '充電器', lane: 'take', note: '家で必要' },
      { name: '文房具', lane: 'leave', note: '机に置く' },
      { name: '資料ファイル', lane: 'leave', note: '明日また使う' }
    ]
  };
  let items = clone(presets['退勤前']);

  root.querySelector('#briefInputZone').innerHTML = '<div class="item-grid" id="deskControls"></div>';
  root.querySelector('#briefResultZone').innerHTML = `
    <div class="request-cards">
      <div class="request-card" id="deskTake"><strong>持ち帰る</strong></div>
      <div class="request-card" id="deskLeave"><strong>机に残す</strong></div>
    </div>
  `;
  setResultHint('持ち帰る / 机に残すを切り替えると、今夜必要な物だけがまとまります。');

  function render() {
    byId('deskControls').innerHTML = items.map((item, idx) => `
      <div class="item-card ${item.lane === 'take' ? 'keep' : 'cut'}">
        <div><div class="item-title">${escapeHtml(item.name)}</div><div class="subline">${escapeHtml(item.note)}</div></div>
        <div class="pill-row">
          <button class="assign-btn" data-desk-idx="${idx}" data-lane="take">持ち帰る</button>
          <button class="assign-btn" data-desk-idx="${idx}" data-lane="leave">机に置く</button>
        </div>
      </div>
    `).join('');
    root.querySelectorAll('[data-desk-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        items[Number(btn.dataset.deskIdx)].lane = btn.dataset.lane;
        render();
      });
    });
    const laneHtml = (lane) => items.filter((item) => item.lane === lane)
      .map((item) => `<div class="overflow-pill"><strong>${escapeHtml(item.name)}</strong><div class="subline">${escapeHtml(item.note)}</div></div>`)
      .join('') || '<div class="empty-state">まだありません。</div>';
    byId('deskTake').innerHTML = '<strong>持ち帰る</strong>' + laneHtml('take');
    byId('deskLeave').innerHTML = '<strong>机に残す</strong>' + laneHtml('leave');
    setHeroStat(`${items.filter((item) => item.lane === 'take').length}点`);
    setStatusCards([
      { label: '持ち帰る', value: `${items.filter((item) => item.lane === 'take').length}点` },
      { label: '残す', value: `${items.filter((item) => item.lane === 'leave').length}点` },
      { label: '机上整理', value: '完了前' }
    ]);
    setResultLead('今夜必要な物だけがトレイに残るので、全部入れて帰るより軽く終わります。');
  }

  mountPresetButtons([{ label: '退勤前', action: () => { items = clone(presets['退勤前']); render(); } }]);
  state.helpers.runBriefSample = () => { items = clone(presets['退勤前']); render(); };
  render();
}

function setupToneBalance(root) {
  const presets = {
    '仕事の依頼を断る': {
      scene: '今週は手がいっぱいです',
      tones: [
        { label: 'やわらかめ', text: '今回は難しいのですが、別日なら相談できます。' },
        { label: 'ちょうどよい', text: '今週は難しいので、今回は見送らせてください。' },
        { label: 'はっきりめ', text: '今回は対応できないため、お受けできません。' }
      ]
    }
  };
  let model = clone(presets['仕事の依頼を断る']);
  let tone = 2;

  root.querySelector('#briefInputZone').innerHTML = `
    <div class="brief-form">
      <div class="mini-note">${escapeHtml(model.scene)}</div>
      <label>強さ <input id="toneRange" type="range" min="1" max="3" value="${tone}"></label>
    </div>
  `;
  root.querySelector('#briefResultZone').innerHTML = '<div class="listing-grid" id="toneCards"></div>';
  setResultHint('つまみを動かすと、送れそうな言い回しが中央に寄ってきます。');

  function render() {
    const activeIdx = tone - 1;
    byId('toneCards').innerHTML = model.tones.map((item, idx) => `
      <div class="listing-card ${idx === activeIdx ? '' : 'dead'}">
        <div class="listing-title">${escapeHtml(item.label)}</div>
        <div class="subline">${escapeHtml(item.text)}</div>
      </div>
    `).join('');
    setHeroStat(model.tones[activeIdx].label);
    setStatusCards([
      { label: 'いまの温度', value: model.tones[activeIdx].label },
      { label: '比較候補', value: `${model.tones.length}枚` },
      { label: '送れそう度', value: activeIdx === 1 ? '高い' : '調整中' }
    ]);
    setResultLead('強さを動かすと候補カードが入れ替わるので、検索より先にちょうどよい温度が見つかります。');
  }

  byId('toneRange').addEventListener('input', (e) => {
    tone = Number(e.target.value);
    render();
  });
  mountPresetButtons([{ label: '仕事の依頼を断る', action: () => { model = clone(presets['仕事の依頼を断る']); tone = 2; byId('toneRange').value = '2'; render(); } }]);
  state.helpers.runBriefSample = () => { model = clone(presets['仕事の依頼を断る']); tone = 2; byId('toneRange').value = '2'; render(); };
  render();
}

function setupFallback() {
  const root = byId('briefCanvas') || byId('app');
  if (!root) return;
  root.innerHTML = `
    <section class="brief-card">
      <div class="tool-chip">${escapeHtml(PROFILE.display_name_ja || PROFILE.title || '')}</div>
      <h2>${escapeHtml(PROFILE.input_panel_title || '入力を整える')}</h2>
      <div class="brief-form">
        <textarea id="fallbackNoteInput" class="text-input" rows="5" placeholder="${escapeHtml(PROFILE.how_it_works_line_ja || '入力の内容を整理します。')}"></textarea>
        <div class="action-row">
          <button id="fallbackPrimaryBtn" class="primary-btn">${escapeHtml(PROFILE.main_cta || 'サンプルで試す')}</button>
          <button id="fallbackAltBtn" class="secondary-btn">別の切り口を見る</button>
        </div>
      </div>
    </section>
    <section class="result-card">
      <div class="hero-head">
        <div>
          <div class="tool-chip tool-chip--soft">${escapeHtml(PROFILE.hero_panel_label || '結果の見どころ')}</div>
          <h2>${escapeHtml(PROFILE.output_label || 'ここを見ればOKです')}</h2>
          <p id="fallbackLead">${escapeHtml(PROFILE.use_case_line_ja || '変化した結果がここに出ます。')}</p>
        </div>
        <div class="hero-kpi"><span>いまの主役</span><strong id="fallbackHero">未入力</strong></div>
      </div>
      <div class="status-strip" id="fallbackStatus"></div>
      <div class="item-grid" id="fallbackCards"></div>
    </section>
  `;

  function renderFallback(inputText, mode) {
    const text = (inputText || '').trim();
    const cards = [
      { label: '要約', value: text ? `${text.slice(0, 18)}${text.length > 18 ? '…' : ''}` : 'まだ入力なし' },
      { label: '次の動き', value: mode === 'alt' ? '別の切り口で見る' : 'まず主語をそろえる' },
      { label: '見せ方', value: PROFILE.result_presentation_style || 'stacked_result_cards' }
    ];
    byId('fallbackCards').innerHTML = cards.map((card) => `
      <div class="item-card keep">
        <div class="item-title">${escapeHtml(card.label)}</div>
        <div class="subline">${escapeHtml(card.value)}</div>
      </div>
    `).join('');
    byId('fallbackStatus').innerHTML = `
      <div class="status-chip"><span>layout</span><strong>${escapeHtml(PROFILE.primary_layout || 'workbench')}</strong></div>
      <div class="status-chip"><span>model</span><strong>${escapeHtml(PROFILE.interaction_model || 'structured')}</strong></div>
      <div class="status-chip"><span>motif</span><strong>${escapeHtml(PROFILE.palette_motif || 'neutral')}</strong></div>
    `;
    byId('fallbackHero').textContent = text ? `${text.length}字` : '未入力';
    byId('fallbackLead').textContent = text ? '構造化した結果カードで見せます。' : 'サンプルを入れると、そのまま結果カードが出ます。';
  }

  byId('fallbackPrimaryBtn')?.addEventListener('click', () => {
    byId('fallbackNoteInput').value = byId('fallbackNoteInput').value || 'サンプル入力を構造化する';
    renderFallback(byId('fallbackNoteInput').value, 'primary');
  });
  byId('fallbackAltBtn')?.addEventListener('click', () => {
    byId('fallbackNoteInput').value = byId('fallbackNoteInput').value || '別の切り口も見たい';
    renderFallback(byId('fallbackNoteInput').value, 'alt');
  });
  state.helpers.runBriefSample = () => {
    byId('fallbackNoteInput').value = 'サンプル入力を構造化する';
    renderFallback(byId('fallbackNoteInput').value, 'primary');
  };
  renderFallback('', 'primary');
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
