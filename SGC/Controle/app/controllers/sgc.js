
// Verifica se já existe um nome salvo
let nome = localStorage.getItem("nome");

// Se não existir, pergunta ao usuário
if (!nome) {
  nome = prompt("Qual é o seu nome?");

  if (nome && nome.trim() !== "") {
    // Salva no localStorage
    localStorage.setItem("nome", nome);
    alert("Olá " + nome + ". Muito prazer");
  }
}

// Pega o nome salvo
const nomeSalvo = localStorage.getItem("nome");

// Exibe no HTML
if (nomeSalvo) {
  document.getElementById("usuario").textContent = nomeSalvo;
}

// --- Avatar ---
const avatar = document.getElementById("avatar");

if (nome) {
  const primeiraLetra = nome.trim().charAt(0).toUpperCase();
  avatar.textContent = primeiraLetra;
}

// Ensure STORAGE_KEY is defined for legacy functions
const STORAGE_KEY = 'chamados_db_v1';
const SETTINGS_KEY = 'chamados_settings_v1';

document.addEventListener('DOMContentLoaded', () => {
  // inicializa máscaras e eventos
  document.getElementById('valor').addEventListener('input', onValorInput);
  document.getElementById('cnpj').addEventListener('input', onCnpjInput);
  // Removido event listener duplicado de busca - agora está em setupEventListeners()

  // UI controls
  document.getElementById('toggle-filters').addEventListener('click', () => {
    const p = document.getElementById('filters-panel');
    p.style.display = p.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('toggle-sidebar').addEventListener('click', toggleSidebar);
  document.getElementById('toggle-theme').addEventListener('click', toggleTheme);

  // persistent settings (sidebar collapsed, theme)
  applySavedSettings();

  // load stats & list
  loadStats();
  showList();
});

// ---------- storage helpers ----------
function readDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler localStorage', e);
    return [];
  }
}
function writeDB(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  loadStats();
  // if dashboard is visible, refresh dashboard charts
  try {
    const dash = document.getElementById('dashboard-screen');
    if (dash && dash.style.display !== 'none') loadDashboardStats();
  } catch (e) {/* ignore */ }
}

