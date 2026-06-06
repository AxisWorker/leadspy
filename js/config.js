// ── API Key Management ──────────────────────────────────────────
let serpKey = localStorage.getItem('serpapi_key') || '';

function saveKey() {
  const val = document.getElementById('serpKeyInput').value.trim();
  if (!val) { showKeyStatus('err', 'Please enter a key.'); return; }
  serpKey = val;
  localStorage.setItem('serpapi_key', val);
  updateKeyUI();
  showKeyStatus('ok', '✓ Key saved. You can now search for real businesses.');
  toast('API key saved!', 'success');
}

function showKeyStatus(type, msg) {
  const el = document.getElementById('keyStatus');
  el.className = 'key-status ' + type;
  el.textContent = msg;
}

function updateKeyUI() {
  const dot = document.getElementById('keyDot');
  const lbl = document.getElementById('keyLabel');
  if (serpKey) {
    dot.className = 'key-dot ok';
    lbl.textContent = 'Key ✓';
  } else {
    dot.className = 'key-dot';
    lbl.textContent = 'No Key';
  }
}
