// ── SerpApi Integration ─────────────────────────────────────────
async function fetchBusinesses({ city, state, country, category, limit }) {
  if (!serpKey) throw new Error('NO_KEY');

  const locationParts = [city, state].filter(Boolean);
  const query         = `${category} in ${locationParts.join(', ')}`;

  const params = new URLSearchParams({
    engine:  'google_maps',
    q:       query,
    type:    'search',
    hl:      'en',
    gl:      country,
    api_key: serpKey,
  });

  const res = await fetch(`https://serpapi.com/search?${params}`);
  const data = await res.json();

  if (data.error) throw new Error(data.error);

  const raw = data.local_results || [];
  return raw.slice(0, limit).map(r => enrichBiz(r, category));
}

// ── Pollinations AI (prompt generator) ─────────────────────────
async function generateAIPrompt(biz) {
  const bizData = `
Business Name: ${biz.title}
Category: ${biz._category}
Rating: ${biz.rating != null ? biz.rating + '/5' : 'N/A'}
Reviews: ${biz.reviews || 0}
Address: ${biz.address || 'N/A'}
Phone: ${biz.phone || 'N/A'}
Website: ${biz._hasWebsite ? biz.website : 'NONE — no website exists'}
Lead Score: ${biz._score}/100
  `.trim();

  const system = `You are an expert web developer and digital marketing strategist. Generate detailed, actionable website creation prompts for AI coding tools like Lovable, Bolt, Claude, Cursor, Replit, and V0. Your prompts must be specific, technical, and ready to paste directly.`;

  const user = `Using this REAL business data, generate a comprehensive website creation prompt:

${bizData}

Include:
1. Project overview and business context
2. Website structure (all pages needed)
3. Design direction (colors, fonts, mood)
4. Key features (contact form, booking, services, gallery, etc.)
5. SEO suggestions specific to this business and location
6. Call-to-action recommendations
7. Target audience description
8. Mobile-first requirements
9. Integrations (Google Maps, reviews widget, etc.)

Format as a ready-to-use prompt for Lovable/Bolt/Claude/Cursor. Be specific. Use the real business name and location throughout.`;

  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user }
      ],
      max_tokens: 1200,
    })
  });

  if (!res.ok) throw new Error(`AI API error ${res.status}`);

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  if (!text) throw new Error('Empty AI response');
  return text;
}