// settings
function readSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch (e) { return {}; }
}
function writeSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// ---------- UI navigation ----------
function showForm() {
  document.getElementById('list-screen').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'none';
  const chartsWrap1 = document.getElementById('dashboard-charts'); if (chartsWrap1) chartsWrap1.style.display = 'none';
  const cnpjScreen = document.getElementById('table-cnpj-screen'); if (cnpjScreen) cnpjScreen.style.display = 'none';
  document.getElementById('form-screen').style.display = 'block';
  document.getElementById('btn-new').classList.add('active');
  document.getElementById('btn-list').classList.remove('active');
  document.getElementById('btn-dashboard').classList.remove('active');
  const btnCnpj = document.getElementById('btn-table-cnpj'); if (btnCnpj) btnCnpj.classList.remove('active');
  document.getElementById('form-title').textContent = document.getElementById('editingId').value ? 'Editar Chamado' : 'Novo Chamado';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showList() {
  // Reset list title and show table of non-deleted by default
  document.getElementById('form-screen').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'none';
  const chartsWrap2 = document.getElementById('dashboard-charts'); if (chartsWrap2) chartsWrap2.style.display = 'none';
  const cnpjScreen = document.getElementById('table-cnpj-screen'); if (cnpjScreen) cnpjScreen.style.display = 'none';
  document.getElementById('list-screen').style.display = 'block';
  document.getElementById('btn-list').classList.add('active');
  document.getElementById('btn-new').classList.remove('active');
  document.getElementById('btn-dashboard').classList.remove('active');
  const btnCnpj = document.getElementById('btn-table-cnpj'); if (btnCnpj) btnCnpj.classList.remove('active');

  document.getElementById('list-title').textContent = 'Lista de Chamados';
  document.getElementById('list-sub').textContent = 'Visualize todos os chamados cadastrados. Use os botões da última coluna para editar, excluir ou enviar para a lixeira.';

  loadTable();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showDashboard() {
  document.getElementById('form-screen').style.display = 'none';
  document.getElementById('list-screen').style.display = 'none';
  const cnpjScreen = document.getElementById('table-cnpj-screen'); if (cnpjScreen) cnpjScreen.style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'block';
  const chartsWrap = document.getElementById('dashboard-charts'); if (chartsWrap) chartsWrap.style.display = 'flex';
  document.getElementById('btn-dashboard').classList.add('active');
  document.getElementById('btn-list').classList.remove('active');
  document.getElementById('btn-new').classList.remove('active');
  const btnCnpj = document.getElementById('btn-table-cnpj'); if (btnCnpj) btnCnpj.classList.remove('active');

  loadDashboardStats();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showTrash() {
  // show list but filter only deleted
  document.getElementById('form-screen').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'none';
  const chartsWrap3 = document.getElementById('dashboard-charts'); if (chartsWrap3) chartsWrap3.style.display = 'none';
  const cnpjScreen = document.getElementById('table-cnpj-screen'); if (cnpjScreen) cnpjScreen.style.display = 'none';
  document.getElementById('list-screen').style.display = 'block';
  document.getElementById('btn-trash').classList.add('active');
  // remove highlight from other buttons
  ['btn-list', 'btn-new', 'btn-dashboard', 'btn-table-cnpj'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('active'); });

  document.getElementById('list-title').textContent = 'Lixeira';
  document.getElementById('list-sub').textContent = 'Chamados excluídos. Você pode restaurar ou excluir definitivamente.';
  loadTable({ onlyTrash: true });
}

// ---------- Save / Edit (with soft delete) ----------
function saveChamado() {
  const db = readDB();
  const id = document.getElementById('editingId').value || generateId();

  // coleta campos
  const situacao = document.getElementById('situacao').value.trim();
  const numero = document.getElementById('numero').value.trim();
  const dataEmissao = document.getElementById('dataEmissao').value;
  const pedido = document.getElementById('pedido').value.trim();
  const notaFiscal = document.getElementById('notaFiscal').value.trim();
  const vencimento = document.getElementById('vencimento').value;
  const valor = parseCurrencyToNumber(document.getElementById('valor').value);
  const forma = document.getElementById('forma').value;
  const razao = document.getElementById('razao').value.trim();
  const cnpj = document.getElementById('cnpj').value.trim();
  const obs = document.getElementById('obs').value.trim();
  const requisitante = document.getElementById('requisitante').value.trim();

  // validações simples
  clearValidation();
  const required = [
    { val: situacao, el: 'situacao' },
    { val: numero, el: 'numero' },
    { val: dataEmissao, el: 'dataEmissao' },
    { val: !isNaN(valor) && valor >= 0, el: 'valor' },
    { val: requisitante, el: 'requisitante' }
  ];
  const invalid = required.filter(r => !r.val);
  if (invalid.length) {
    invalid.forEach(i => document.getElementById(i.el).classList.add('input-error'));
    showToast('Preencha os campos obrigatórios.', true);
    return;
  }

  const record = {
    id, situacao, numero, dataEmissao, pedido, notaFiscal, vencimento, valor, forma, razao, cnpj, obs, requisitante,
    deleted: false,
    deletedAt: null,
    updatedAt: new Date().toISOString()
  };

  const existingIndex = db.findIndex(r => r.id === id);
  if (existingIndex >= 0) {
    // preserve deleted flag if editing a trashed item
    record.deleted = db[existingIndex].deleted || false;
    record.deletedAt = db[existingIndex].deletedAt || null;
    db[existingIndex] = record;
    showToast('Chamado atualizado.');
  } else {
    db.unshift(record); // adiciona no topo
    showToast('Chamado salvo.');
  }
  writeDB(db);

  // após salvar: abrir a lista imediatamente e atualizar tabela
  resetForm();
  showList(); // showList chama loadTable()
}

// ---------- Load table (with filters & trash) ----------
function loadTable(opts = {}) {
  // opts: {onlyTrash: boolean} (explicit)
  const db = readDB();
  const tbody = document.getElementById('tickets-tbody');
  tbody.innerHTML = '';

  // filters
  const q = document.getElementById('global-search').value.trim().toLowerCase();
  const statusFilter = document.getElementById('filter-status') ? document.getElementById('filter-status').value : '';
  const dateFrom = document.getElementById('filter-date-from') ? document.getElementById('filter-date-from').value : '';
  const dateTo = document.getElementById('filter-date-to') ? document.getElementById('filter-date-to').value : '';
  const onlyOverdue = document.getElementById('filter-only-overdue') ? document.getElementById('filter-only-overdue').checked : false;
  const includeDeleted = document.getElementById('filter-include-trash') ? document.getElementById('filter-include-trash').checked : false;

  // if showTrash explicitly, force only deleted
  const showingTrash = opts.onlyTrash === true || document.getElementById('list-title').textContent === 'Lixeira';

  let rows = db.filter(r => {
    // default: exclude deleted unless includeDeleted or viewing trash
    if (showingTrash) {
      if (!r.deleted) return false;
    } else {
      if (r.deleted && !includeDeleted) return false;
      // Exclude CNPJ records from main list
      if (r.type === 'cnpj_record') return false;
    }

    // text search - busca em TODOS os campos
    if (q) {
      const textMatch = (r.numero || '').toLowerCase().includes(q)
        || (r.requisitante || '').toLowerCase().includes(q)
        || (r.razao || '').toLowerCase().includes(q)
        || (r.cnpj || '').toLowerCase().includes(q)
        || (r.situacao || '').toLowerCase().includes(q)
        || (r.pedido || '').toLowerCase().includes(q)
        || (r.notaFiscal || '').toLowerCase().includes(q)
        || (r.forma || '').toLowerCase().includes(q)
        || (r.obs || '').toLowerCase().includes(q)
        || formatCurrency(r.valor).toLowerCase().includes(q)
        || formatDate(r.dataEmissao).toLowerCase().includes(q)
        || formatDate(r.vencimento).toLowerCase().includes(q);
      if (!textMatch) return false;
    }

    // status filter
    if (statusFilter && String(r.situacao || '') !== statusFilter) return false;

    // date range filter (use dataEmissao)
    if (dateFrom) {
      const from = new Date(dateFrom);
      const d = r.dataEmissao ? new Date(r.dataEmissao) : null;
      if (!d || d < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      const d = r.dataEmissao ? new Date(r.dataEmissao) : null;
      if (!d || d > to) return false;
    }

    // only overdue
    if (onlyOverdue) {
      if (!r.vencimento) return false;
      const v = new Date(r.vencimento);
      const today = new Date();
      if (!(v < new Date(today.getFullYear(), today.getMonth(), today.getDate()))) return false;
    }

    return true;
  });

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13" class="muted small" style="padding:16px">Nenhum chamado encontrado.</td></tr>`;
    return;
  }

  // monta linhas com aviso de vencimento e ações diferentes para trash vs normal
  for (const r of rows) {
    const tr = document.createElement('tr');

    // compute due status
    let dueClass = '';
    let dueLabel = '';
    if (r.vencimento) {
      const v = new Date(r.vencimento);
      const today = new Date();
      const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffMs = v - todayZero;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        dueClass = 'badge-due';
        dueLabel = ' (vencido)';
      } else if (diffDays <= 3) {
        dueClass = 'badge-warning';
        dueLabel = ` (vence em ${diffDays}d)`;
      }
    }

    // actions: if deleted show restore + delete forever; else show edit + trash
    let actionsHtml = '';
    if (r.deleted) {
      actionsHtml = `
        <button class="icon-btn" title="Restaurar" onclick="restoreChamado('${r.id}')">${iconRestore()}</button>
        <button class="icon-btn" title="Excluir Definitivo" onclick="permanentDelete('${r.id}')">${iconDelete()}</button>
      `;
    } else {
      actionsHtml = `
        <button class="icon-btn" title="Editar" onclick="editChamado('${r.id}')">${iconEdit()}</button>
        <button class="icon-btn" title="Enviar para Lixeira" onclick="softDelete('${r.id}')">${iconTrash()}</button>
      `;
    }

    tr.innerHTML = `
      <td><span class="chip">${escapeHtml(r.situacao)}</span></td>
      <td>${escapeHtml(r.numero)}</td>
      <td>${formatDate(r.dataEmissao)}</td>
      <td>${escapeHtml(r.pedido || '')}</td>
      <td>${escapeHtml(r.notaFiscal || '')}</td>
      <td>${formatDate(r.vencimento)} ${dueLabel ? `<span class="${dueClass}">${dueLabel}</span>` : ''}</td>
      <td>${formatCurrency(r.valor)}</td>
      <td>${escapeHtml(r.forma || '')}</td>
      <td>${escapeHtml(r.razao || '')}</td>
      <td>${escapeHtml(r.cnpj || '')}</td>
      <td>${escapeHtml(r.requisitante || '')}</td>
      <td class="small">${truncate(escapeHtml(r.obs || ''), 80)}</td>
      <td class="actions-cell">${actionsHtml}</td>
    `;
    tbody.appendChild(tr);
  }

  // update stats after table load (to ensure counts consider deleted)
  loadStats();
}

// ---------- Edit ----------
function editChamado(id) {
  const db = readDB();
  const rec = db.find(r => r.id === id);
  if (!rec) return showToast('Registro não encontrado.', true);
  document.getElementById('editingId').value = rec.id;
  document.getElementById('situacao').value = rec.situacao || '';
  document.getElementById('numero').value = rec.numero || '';
  document.getElementById('dataEmissao').value = rec.dataEmissao || '';
  document.getElementById('pedido').value = rec.pedido || '';
  document.getElementById('notaFiscal').value = rec.notaFiscal || '';
  document.getElementById('vencimento').value = rec.vencimento || '';
  document.getElementById('valor').value = formatCurrencyInput(rec.valor);
  document.getElementById('forma').value = rec.forma || '';
  document.getElementById('razao').value = rec.razao || '';
  document.getElementById('cnpj').value = rec.cnpj || '';
  document.getElementById('obs').value = rec.obs || '';
  document.getElementById('requisitante').value = rec.requisitante || '';
  showForm();
}

// ---------- soft delete (send to trash), restore, permanent delete ----------
function softDelete(id) {
  if (!confirm('Enviar este chamado para a Lixeira?')) return;
  const db = readDB();
  const idx = db.findIndex(r => r.id === id);
  if (idx >= 0) {
    db[idx].deleted = true;
    db[idx].deletedAt = new Date().toISOString();
    writeDB(db);
    loadTable();
    showToast('Chamado enviado para a lixeira.');
  } else showToast('Registro não encontrado.', true);
}

function restoreChamado(id) {
  const db = readDB();
  const idx = db.findIndex(r => r.id === id);
  if (idx >= 0) {
    db[idx].deleted = false;
    db[idx].deletedAt = null;
    writeDB(db);
    loadTable();
    showToast('Chamado restaurado.');
  } else showToast('Registro não encontrado.', true);
}

function permanentDelete(id) {
  if (!confirm('Excluir definitivamente? Esta ação NÃO pode ser desfeita.')) return;
  const db = readDB();
  const idx = db.findIndex(r => r.id === id);
  if (idx >= 0) {
    db.splice(idx, 1);
    writeDB(db);
    loadTable();
    showToast('Chamado excluído definitivamente.');
  } else showToast('Registro não encontrado.', true);
}

// ---------- Utilities ----------
function generateId() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}
function formatDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('pt-BR'); } catch (e) { return iso; }
}
function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return '';
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatCurrencyInput(val) {
  if (val === null || val === undefined || val === '') return '';
  const n = Number(val);
  if (isNaN(n)) return '';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function parseCurrencyToNumber(str) {
  if (str === null || str === undefined) return NaN;
  const cleaned = String(str).replace(/\./g, '').replace(/,/g, '.').replace(/[^\d\.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? NaN : num;
}
function escapeHtml(text) {
  if (!text && text !== 0) return '';
  return String(text).replace(/[&<>"']/g, function (m) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]);
  });
}
function truncate(text, len) {
  if (!text) return '';
  if (text.length <= len) return text;
  return text.slice(0, len - 1) + '…';
}

/* icons used in JS-rendered HTML */
function iconEdit() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 21l3-1 11-11 2 2-11 11-1 3-4-4z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
function iconDelete() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6M10 6V4h4v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
function iconTrash() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6v-2h8v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M6 6l1 14h10l1-14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`; }
function iconRestore() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 11-2.2-5.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M21 3v6h-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`; }
function iconThemeLight() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 7a5 5 0 100 10 5 5 0 000-10z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
function iconThemeDark() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
function iconToggleCollapsed() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 6v12M16 6l-4 6 4 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }

/* toast */
let toastTimer = null;
function showToast(msg = 'Salvo', isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  t.style.borderLeftColor = isError ? 'var(--danger)' : 'var(--success)';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.style.display = 'none', 3000);
}

