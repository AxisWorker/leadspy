// ── Render helpers ──────────────────────────────────────────────
const PAGE_SIZE = 12;
let currentPage = 1;

function ratingStars(r) {
  if (r == null) return '';
  const f = Math.round(r);
  return '★'.repeat(f) + '☆'.repeat(5 - f);
}

function categoryIcon(cat) {
  const map = {
    'Barbershop':'💈','Restaurant':'🍽️','Dentist':'🦷','Gym':'🏋️',
    'Beauty Salon':'💅','Pet Shop':'🐾','Auto Repair':'🔧','Law Firm':'⚖️',
    'Real Estate':'🏠','Pharmacy':'💊','Nail Salon':'💅','Tattoo Shop':'🎨',
    'Electrician':'⚡','Plumber':'🔧','Accountant':'📊','Cleaning Service':'🧹',
    'Bakery':'🥐','Florist':'🌸','Hotel':'🏨','Coffee Shop':'☕',
  };
  return map[cat] || '🏢';
}

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderResults() {
  const area    = document.getElementById('resultsArea');
  const total   = filteredResults.length;
  const noWeb   = filteredResults.filter(b => !b._hasWebsite).length;

  if (total === 0) { showEmptyState('No businesses match the current filter.'); return; }

  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = filteredResults.slice(start, start + PAGE_SIZE);
  const pages = Math.ceil(total / PAGE_SIZE);

  let html = `
    <div class="results-header">
      <div class="results-count">
        <strong>${total}</strong> results ·
        <strong style="color:var(--red)">${noWeb}</strong> without website
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <div class="results-filters">
          <button class="filter-chip ${getFilter()==='all'?'active':''}" onclick="setFilter('all')">All</button>
          <button class="filter-chip ${getFilter()==='no-website'?'active':''}" onclick="setFilter('no-website')">No Website</button>
          <button class="filter-chip ${getFilter()==='has-website'?'active':''}" onclick="setFilter('has-website')">Has Website</button>
        </div>
        <button class="export-btn" onclick="exportJSON()">⬇ JSON</button>
        <button class="export-btn" onclick="exportCSV()">⬇ CSV</button>
      </div>
    </div>
    <div class="cards-grid">
  `;

  slice.forEach(b => {
    const sc    = b._score;
    const scCls = scoreClass(sc);
    const photo = b.thumbnail
      ? `<img class="biz-photo" src="${esc(b.thumbnail)}" alt="" onerror="this.style.display='none'"/>`
      : `<div class="biz-photo-placeholder">${categoryIcon(b._category)}</div>`;
    const idx = allResults.indexOf(b);

    html += `
      <div class="biz-card${sc >= 70 ? ' high-lead' : ''}" onclick="openDetail(${idx})">
        <div class="card-top">
          ${photo}
          <div class="card-info">
            <div class="biz-name" title="${esc(b.title)}">${esc(b.title)}</div>
            <div class="biz-category">${esc(b._category)}</div>
          </div>
          <div class="lead-score-badge">
            <div class="score-ring score-${scCls}">${sc}</div>
            <div class="score-label">Lead</div>
          </div>
        </div>
        <div class="card-meta">
          ${b.rating != null
            ? `<div class="rating-row">
                <span class="stars">${ratingStars(b.rating)}</span>
                <span class="rating-val">${b.rating.toFixed(1)}</span>
                <span class="review-cnt">(${(b.reviews||0).toLocaleString()})</span>
               </div>`
            : '<span style="font-size:12px;color:var(--muted)">No rating</span>'}
        </div>
        ${b.address ? `<div class="card-address"><span>📍</span><span>${esc(b.address)}</span></div>` : ''}
        ${b.phone   ? `<div class="card-phone"><span>📞</span><span>${esc(b.phone)}</span></div>` : ''}
        <div class="card-bottom">
          <span class="website-badge ${b._hasWebsite ? 'has' : 'none'}">
            <span class="badge-dot"></span>
            ${b._hasWebsite ? 'Has Website' : 'No Website'}
          </span>
          <div class="card-actions">
            <button class="card-action-btn" onclick="event.stopPropagation();openPromptFor(${idx})">✨ Prompt</button>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';

  if (pages > 1) {
    html += `<div class="pagination">
      <button class="page-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;
    for (let p = 1; p <= pages; p++) {
      html += `<button class="page-btn${p===currentPage?' active':''}" onclick="goPage(${p})">${p}</button>`;
    }
    html += `<button class="page-btn" onclick="goPage(${currentPage+1})" ${currentPage===pages?'disabled':''}>›</button>
    </div>`;
  }

  area.innerHTML = html;
}

function goPage(p) {
  currentPage = p;
  renderResults();
  window.scrollTo(0, 0);
}

// ── State screens ───────────────────────────────────────────────
function showLoading(query) {
  document.getElementById('resultsArea').innerHTML = `
    <div class="state-box">
      <div class="spinner"></div>
      <div class="state-title">Searching Google Maps...</div>
      <div class="state-sub" style="font-family:var(--mono);font-size:12px;color:var(--accent)">${esc(query)}</div>
      <div class="progress-bar-wrap"><div class="progress-bar" id="pbar"></div></div>
    </div>
  `;
  let w = 0;
  const iv = setInterval(() => {
    w = Math.min(w + Math.random() * 15, 90);
    const pb = document.getElementById('pbar');
    if (pb) pb.style.width = w + '%'; else clearInterval(iv);
  }, 300);
}

function showEmptyState(msg) {
  document.getElementById('resultsArea').innerHTML = `
    <div class="state-box">
      <div class="state-icon">🔍</div>
      <div class="state-title">No results</div>
      <div class="state-sub">${esc(msg)}</div>
    </div>
  `;
}

function showError(msg) {
  document.getElementById('resultsArea').innerHTML = `
    <div class="state-box">
      <div class="state-icon">⚠️</div>
      <div class="state-title">Error</div>
      <div class="state-sub" style="color:var(--red)">${esc(msg)}</div>
    </div>
  `;
  toast(msg.slice(0, 80), 'error');
}

// ── Toast ───────────────────────────────────────────────────────
function toast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = 'toast show' + (type ? ' ' + type : '');
  setTimeout(() => { el.className = 'toast'; }, 3000);
}
