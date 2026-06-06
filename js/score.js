// ── Lead Scoring (0–100) ────────────────────────────────────────
function calcLeadScore(biz) {
  let score = 0;
  const hasWebsite = !!(biz.website);
  const rating     = biz.rating ?? null;
  const reviews    = biz.reviews ?? 0;

  if (!hasWebsite)    score += 40;
  if (reviews >= 200) score += 20;
  else if (reviews >= 100) score += 15;
  else if (reviews >= 50)  score += 10;
  else if (reviews >= 20)  score += 7;
  else if (reviews >= 5)   score += 4;

  if (rating >= 4.5)      score += 20;
  else if (rating >= 4.0) score += 15;
  else if (rating >= 3.5) score += 10;
  else if (rating >= 3.0) score += 5;

  if (reviews >= 200) score += 10;
  else if (reviews >= 50) score += 5;

  if (hasWebsite) score = Math.min(score, 45);

  return Math.min(100, score);
}

function scoreClass(s) {
  if (s >= 70) return 'high';
  if (s >= 40) return 'med';
  return 'low';
}

function buildScoreFactors(b) {
  const factors = [];
  factors.push({
    label: 'Website',
    val: b._hasWebsite ? 'Has website (−40 max)' : 'No website (+40)',
    positive: !b._hasWebsite
  });
  if (b.rating != null) {
    const pts = b.rating >= 4.5 ? 20 : b.rating >= 4.0 ? 15 : b.rating >= 3.5 ? 10 : 5;
    factors.push({ label: `Rating (${b.rating.toFixed(1)}★)`, val: `+${pts}`, positive: true });
  }
  if (b.reviews) {
    const pts = b.reviews >= 200 ? 20 : b.reviews >= 100 ? 15 : b.reviews >= 50 ? 10 : b.reviews >= 20 ? 7 : 4;
    factors.push({ label: `Reviews (${b.reviews})`, val: `+${pts}`, positive: true });
  }
  if (b.reviews >= 200) factors.push({ label: 'Popularity bonus', val: '+10', positive: true });
  return factors;
}

function buildOpportunities(b) {
  const opps = [];
  if (!b._hasWebsite) {
    opps.push('No website detected — this business is invisible online and likely losing customers to competitors.');
    if (b.reviews >= 20) opps.push(`With ${b.reviews}+ reviews, this is a proven business with real customers who need a web presence.`);
    if (b.rating >= 4.0) opps.push(`Strong ${b.rating.toFixed(1)}★ rating means high customer satisfaction — a website would amplify this.`);
    opps.push('Without a website: no online booking, no contact form, no SEO visibility.');
    opps.push('Opportunity: landing page with services, hours, contact info, and Google Maps embed.');
  } else {
    opps.push('Business has a website — evaluate quality, mobile-friendliness, and SEO before pitching a redesign.');
    opps.push('Potential upsell: redesign, SEO audit, booking system, or social media integration.');
    if (b.rating >= 4.0) opps.push('High rating — suggest adding review widgets and testimonials to their existing site.');
  }
  return opps;
}

function enrichBiz(r, category) {
  const hasWebsite = !!(r.website);
  const score      = calcLeadScore(r);
  return { ...r, _hasWebsite: hasWebsite, _score: score, _category: category };
}