/* form helpers */
function resetForm() {
  document.getElementById('chamado-form').reset();
  document.getElementById('editingId').value = '';
  clearValidation();
  document.getElementById('valor').value = '';
  document.getElementById('cnpj').value = '';
  document.getElementById('form-title').textContent = 'Novo Chamado';
}

/* validation clear */
function clearValidation() {
  const els = document.querySelectorAll('.input-error');
  els.forEach(e => e.classList.remove('input-error'));
}

/* stats */
function loadStats() {
  // kept for backward compatibility; currently dashboard charts
  // are refreshed from writeDB when visible, and when opening dashboard.
}

function loadDashboardStats() {
  const db = readDB();
  // Filter base: not deleted AND not cnpj_record
  const validTickets = db.filter(r => !r.deleted && r.type !== 'cnpj_record');

  const total = validTickets.length;
  const open = validTickets.filter(r => ((r.situacao || '').toLowerCase().includes('aberto') || (r.situacao || '').toLowerCase().includes('andamento'))).length;
  const escriturar = validTickets.filter(r => (r.situacao || '').toLowerCase().includes('escriturar')).length;
  const solucionado = validTickets.filter(r => (r.situacao || '').toLowerCase().includes('solucionad')).length;
  const overdue = validTickets.filter(r => {
    if (!r.vencimento) return false;
    const v = new Date(r.vencimento);
    const now = new Date();
    return v < new Date(now.getFullYear(), now.getMonth(), now.getDate()) && (r.situacao || '').toLowerCase() !== 'concluído';
  }).length;

  if (document.getElementById('dashboard-stat-total')) {
    document.getElementById('dashboard-stat-total').textContent = total;
  }
  if (document.getElementById('dashboard-stat-open')) {
    document.getElementById('dashboard-stat-open').textContent = open;
  }
  if (document.getElementById('dashboard-stat-overdue')) {
    document.getElementById('dashboard-stat-overdue').textContent = overdue;
  }

  // render donut charts
  renderDonutChart('chart-escriturar', escriturar, total, 'Escriturar', '#7c3aed', '#a78bfa');
  renderDonutChart('chart-solucionado', solucionado, total, 'Solucionado', '#06b6d4', '#14b8a6');
  renderDonutChart('chart-open', open, total, 'Em Aberto', '#2563eb', '#60a5fa');
}

// render simple SVG donut chart into a container
function renderDonutChart(containerId, value, total, label, colorStart, colorEnd) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const size = 140;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const remaining = c - dash;
  el.innerHTML = `
    <div class="donut-inner">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <defs>
          <linearGradient id="g-${containerId}" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="${colorStart}" />
            <stop offset="100%" stop-color="${colorEnd}" />
          </linearGradient>
        </defs>
        <g transform="translate(${size / 2},${size / 2})">
          <circle r="${r}" cx="0" cy="0" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="${stroke}" />
          <circle r="${r}" cx="0" cy="0" fill="none" stroke="url(#g-${containerId})" stroke-width="${stroke}" stroke-dasharray="${dash} ${remaining}" stroke-linecap="round" transform="rotate(-90)" />
        </g>
      </svg>
      <div class="donut-label"><div class="donut-value">${value}</div><div class="donut-text">${label}</div><div class="donut-pct">${pct}%</div></div>
    </div>
  `;
}

function showTableCnpj() {
  document.getElementById('form-screen').style.display = 'none';
  document.getElementById('list-screen').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'none';
  const chartsWrap4 = document.getElementById('dashboard-charts'); if (chartsWrap4) chartsWrap4.style.display = 'none';
  document.getElementById('table-cnpj-screen').style.display = 'block';
  document.getElementById('btn-table-cnpj').classList.add('active');
  ['btn-list', 'btn-new', 'btn-dashboard', 'btn-trash'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('active'); });
  populateTableCnpj();
}

