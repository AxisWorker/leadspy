// ── App State ────────────────────────────────────────────────────
let allResults      = [];
let filteredResults = [];

// ── Boot ─────────────────────────────────────────────────────────
(function init() {
  updateKeyUI();
  if (serpKey) document.getElementById('serpKeyInput').value = serpKey;

  document.getElementById('detailModal').addEventListener('click', function(e) {
    if (e.target === this) closeDetail();
  });
  document.getElementById('promptModal').addEventListener('click', function(e) {
    if (e.target === this) closePrompt();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeDetail(); closePrompt(); }
  });
})();

// ── Navigation ───────────────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.toLowerCase().includes(id));
  });
}

// ── Search ───────────────────────────────────────────────────────
async function doSearch() {
  if (!serpKey) {
    toast('No API key. Go to Config first.', 'error');
    showPage('config');
    return;
  }

  const city     = document.getElementById('s-city').value.trim();
  const state    = document.getElementById('s-state').value.trim();
  const country  = document.getElementById('s-country').value;
  const custom   = document.getElementById('s-custom').value.trim();
  const category = custom || document.getElementById('s-category').value;
  const limit    = parseInt(document.getElementById('s-limit').value);

  if (!city) { toast('Please enter a city.', 'error'); return; }

  const locationStr = [city, state].filter(Boolean).join(', ');
  const query       = `${category} in ${locationStr}`;

  document.getElementById('searchBtn').disabled = true;
  showLoading(query);

  try {
    allResults = await fetchBusinesses({ city, state, country, category, limit });
    currentPage = 1;
    applyFilter();
  } catch (err) {
    if (err.message === 'NO_KEY') {
      showError('No API key configured. Go to Config.');
    } else {
      showError(err.message);
    }
  } finally {
    document.getElementById('searchBtn').disabled = false;
  }
}

// ── Filter ───────────────────────────────────────────────────────
function applyFilter() {
  const f = getFilter();
  if (f === 'no-website')  filteredResults = allResults.filter(b => !b._hasWebsite);
  else if (f === 'has-website') filteredResults = allResults.filter(b => b._hasWebsite);
  else filteredResults = [...allResults];

  filteredResults.sort((a, b) => b._score - a._score);
  currentPage = 1;
  renderResults();
}

function getFilter() { return document.getElementById('s-filter').value; }

function setFilter(v) {
  document.getElementById('s-filter').value = v;
  applyFilter();
}

// ── Enter key on city input ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('s-city').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
});
