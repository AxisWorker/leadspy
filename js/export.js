// ── Export functions ─────────────────────────────────────────────
function exportJSON() {
  const data = filteredResults.map(bizToPlain);
  downloadFile(JSON.stringify(data, null, 2), 'leadspy-results.json', 'application/json');
  toast('JSON exported!', 'success');
}

function exportCSV() {
  const headers = ['Name','Category','Rating','Reviews','Address','Phone','Website','Has Website','Lead Score'];
  const rows = filteredResults.map(b => [
    q(b.title), q(b._category), b.rating || '', b.reviews || 0,
    q(b.address || ''), q(b.phone || ''), q(b.website || ''),
    b._hasWebsite ? 'Yes' : 'No', b._score,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(csv, 'leadspy-results.csv', 'text/csv');
  toast('CSV exported!', 'success');
}

function exportSingleJSON() {
  if (!currentBiz) return;
  downloadFile(
    JSON.stringify(bizToPlain(currentBiz), null, 2),
    `${(currentBiz.title || 'biz').replace(/\s+/g, '-').toLowerCase()}.json`,
    'application/json'
  );
  toast('Exported!', 'success');
}

function bizToPlain(b) {
  return {
    name: b.title,
    category: b._category,
    rating: b.rating,
    reviews: b.reviews,
    address: b.address,
    phone: b.phone,
    website: b.website || null,
    hasWebsite: b._hasWebsite,
    leadScore: b._score,
    mapsLink: b.place_id ? `https://maps.google.com/?place_id=${b.place_id}` : null,
  };
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function q(s) {
  return '"' + String(s).replace(/"/g, '""') + '"';
}