function populateTableCnpj() {
  const db = getTickets();
  // Listar TODOS os chamados que possuem CNPJ (sem agrupar)
  const list = [];

  for (const r of db) {
    if (r.deleted) continue;
    const cnpj = (r.cnpj || '').trim();

    // Se tiver CNPJ, adiciona na lista
    if (cnpj) {
      list.push({
        id: r.id,
        razao: r.razao || '',
        cnpj: r.cnpj || '',
        requisitante: r.requisitante || '',
        setor: r.setor || '',
        codEtica: r.codEtica || 'nao'
      });
    }
  }

  const tbody = document.getElementById('cnpj-tbody');
  if (!tbody) return;

  let html = '';
  for (const item of list) {
    const actionsHtml = `
      <div class="action-buttons">
        <button class="action-btn edit" title="Editar" onclick="editChamado('${item.id}')">
          <i data-lucide="edit"></i>
        </button>
      </div>
    `;

    html += `<tr>
      <td>${escapeHtml(item.razao)}</td>
      <td>${escapeHtml(item.cnpj)}</td>
      <td>${escapeHtml(item.requisitante)}</td>
      <td>${escapeHtml(item.setor)}</td>
      <td>${item.codEtica === 'sim' ? 'Sim' : 'Não'}</td>
      <td class="text-right">${actionsHtml}</td>
    </tr>`;
  }

  if (!html) {
    html = '<tr><td colspan="6" class="empty-state">Nenhum registro com CNPJ encontrado.</td></tr>';
  }

  tbody.innerHTML = html;

  // Re-initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

/* input masks */
function onCnpjInput(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 14);
  if (v.length >= 12) {
    e.target.value = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
  } else if (v.length >= 8) {
    e.target.value = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, '$1.$2.$3/$4');
  } else if (v.length >= 5) {
    e.target.value = v.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
  } else if (v.length >= 3) {
    e.target.value = v.replace(/^(\d{2})(\d{0,3}).*/, '$1.$2');
  } else {
    e.target.value = v;
  }
}

function onValorInput(e) {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length === 0) { e.target.value = ''; return; }
  while (v.length < 3) v = '0' + v;
  const cents = v.slice(-2);
  const intPart = v.slice(0, -2);
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  e.target.value = intFormatted + ',' + cents;
}

/* debounce helper */
function debounce(fn, wait) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/* Filters */
function resetFilters() {
  if (document.getElementById('filter-status')) document.getElementById('filter-status').value = '';
  if (document.getElementById('filter-date-from')) document.getElementById('filter-date-from').value = '';
  if (document.getElementById('filter-date-to')) document.getElementById('filter-date-to').value = '';
  if (document.getElementById('filter-only-overdue')) document.getElementById('filter-only-overdue').checked = false;
  if (document.getElementById('filter-include-trash')) document.getElementById('filter-include-trash').checked = false;
  loadTable();
}

/* Sidebar toggle & theme */
function applySavedSettings() {
  const s = readSettings();
  const sidebarEl = document.getElementById('sidebar');
  const appEl = document.querySelector('.app');
  if (s.sidebarCollapsed) {
    sidebarEl.classList.add('collapsed');
    appEl.style.gridTemplateColumns = 'var(--sidebar-collapsed) 1fr';
  } else {
    appEl.style.gridTemplateColumns = 'var(--sidebar-width) 1fr';
  }
  // theme
  if (s.theme === 'light') document.body.classList.add('light');
  // set theme & collapse button icons
  refreshUIControls();
}

function toggleSidebar() {
  const sidebarEl = document.getElementById('sidebar');
  const appEl = document.querySelector('.app');
  sidebarEl.classList.toggle('collapsed');
  const s = readSettings();
  s.sidebarCollapsed = sidebarEl.classList.contains('collapsed');
  writeSettings(s);
  // update grid template columns smoothly
  if (sidebarEl.classList.contains('collapsed')) {
    appEl.style.gridTemplateColumns = 'var(--sidebar-collapsed) 1fr';
  } else {
    appEl.style.gridTemplateColumns = 'var(--sidebar-width) 1fr';
  }
  refreshUIControls();
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  const s = readSettings();
  s.theme = isLight ? 'light' : 'dark';
  writeSettings(s);
  refreshUIControls();
}

function refreshUIControls() {
  const tBtn = document.getElementById('toggle-theme');
  if (document.body.classList.contains('light')) {
    tBtn.innerHTML = iconThemeLight();
    tBtn.title = 'Light mode (clicar alterna)';
  } else {
    tBtn.innerHTML = iconThemeDark();
    tBtn.title = 'Dark mode (clicar alterna)';
  }

  const sb = document.getElementById('sidebar');
  const sbBtn = document.getElementById('toggle-sidebar');
  sbBtn.innerHTML = iconToggleCollapsed();
  sbBtn.title = sb.classList.contains('collapsed') ? 'Expandir sidebar' : 'Recolher sidebar';
}

/* ensure table shows freshest data when storage changed externally */
window.addEventListener('storage', () => { loadTable(); loadStats(); });

// Sistema de Gerenciamento de Chamados - JavaScript Vanilla

// State Management
let currentView = 'list';
let editingTicketId = null;
let isDark = true;
let sidebarCollapsed = false;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function () {
  initializeApp();
  loadTheme();
  setupEventListeners();
  loadTickets();
  updateDashboard();
  loadCNPJTable();

  // Initialize default procedures if none exist
  const procedures = getProcedures();
  if (procedures.length === 0) {
    const defaultProcedures = [
      {
        id: 'proc-default-1',
        title: 'Como registrar um novo chamado',
        badge: 'Básico',
        description: 'Passo a passo para criar e categorizar chamados no sistema',
        createdAt: new Date().toISOString()
      },
      {
        id: 'proc-default-2',
        title: 'Processo de aprovação de pagamentos',
        badge: 'Financeiro',
        description: 'Fluxo completo de aprovação e registro de pagamentos',
        createdAt: new Date().toISOString()
      },
      {
        id: 'proc-default-3',
        title: 'Gestão de documentos fiscais',
        badge: 'Fiscal',
        description: 'Organização e arquivamento de notas fiscais e documentos',
        createdAt: new Date().toISOString()
      }
    ];
    saveProcedures(defaultProcedures);
  }
});

// Initialize App
function initializeApp() {
  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Show initial view
  showView('list');
}

// Load Theme from localStorage
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDark = savedTheme === 'dark';
  }
  applyTheme();
}

// Apply Theme
function applyTheme() {
  const body = document.body;
  const themeIcon = document.querySelector('#toggle-theme i');

  if (isDark) {
    body.classList.add('dark');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', 'sun');
    }
  } else {
    body.classList.remove('dark');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', 'moon');
    }
  }

  // Re-initialize icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Save to localStorage
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Setup Event Listeners
function setupEventListeners() {
  // Theme Toggle
  const themeBtn = document.getElementById('toggle-theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Sidebar Toggle
  const sidebarBtn = document.getElementById('toggle-sidebar');
  if (sidebarBtn) {
    sidebarBtn.addEventListener('click', toggleSidebar);
  }

  // New Ticket Button
  const newTicketBtn = document.getElementById('btn-new-ticket');
  if (newTicketBtn) {
    newTicketBtn.addEventListener('click', showNewTicketForm);
  }

  // Navigation Items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function () {
      const view = this.getAttribute('data-view');
      showView(view);

      // Update active state
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Form Submit
  const ticketForm = document.getElementById('ticket-form');
  if (ticketForm) {
    ticketForm.addEventListener('submit', handleFormSubmit);
  }

  // Search
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
}

// Toggle Theme
function toggleTheme() {
  isDark = !isDark;
  applyTheme();
}

// Toggle Sidebar
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleIcon = document.querySelector('#toggle-sidebar i');

  sidebarCollapsed = !sidebarCollapsed;

  if (sidebar) {
    sidebar.classList.toggle('collapsed');
  }

  if (toggleIcon) {
    if (sidebarCollapsed) {
      toggleIcon.setAttribute('data-lucide', 'chevron-right');
    } else {
      toggleIcon.setAttribute('data-lucide', 'chevron-left');
    }
    lucide.createIcons();
  }
}

