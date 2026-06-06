// ── Detail Modal ────────────────────────────────────────────────
let currentBiz = null;
let lastPromptText = '';

function openDetail(idx) {
  currentBiz = allResults[idx];
  const b    = currentBiz;
  const sc   = b._score;
  const scCls = scoreClass(sc);

  const photosHtml = (b.images && b.images.length > 0)
    ? `<div class="modal-photos">${
        b.images.slice(0, 6).map(p =>
          `<img class="modal-photo" src="${esc(p.thumbnail || p)}" alt="" onerror="this.style.display='none'"/>`
        ).join('')
      }</div>`
    : b.thumbnail
      ? `<div class="modal-photos"><img class="modal-photo" src="${esc(b.thumbnail)}" alt=""/></div>`
      : '';

  const opps    = buildOpportunities(b);
  const factors = buildScoreFactors(b);
  const bizIdx  = allResults.indexOf(b);

  document.getElementById('detailContent').innerHTML = `
    <div class="modal-header">
      <button class="modal-close" onclick="closeDetail()">✕</button>
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:4px">
        <div style="flex:1">
          <h2 style="font-size:22px;font-weight:700;margin-bottom:4px">${esc(b.title)}</h2>
          <span style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">${esc(b._category)}</span>
        </div>
        <span class="website-badge ${b._hasWebsite?'has':'none'}" style="font-size:12px;padding:6px 14px">
          <span class="badge-dot"></span>
          ${b._hasWebsite ? 'Has Website' : 'No Website'}
        </span>
      </div>
    </div>
    ${photosHtml}
    <div class="modal-body">
      <div class="detail-grid">
        ${b.address  ? `<div class="detail-item"><div class="detail-label">Address</div><div class="detail-value">${esc(b.address)}</div></div>` : ''}
        ${b.phone    ? `<div class="detail-item"><div class="detail-label">Phone</div><div class="detail-value"><a href="tel:${esc(b.phone)}">${esc(b.phone)}</a></div></div>` : ''}
        ${b.rating != null ? `<div class="detail-item"><div class="detail-label">Rating</div><div class="detail-value">${ratingStars(b.rating)} ${b.rating.toFixed(1)} <span style="color:var(--muted);font-size:12px">(${(b.reviews||0).toLocaleString()} reviews)</span></div></div>` : ''}
        ${b.website  ? `<div class="detail-item"><div class="detail-label">Website</div><div class="detail-value"><a href="${esc(b.website)}" target="_blank">${esc(b.website)}</a></div></div>` : ''}
        ${b.place_id ? `<div class="detail-item"><div class="detail-label">Google Maps</div><div class="detail-value"><a href="https://maps.google.com/?place_id=${esc(b.place_id)}" target="_blank">Open in Maps ↗</a></div></div>` : ''}
      </div>

      <div class="score-section">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div>
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:2px">Lead Score</div>
            <div class="score-big ${scCls}">${sc}<span style="font-size:20px">/100</span></div>
          </div>
          <div style="font-size:13px;color:var(--muted);text-align:right;max-width:160px">
            ${sc >= 70 ? '🔥 High priority lead' : sc >= 40 ? '⚡ Good opportunity' : 'Low priority'}
          </div>
        </div>
        <div class="score-bar-wrap">
          <div class="score-bar ${scCls}" style="width:${sc}%"></div>
        </div>
        <div class="score-factors">
          ${factors.map(f => `
            <div class="factor-row">
              <span class="factor-label">${f.label}</span>
              <span class="factor-val ${f.positive?'positive':'neutral'}">${f.val}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="opportunity-box">
        <h4>💡 Website Opportunity Analysis</h4>
        <ul>${opps.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
      </div>

      <div class="modal-actions">
        <button class="btn-primary" onclick="openPromptFor(${bizIdx})">✨ Generate AI Prompt</button>
        ${b.phone    ? `<button class="btn-secondary" onclick="copyToClipboard('${esc(b.phone)}','Phone copied!')">📋 Copy Phone</button>` : ''}
        ${b.place_id ? `<a class="btn-secondary" href="https://maps.google.com/?place_id=${esc(b.place_id)}" target="_blank">🗺️ Maps</a>` : ''}
        <button class="btn-secondary" onclick="exportSingleJSON()">⬇ Export JSON</button>
      </div>
    </div>
  `;

  document.getElementById('detailModal').classList.remove('hidden');
}

function closeDetail() {
  document.getElementById('detailModal').classList.add('hidden');
}

// ── Prompt Modal ────────────────────────────────────────────────
function openPromptFor(idx) {
  currentBiz = allResults[idx];
  closeDetail();

  document.getElementById('promptContent').innerHTML = `
    <div class="modal-header" style="padding:24px 24px 16px">
      <button class="modal-close" onclick="closePrompt()">✕</button>
      <div class="ai-tag">✨ AI via Pollinations.ai</div>
      <h2 style="font-size:18px;font-weight:700;margin-bottom:4px">Website Prompt Generator</h2>
      <p style="font-size:13px;color:var(--muted)">Generating prompt for <strong>${esc(currentBiz.title)}</strong> using real business data.</p>
    </div>
    <div class="modal-body">
      <div id="promptOutputWrap">
        <div class="prompt-loading"><div class="spinner"></div> Calling AI...</div>
      </div>
      <div class="modal-actions" id="promptActions" style="display:none">
        <button class="btn-primary" onclick="copyPrompt()">📋 Copy</button>
        <button class="btn-secondary" onclick="downloadPromptTXT()">⬇ Download TXT</button>
        <button class="btn-secondary" onclick="retryPrompt()">🔄 Regenerate</button>
      </div>
    </div>
  `;

  document.getElementById('promptModal').classList.remove('hidden');
  runPromptGeneration();
}

async function runPromptGeneration() {
  const b = currentBiz;
  try {
    const text = await generateAIPrompt(b);
    lastPromptText = text;
    document.getElementById('promptOutputWrap').innerHTML =
      `<div class="prompt-output">${esc(text)}</div>`;
  } catch (err) {
    // Fallback: local generation
    lastPromptText = buildLocalPrompt(b);
    document.getElementById('promptOutputWrap').innerHTML = `
      <div style="font-size:11px;color:var(--muted);margin-bottom:8px">⚠ AI unavailable — generated locally from real business data</div>
      <div class="prompt-output">${esc(lastPromptText)}</div>
    `;
  }
  document.getElementById('promptActions').style.display = 'flex';
}

function retryPrompt() {
  document.getElementById('promptOutputWrap').innerHTML =
    `<div class="prompt-loading"><div class="spinner"></div> Regenerating...</div>`;
  document.getElementById('promptActions').style.display = 'none';
  runPromptGeneration();
}

function buildLocalPrompt(b) {
  return `# Website Creation Prompt — ${b.title}

## Project Overview
Build a professional website for "${b.title}", a ${b._category.toLowerCase()} located at ${b.address || 'local area'}.
${b.rating ? `This business has a ${b.rating.toFixed(1)}/5 rating with ${b.reviews || 0} reviews.` : ''}
${!b._hasWebsite ? 'Currently has NO website — this is their first web presence.' : ''}

## Pages Required
1. Home — Hero section, tagline, primary CTA
2. Services — Detailed service list with descriptions
3. About — Business story, team, values
4. Contact — Form, phone, address, Google Maps, hours
5. Reviews — Showcase Google ratings and testimonials

## Design Direction
- Business: ${b._category}
- Tone: Professional, trustworthy, local community feel
- Mobile-first responsive
- Clear CTAs above the fold
- Fast-loading (Lighthouse 90+)

## Key Features
- Click-to-call button on mobile: ${b.phone || 'add phone number'}
- Google Maps embed for location
- Contact form (name, email, message)
- Business hours display
- Google review highlights (${b.rating ? b.rating.toFixed(1) + '★' : 'N/A'})
${/barber|salon|spa|dental|gym/i.test(b._category) ? '- Online appointment booking' : ''}
${/restaurant|bakery|coffee|hotel/i.test(b._category) ? '- Menu/offerings section with photos' : ''}

## SEO
- Title: "${b.title} | ${b._category} | ${b.address ? b.address.split(',').slice(1,3).join(',').trim() : 'Local'}"
- Meta description targeting local ${b._category.toLowerCase()} searches
- Local Business JSON-LD schema
- Google Business Profile integration

## CTAs
- Primary: "Book Now" / "Call Us" / "Get a Quote"
- Secondary: "See Our Services" / "Get Directions"
- Sticky mobile call button

## Target Audience
Local customers searching for ${b._category.toLowerCase()} services nearby.

## Tech Stack
Next.js or plain HTML/CSS/JS · Tailwind CSS · Formspree for forms · Google Analytics 4

---
Generated by LeadSpy | Phone: ${b.phone || 'N/A'} | Rating: ${b.rating ? b.rating.toFixed(1) + '/5' : 'N/A'} | Reviews: ${b.reviews || 0}`;
}

function copyPrompt() {
  navigator.clipboard.writeText(lastPromptText);
  toast('Prompt copied!', 'success');
}

function downloadPromptTXT() {
  const name = (currentBiz?.title || 'business').replace(/\s+/g, '-').toLowerCase();
  downloadFile(lastPromptText, `prompt-${name}.txt`, 'text/plain');
  toast('Downloaded!', 'success');
}

function closePrompt() {
  document.getElementById('promptModal').classList.add('hidden');
}

function copyToClipboard(text, msg) {
  navigator.clipboard.writeText(text);
  toast(msg || 'Copied!', 'success');
}