// Show View
function showView(viewName) {
  currentView = viewName;

  // Hide all views
  const views = document.querySelectorAll('.view-section');
  views.forEach(view => view.classList.remove('active'));

  // Show selected view
  const selectedView = document.getElementById(`view-${viewName}`);
  if (selectedView) {
    selectedView.classList.add('active');
  }

  // Update based on view
  if (viewName === 'list') {
    loadTickets();
  } else if (viewName === 'dashboard') {
    updateDashboard();
  } else if (viewName === 'cnpj') {
    loadCNPJTable();
  } else if (viewName === 'procedures') {
    loadProcedures();
  } else if (viewName === 'trash') {
    loadTrashView();
  }
}

// Show New Ticket Form
// Legacy showNewTicketForm removed - replaced by updated version below

// Cancel Form
function cancelForm() {
  showView('list');

  // Update nav active state
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(nav => nav.classList.remove('active'));
  document.querySelector('.nav-item[data-view="list"]').classList.add('active');
}

// Handle Form Submit
function handleFormSubmit(e) {
  e.preventDefault();

  const formData = {
    numero: document.getElementById('numero').value,
    situacao: document.getElementById('situacao').value,
    dataEmissao: document.getElementById('dataEmissao').value,
    pedido: document.getElementById('pedido').value,
    notaFiscal: document.getElementById('notaFiscal').value,
    vencimento: document.getElementById('vencimento').value,
    valor: document.getElementById('valor').value,
    forma: document.getElementById('forma').value,
    razao: document.getElementById('razao').value,
    cnpj: document.getElementById('cnpj').value,
    requisitante: document.getElementById('requisitante').value,
    setor: document.getElementById('setor').value,
    codEtica: document.getElementById('codEtica').value,
    obs: document.getElementById('obs').value,
    type: document.getElementById('ticket-type').value || 'ticket' // Save type
  };

  const tickets = getTickets();
  const editingId = document.getElementById('editing-id').value;

  if (editingId) {
    // Update existing ticket
    const index = tickets.findIndex(t => t.id === editingId);
    if (index !== -1) {
      tickets[index] = { ...formData, id: editingId };
      showToast('Chamado atualizado com sucesso!');
    }
  } else {
    // Create new ticket
    const newTicket = {
      ...formData,
      id: Date.now().toString()
    };
    tickets.push(newTicket);
    showToast('Chamado criado com sucesso!');
  }

  saveTickets(tickets);
  showView('list');

  // Update nav active state
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(nav => nav.classList.remove('active'));
  document.querySelector('.nav-item[data-view="list"]').classList.add('active');
}

// Get Tickets from localStorage
function getTickets() {
  const stored = localStorage.getItem('tickets');
  return stored ? JSON.parse(stored) : [];
}

// Save Tickets to localStorage
function saveTickets(tickets) {
  localStorage.setItem('tickets', JSON.stringify(tickets));
}

// Load Tickets
function loadTickets() {
  // Filtrar deletados E registros de CNPJ (apenas chamados operacionais aqui)
  const tickets = getTickets().filter(t => !t.deleted && t.type !== 'cnpj_record');
  const tbody = document.getElementById('tickets-tbody');

  if (!tbody) return;

  if (tickets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="13" class="empty-state">
          Nenhum chamado cadastrado. Clique em "Novo Chamado" para começar.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = tickets.map(ticket => `
    <tr>
      <td>
        <span class="status-badge status-${normalizeStatus(ticket.situacao)}">
          ${ticket.situacao}
        </span>
      </td>
      <td style="font-weight: 600;">${ticket.numero}</td>
      <td>${formatDate(ticket.dataEmissao)}</td>
      <td style="color: var(--muted-foreground);">${ticket.pedido || '-'}</td>
      <td style="color: var(--muted-foreground);">${ticket.notaFiscal || '-'}</td>
      <td style="color: var(--muted-foreground);">${ticket.vencimento ? formatDate(ticket.vencimento) : '-'}</td>
      <td style="font-weight: 600; color: var(--primary);">${ticket.valor}</td>
      <td style="color: var(--muted-foreground);">${ticket.forma || '-'}</td>
      <td>${ticket.razao || '-'}</td>
      <td style="font-family: monospace; font-size: 0.875rem;">${ticket.cnpj || '-'}</td>
      <td>${ticket.requisitante}</td>
      <td class="small" style="color: var(--muted-foreground);">${ticket.obs && ticket.obs.length > 80 ? ticket.obs.substring(0, 77) + '…' : (ticket.obs || '-')}</td>
      <td class="text-right">
        <div class="action-buttons">
          <button class="action-btn edit" onclick="editTicket('${ticket.id}')" title="Editar">
            <i data-lucide="edit" style="width: 16px; height: 16px;"></i>
          </button>
          <button class="action-btn delete" onclick="deleteTicket('${ticket.id}')" title="Mover para Lixeira">
            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Re-initialize icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Edit Ticket
function editTicket(id) {
  const tickets = getTickets();
  const ticket = tickets.find(t => t.id === id);

  if (!ticket) return;

  editingTicketId = id;
  document.getElementById('form-title').textContent = 'Editar Chamado';

  // Fill form
  document.getElementById('numero').value = ticket.numero || '';
  document.getElementById('situacao').value = ticket.situacao || '';
  document.getElementById('dataEmissao').value = ticket.dataEmissao || '';
  document.getElementById('pedido').value = ticket.pedido || '';
  document.getElementById('notaFiscal').value = ticket.notaFiscal || '';
  document.getElementById('vencimento').value = ticket.vencimento || '';
  document.getElementById('valor').value = ticket.valor || '';
  document.getElementById('forma').value = ticket.forma || '';
  document.getElementById('razao').value = ticket.razao || '';
  document.getElementById('cnpj').value = ticket.cnpj || '';
  document.getElementById('requisitante').value = ticket.requisitante || '';
  document.getElementById('setor').value = ticket.setor || '';
  document.getElementById('codEtica').value = ticket.codEtica || '';
  document.getElementById('obs').value = ticket.obs || '';
  document.getElementById('editing-id').value = id;

  showView('form');

  // Update nav active state
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(nav => nav.classList.remove('active'));
}

// Delete Ticket (Soft Delete - Move to Trash)
function deleteTicket(id) {
  if (!confirm('Enviar este chamado para a Lixeira?')) {
    return;
  }

  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === id);

  if (index !== -1) {
    tickets[index].deleted = true;
    tickets[index].deletedAt = new Date().toISOString();
    saveTickets(tickets);
    loadTickets();
    updateDashboard();
    showToast('Chamado enviado para a lixeira!');
  }
}

// Restore Ticket from Trash
function restoreTicket(id) {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === id);

  if (index !== -1) {
    tickets[index].deleted = false;
    tickets[index].deletedAt = null;
    saveTickets(tickets);
    loadTrashView();
    showToast('Chamado restaurado com sucesso!');
  }
}

// Permanent Delete
function permanentDeleteTicket(id) {
  if (!confirm('Excluir definitivamente? Esta ação NÃO pode ser desfeita.')) {
    return;
  }

  const tickets = getTickets();
  const filtered = tickets.filter(t => t.id !== id);
  saveTickets(filtered);
  loadTrashView();
  showToast('Chamado excluído permanentemente!');
}

// Load Trash View
function loadTrashView() {
  const tickets = getTickets().filter(t => t.deleted); // Apenas deletados
  const tbody = document.getElementById('trash-tbody');

  if (!tbody) return;

  if (tickets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="13" class="empty-state">
          <div style="padding: 2rem; text-align: center;">
            <i data-lucide="trash-2" style="width: 48px; height: 48px; margin-bottom: 1rem; color: var(--muted-foreground);"></i>
            <h3 style="margin: 0 0 0.5rem 0; color: var(--foreground);">Lixeira vazia</h3>
            <p style="margin: 0; color: var(--muted-foreground);">
              Não há chamados excluídos no momento.
            </p>
          </div>
        </td>
      </tr>
    `;
    if (window.lucide) {
      lucide.createIcons();
    }
    return;
  }

  tbody.innerHTML = tickets.map(ticket => `
    <tr style="opacity: 0.7;">
      <td>
        <span class="status-badge status-${normalizeStatus(ticket.situacao)}">
          ${ticket.situacao}
        </span>
      </td>
      <td style="font-weight: 600;">${ticket.numero}</td>
      <td>${formatDate(ticket.dataEmissao)}</td>
      <td style="color: var(--muted-foreground);">${ticket.pedido || '-'}</td>
      <td style="color: var(--muted-foreground);">${ticket.notaFiscal || '-'}</td>
      <td style="color: var(--muted-foreground);">${ticket.vencimento ? formatDate(ticket.vencimento) : '-'}</td>
      <td style="font-weight: 600; color: var(--primary);">${ticket.valor}</td>
      <td style="color: var(--muted-foreground);">${ticket.forma || '-'}</td>
      <td>${ticket.razao || '-'}</td>
      <td style="font-family: monospace; font-size: 0.875rem;">${ticket.cnpj || '-'}</td>
      <td>${ticket.requisitante}</td>
      <td class="small" style="color: var(--muted-foreground);">${ticket.obs && ticket.obs.length > 80 ? ticket.obs.substring(0, 77) + '…' : (ticket.obs || '-')}</td>
      <td class="text-right">
        <div class="action-buttons">
          <button class="action-btn edit" onclick="restoreTicket('${ticket.id}')" title="Restaurar" style="color: var(--success);">
            <i data-lucide="rotate-ccw" style="width: 16px; height: 16px;"></i>
          </button>
          <button class="action-btn delete" onclick="permanentDeleteTicket('${ticket.id}')" title="Excluir Permanentemente">
            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Re-initialize icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Update Dashboard
function updateDashboard() {
  // Filter out deleted and CNPJ records
  const tickets = getTickets().filter(t => !t.deleted && t.type !== 'cnpj_record');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.situacao === 'Aberto' || t.situacao === 'Em Andamento').length,
    solved: tickets.filter(t => t.situacao === 'Solucionado').length,
    overdue: tickets.filter(t => {
      if (!t.vencimento) return false;
      const vencDate = new Date(t.vencimento);
      vencDate.setHours(0, 0, 0, 0);
      return vencDate < today && t.situacao !== 'Solucionado';
    }).length
  };

  // Update stat cards
  const statTotal = document.getElementById('stat-total');
  const statOpen = document.getElementById('stat-open');
  const statSolved = document.getElementById('stat-solved');
  const statOverdue = document.getElementById('stat-overdue');

  if (statTotal) statTotal.textContent = stats.total;
  if (statOpen) statOpen.textContent = stats.open;
  if (statSolved) statSolved.textContent = stats.solved;
  if (statOverdue) statOverdue.textContent = stats.overdue;

  // Update progress bars
  const total = stats.total || 1;

  const progressOpenCount = document.getElementById('progress-open-count');
  const progressOpenFill = document.getElementById('progress-open-fill');
  if (progressOpenCount) progressOpenCount.textContent = stats.open;
  if (progressOpenFill) progressOpenFill.style.width = `${(stats.open / total) * 100}%`;

  const progressSolvedCount = document.getElementById('progress-solved-count');
  const progressSolvedFill = document.getElementById('progress-solved-fill');
  if (progressSolvedCount) progressSolvedCount.textContent = stats.solved;
  if (progressSolvedFill) progressSolvedFill.style.width = `${(stats.solved / total) * 100}%`;

  const progressOverdueCount = document.getElementById('progress-overdue-count');
  const progressOverdueFill = document.getElementById('progress-overdue-fill');
  if (progressOverdueCount) progressOverdueCount.textContent = stats.overdue;
  if (progressOverdueFill) progressOverdueFill.style.width = `${(stats.overdue / total) * 100}%`;

  // Update summary
  const resolutionRate = document.getElementById('resolution-rate');
  const pendingCount = document.getElementById('pending-count');
  const attentionCount = document.getElementById('attention-count');

  if (resolutionRate) {
    resolutionRate.textContent = stats.total > 0
      ? `${Math.round((stats.solved / stats.total) * 100)}%`
      : '0%';
  }
  if (pendingCount) pendingCount.textContent = stats.total - stats.solved;
  if (attentionCount) attentionCount.textContent = stats.overdue;
}

// Load CNPJ Table (redirect to correct function)
function loadCNPJTable() {
  populateTableCnpj();
}

// Export CNPJ to CSV
function exportCnpj() {
  const db = getTickets();
  const cnpjMap = new Map();

  // Agregar CNPJs únicos
  for (const r of db) {
    if (r.deleted) continue;
    const cnpjKey = (r.cnpj || '').trim();
    if (!cnpjKey) continue;

    if (!cnpjMap.has(cnpjKey)) {
      cnpjMap.set(cnpjKey, {
        razao: r.razao || '',
        cnpj: r.cnpj || '',
        requisitante: r.requisitante || '',
        setor: r.setor || '',
        codEtica: r.codEtica || 'nao'
      });
    }
  }

  if (cnpjMap.size === 0) {
    showToast('Nenhum CNPJ para exportar.', true);
    return;
  }

  // Criar CSV
  let csv = 'Razão Social,CNPJ,Requisitante,Setor,Código de Ética\n';

  for (const item of cnpjMap.values()) {
    csv += `"${item.razao}","${item.cnpj}","${item.requisitante}","${item.setor}","${item.codEtica === 'sim' ? 'Sim' : 'Não'}"\n`;
  }

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `cnpj_export_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`${cnpjMap.size} CNPJs exportados com sucesso!`);
}

// Import CNPJ from CSV
function importCnpj() {
  // Criar input file temporário
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n');

        // Pular cabeçalho
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Parse CSV line (simples, assume campos entre aspas)
          const matches = line.match(/"([^"]*)"/g);
          if (!matches || matches.length < 5) continue;

          const razao = matches[0].replace(/"/g, '');
          const cnpj = matches[1].replace(/"/g, '');
          const requisitante = matches[2].replace(/"/g, '');
          const setor = matches[3].replace(/"/g, '');
          const codEtica = matches[4].replace(/"/g, '').toLowerCase() === 'sim' ? 'sim' : 'nao';

          // Verificar se CNPJ já existe
          const db = getTickets();
          const exists = db.some(r => !r.deleted && r.cnpj === cnpj);

          if (!exists && cnpj) {
            // Criar novo chamado básico com este CNPJ
            const newTicket = {
              id: generateId(),
              situacao: 'Aberto',
              numero: `IMP-${Date.now()}`,
              dataEmissao: new Date().toISOString().split('T')[0],
              pedido: '',
              notaFiscal: '',
              vencimento: '',
              valor: 0,
              forma: '',
              razao: razao,
              cnpj: cnpj,
              obs: 'Importado via CSV',
              requisitante: requisitante,
              setor: setor,
              codEtica: codEtica,
              deleted: false,
              deletedAt: null,
              updatedAt: new Date().toISOString()
            };

            db.push(newTicket);
            imported++;
          }
        }

        if (imported > 0) {
          saveTickets(db); // Atualizar
          populateTableCnpj(); // Recarregar tabela
          showToast(`${imported} CNPJ(s) importado(s) com sucesso!`);
        } else {
          showToast('Nenhum CNPJ novo foi importado.', true);
        }
      } catch (error) {
        console.error('Erro ao importar CSV:', error);
        showToast('Erro ao importar arquivo CSV.', true);
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

// Create new CNPJ (redirects to new ticket form)
// Create new CNPJ (redirects to new ticket form with specific context)
function newCnpj() {
  showNewCnpjForm();
  document.getElementById('form-title').textContent = 'Novo CNPJ';
  showToast('Preencha os dados para cadastrar o novo CNPJ');
}

// Show New Ticket Form (Standard)
function showNewTicketForm() {
  editingTicketId = null;
  document.getElementById('form-title').textContent = 'Novo Chamado';
  const form = document.getElementById('ticket-form');
  form.reset();
  document.getElementById('editing-id').value = '';
  document.getElementById('ticket-type').value = 'ticket'; // Default type

  // Restore all fields visibility and required attributes
  const groups = form.querySelectorAll('.form-group');
  groups.forEach(group => {
    group.style.display = 'block';
    const input = group.querySelector('input, select, textarea');
    if (input) {
      // Restore required based on original HTML logic (simplification: restore for specific IDs)
      const id = input.id;
      if (['situacao', 'numero', 'dataEmissao', 'notaFiscal', 'vencimento', 'valor', 'forma', 'razao', 'cnpj'].includes(id)) {
        input.required = true;
      }
    }
  });

  showView('form');

  // Update nav active state
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(nav => nav.classList.remove('active'));
}

function showNewCnpjForm() {
  // Reuse base logic to reset and show view
  showNewTicketForm();

  // Set specific type for CNPJ record
  document.getElementById('ticket-type').value = 'cnpj_record';

  const form = document.getElementById('ticket-form');
  const groups = form.querySelectorAll('.form-group');

  // Fields to keep visible
  const visibleFields = ['razao', 'cnpj', 'requisitante', 'setor', 'codEtica'];

  groups.forEach(group => {
    const input = group.querySelector('input, select, textarea');
    if (!input) return;

    if (visibleFields.includes(input.id)) {
      group.style.display = 'block';
    } else {
      group.style.display = 'none';
      input.required = false; // Remove required to allow submit

      // Fill with default values for hidden fields
      if (input.id === 'situacao') input.value = 'Aberto';
      if (input.id === 'numero') input.value = `CNPJ-${Date.now()}`;
      if (input.id === 'dataEmissao') input.value = new Date().toISOString().split('T')[0];
      if (input.id === 'vencimento') input.value = new Date().toISOString().split('T')[0]; // Data atual como placeholder
      if (input.id === 'valor') input.value = '0,00';
      if (input.id === 'forma') input.value = 'Dinheiro'; // Valor padrão
      if (input.id === 'notaFiscal') input.value = 'N/A';
    }
  });
}

// Handle Search
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();

  if (currentView !== 'list') return;

  // Filter out deleted AND cnpj_record
  const tickets = getTickets().filter(t => !t.deleted && t.type !== 'cnpj_record');

  // Se campo vazio, mostrar todos os tickets
  if (searchTerm === '') {
    loadTickets();
    return;
  }

  const filtered = tickets.filter(ticket => {
    // Converter valores numéricos e datas para string para busca
    const valorStr = ticket.valor ? String(ticket.valor) : '';
    const dataEmissaoStr = ticket.dataEmissao ? formatDate(ticket.dataEmissao) : '';
    const vencimentoStr = ticket.vencimento ? formatDate(ticket.vencimento) : '';

    return (
      // Campos de texto
      (ticket.numero && ticket.numero.toLowerCase().includes(searchTerm)) ||
      (ticket.situacao && ticket.situacao.toLowerCase().includes(searchTerm)) ||
      (ticket.razao && ticket.razao.toLowerCase().includes(searchTerm)) ||
      (ticket.cnpj && ticket.cnpj.toLowerCase().includes(searchTerm)) ||
      (ticket.requisitante && ticket.requisitante.toLowerCase().includes(searchTerm)) ||
      (ticket.pedido && ticket.pedido.toLowerCase().includes(searchTerm)) ||
      (ticket.notaFiscal && ticket.notaFiscal.toLowerCase().includes(searchTerm)) ||
      (ticket.obs && ticket.obs.toLowerCase().includes(searchTerm)) ||
      // Campos adicionais
      (ticket.setor && ticket.setor.toLowerCase().includes(searchTerm)) ||
      (ticket.codEtica && ticket.codEtica.toLowerCase().includes(searchTerm)) ||
      (ticket.forma && ticket.forma.toLowerCase().includes(searchTerm)) ||
      // Campos numéricos e datas (convertidos para string)
      valorStr.toLowerCase().includes(searchTerm) ||
      dataEmissaoStr.toLowerCase().includes(searchTerm) ||
      vencimentoStr.toLowerCase().includes(searchTerm)
    );
  });

  // Update table with filtered results
  const tbody = document.getElementById('tickets-tbody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="13" class="empty-state">
          Nenhum resultado encontrado para "${escapeHtml(searchTerm)}".
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(ticket => `
    <tr>
      <td>
        <span class="status-badge status-${normalizeStatus(ticket.situacao)}">
          ${ticket.situacao}
        </span>
      </td>
      <td style="font-weight: 600;">${ticket.numero}</td>
      <td>${formatDate(ticket.dataEmissao)}</td>
      <td style="color: var(--muted-foreground);">${ticket.pedido || '-'}</td>
      <td style="color: var(--muted-foreground);">${ticket.notaFiscal || '-'}</td>
      <td style="color: var(--muted-foreground);">${ticket.vencimento ? formatDate(ticket.vencimento) : '-'}</td>
      <td style="font-weight: 600; color: var(--primary);">${ticket.valor}</td>
      <td style="color: var(--muted-foreground);">${ticket.forma || '-'}</td>
      <td>${ticket.razao || '-'}</td>
      <td style="font-family: monospace; font-size: 0.875rem;">${ticket.cnpj || '-'}</td>
      <td>${ticket.requisitante}</td>
      <td class="small" style="color: var(--muted-foreground);">${ticket.obs && ticket.obs.length > 80 ? ticket.obs.substring(0, 77) + '…' : (ticket.obs || '-')}</td>
      <td class="text-right">
        <div class="action-buttons">
          <button class="action-btn edit" onclick="editTicket('${ticket.id}')" title="Editar">
            <i data-lucide="edit" style="width: 16px; height: 16px;"></i>
          </button>
          <button class="action-btn delete" onclick="deleteTicket('${ticket.id}')" title="Mover para Lixeira">
            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Re-initialize icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Show Toast
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Utility Functions
function normalizeStatus(status) {
  const normalized = status.toLowerCase()
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return normalized;
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
}

// Make functions globally available
window.showView = showView;
window.showNewTicketForm = showNewTicketForm;
window.cancelForm = cancelForm;
window.editTicket = editTicket;
window.deleteTicket = deleteTicket;
window.restoreTicket = restoreTicket;
window.permanentDeleteTicket = permanentDeleteTicket;
window.loadTrashView = loadTrashView;

// ========== PROCEDURES MANAGEMENT ==========

// Get Procedures from localStorage
function getProcedures() {
  const stored = localStorage.getItem('procedures');
  return stored ? JSON.parse(stored) : [];
}

// Save Procedures to localStorage
function saveProcedures(procedures) {
  localStorage.setItem('procedures', JSON.stringify(procedures));
}

// Load Procedures
function loadProcedures() {
  const procedures = getProcedures();
  const grid = document.getElementById('procedures-grid');

  if (!grid) return;

  if (procedures.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-card" style="grid-column: 1 / -1;">
        <div class="empty-icon">
          <i data-lucide="file-text"></i>
        </div>
        <h3 class="empty-title">Nenhum procedimento cadastrado</h3>
        <p class="empty-description">
          Clique em "Novo Procedimento" para criar seu primeiro procedimento.
        </p>
      </div>
    `;
    if (window.lucide) {
      lucide.createIcons();
    }
    return;
  }

  grid.innerHTML = procedures.map((proc, index) => `
    <div class="procedure-card" style="animation-delay: ${index * 100}ms">
      <button class="procedure-delete" onclick="deleteProcess('${proc.id}')" title="Excluir procedimento">
        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
      </button>
      <div class="procedure-icon">
        <i data-lucide="file-text"></i>
      </div>
      <div class="procedure-content">
        <span class="procedure-badge">${escapeHtml(proc.badge)}</span>
        <h3 class="procedure-title">${escapeHtml(proc.title)}</h3>
        <p class="procedure-description">${escapeHtml(proc.description)}</p>
      </div>
    </div>
  `).join('');

  // Re-initialize icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

// New Process - Open Modal
function newProcess() {
  const modal = document.getElementById('procedure-modal');
  if (!modal) {
    createProcedureModal();
  }

  // Reset form
  document.getElementById('procedure-form').reset();
  document.getElementById('procedure-id').value = '';
  document.getElementById('procedure-modal-title').textContent = 'Novo Procedimento';

  // Show modal
  document.getElementById('procedure-modal').classList.add('show');
}

// Create Procedure Modal (if not exists)
function createProcedureModal() {
  const modalHTML = `
    <div id="procedure-modal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title" id="procedure-modal-title">Novo Procedimento</h2>
          <button class="modal-close" onclick="closeProcedureModal()">
            <i data-lucide="x" style="width: 20px; height: 20px;"></i>
          </button>
        </div>
        <form id="procedure-form" onsubmit="saveProcedure(event)">
          <div class="modal-body">
            <input type="hidden" id="procedure-id" value="">
            
            <div class="form-group">
              <label for="procedure-title">Título *</label>
              <input type="text" id="procedure-title" placeholder="Ex: Como registrar um chamado" required>
            </div>
            
            <div class="form-group">
              <label for="procedure-badge">Categoria *</label>
              <select id="procedure-badge" required>
                <option value="">Selecione</option>
                <option value="Básico">Básico</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Fiscal">Fiscal</option>
                <option value="Técnico">Técnico</option>
                <option value="Administrativo">Administrativo</option>
                <option value="RH">RH</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="procedure-description">Descrição *</label>
              <textarea id="procedure-description" placeholder="Descreva o procedimento..." rows="4" required></textarea>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn-outline" onclick="closeProcedureModal()">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              Salvar Procedimento
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Re-initialize icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Close modal on outside click
  document.getElementById('procedure-modal').addEventListener('click', function (e) {
    if (e.target === this) {
      closeProcedureModal();
    }
  });
}

// Close Procedure Modal
function closeProcedureModal() {
  const modal = document.getElementById('procedure-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

// Save Procedure
function saveProcedure(event) {
  event.preventDefault();

  const procedures = getProcedures();
  const id = document.getElementById('procedure-id').value || 'proc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

  const procedure = {
    id: id,
    title: document.getElementById('procedure-title').value.trim(),
    badge: document.getElementById('procedure-badge').value,
    description: document.getElementById('procedure-description').value.trim(),
    createdAt: new Date().toISOString()
  };

  const existingIndex = procedures.findIndex(p => p.id === id);
  if (existingIndex >= 0) {
    procedures[existingIndex] = procedure;
    showToast('Procedimento atualizado com sucesso!');
  } else {
    procedures.push(procedure);
    showToast('Procedimento criado com sucesso!');
  }

  saveProcedures(procedures);
  loadProcedures();
  closeProcedureModal();
}

// Delete Process
function deleteProcess(id) {
  if (!confirm('Tem certeza que deseja excluir este procedimento?')) {
    return;
  }

  const procedures = getProcedures();
  const filtered = procedures.filter(p => p.id !== id);
  saveProcedures(filtered);
  loadProcedures();
  showToast('Procedimento excluído com sucesso!');
}

// Make procedures functions globally available
window.newProcess = newProcess;
window.deleteProcess = deleteProcess;
window.loadProcedures = loadProcedures;
window.closeProcedureModal = closeProcedureModal;
window.saveProcedure = saveProcedure;

// Suporte
document.addEventListener('DOMContentLoaded', () => {

  // --- LÓGICA DO TEMA ---
  const themeBtn = document.getElementById('theme-toggle');
  const themeIcon = themeBtn.querySelector('i');

  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(theme) {
    if (theme === 'light') {
      themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
      themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
  }

  // --- ENVIO DO FORMULÁRIO DE SUPORTE ---
  const supportForm = document.getElementById('supportForm');
  const suporteToast = document.getElementById('suporte-toast');

  if (supportForm) {
    const submitBtn = document.querySelector('.suporte-btn-submit');

    supportForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Efeito de carregamento
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      submitBtn.disabled = true;

      // Simulação de envio (em produção, fazer requisição real)
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        supportForm.reset();

        // Mostrar Toast de Sucesso
        if (suporteToast) {
          suporteToast.classList.add('show');
          setTimeout(() => suporteToast.classList.remove('show'), 3000);
        }
      }, 1500);
    });
  }

  // Acordeão Exclusivo para FAQ (Fecha um ao abrir outro)
  const faqDetails = document.querySelectorAll('.suporte-faq-item');
  faqDetails.forEach((detail) => {
    detail.addEventListener('click', function () {
      if (!this.open) {
        faqDetails.forEach(d => {
          if (d !== this && d.open) d.removeAttribute('open');
        });
      }
    });
  });
});