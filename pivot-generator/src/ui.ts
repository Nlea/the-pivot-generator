export function renderUI(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Pivot Generator</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0a;
      color: #f0f0f0;
      min-height: 100vh;
      padding: 2rem 1rem;
    }
    .container { max-width: 720px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 3rem; }
    h1 { font-size: 2.5rem; font-weight: 800; letter-spacing: -1px; }
    h1 span { color: #ff4500; }
    .subtitle { color: #888; margin-top: 0.5rem; font-size: 1rem; }

    form { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
    label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 0.25rem; display: block; }
    textarea, input {
      width: 100%;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      color: #f0f0f0;
      font-size: 0.95rem;
      padding: 0.75rem 1rem;
      resize: vertical;
      font-family: inherit;
    }
    textarea:focus, input:focus { outline: none; border-color: #ff4500; }
    textarea { min-height: 100px; }
    button {
      background: #ff4500;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0.85rem 2rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #e03d00; }
    button:disabled { background: #444; cursor: not-allowed; }

    #status { text-align: center; color: #888; font-size: 0.9rem; min-height: 1.5rem; margin-bottom: 1rem; }

    .pivots { display: flex; flex-direction: column; gap: 1rem; }
    .pivot-card {
      background: #1a1a1a;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      border-left: 4px solid var(--heat-color);
      transition: transform 0.15s;
    }
    .pivot-card:hover { transform: translateX(4px); }

    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
    .card-title { font-weight: 700; font-size: 1.05rem; }
    .heat { font-size: 1.2rem; letter-spacing: -2px; }

    .card-desc { color: #ccc; font-size: 0.9rem; line-height: 1.5; margin-bottom: 0.5rem; }
    .card-rationale { color: #888; font-size: 0.8rem; font-style: italic; margin-bottom: 0.75rem; }

    .card-footer { display: flex; align-items: center; justify-content: space-between; }
    .inspired-by { font-size: 0.75rem; color: #555; }
    .hubble-link {
      font-size: 0.75rem;
      background: #1e1e2e;
      border: 1px solid #444;
      border-radius: 20px;
      padding: 0.3rem 0.75rem;
      color: #a0a0ff;
      text-decoration: none;
      white-space: nowrap;
    }
    .hubble-link:hover { border-color: #a0a0ff; }

    .desperation-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--heat-color);
      margin-bottom: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>The Pivot <span>Generator</span></h1>
      <p class="subtitle">Describe your failing startup. We'll tell you exactly how desperate you should be.</p>
    </header>

    <form id="pivotForm">
      <div>
        <label for="description">What does your startup do?</label>
        <textarea id="description" name="description" placeholder="e.g. B2B expense tracking SaaS for SMBs — we sync credit card transactions and auto-categorise spend..." required></textarea>
      </div>
      <div>
        <label for="failing">What's not working?</label>
        <textarea id="failing" name="failing" placeholder="e.g. Nobody's converting past the free tier. We have 800 users but 3 paying customers..." required style="min-height: 70px;"></textarea>
      </div>
      <button type="submit" id="submitBtn">Generate Pivots 🌶️</button>
    </form>

    <div id="status"></div>
    <div id="results" class="pivots"></div>
  </div>

  <script>
    const HEAT_COLORS = ['#4caf50', '#8bc34a', '#ffc107', '#ff5722', '#f44336']
    const HEAT_LABELS = ['Sensible', 'Reasonable', 'Bold', 'Desperate', 'Unhinged']
    const ADVISOR_HUBBLE = {
      'GTM': 'go-to-market',
      'Product': 'product',
      'Finance': 'finance',
      'Growth': 'growth',
      'Technical': 'technical',
      'Fundraising': 'fundraising',
    }

    function chillies(n) {
      return '🌶️'.repeat(n)
    }

    function renderPivot(pivot) {
      const color = HEAT_COLORS[pivot.desperationLevel - 1]
      const label = HEAT_LABELS[pivot.desperationLevel - 1]
      const hubbleQuery = encodeURIComponent(ADVISOR_HUBBLE[pivot.advisorType] || pivot.advisorType)
      const card = document.createElement('div')
      card.className = 'pivot-card'
      card.style.setProperty('--heat-color', color)
      card.innerHTML = \`
        <div class="desperation-label">\${label}</div>
        <div class="card-header">
          <div class="card-title">\${pivot.title}</div>
          <div class="heat" title="Desperation level \${pivot.desperationLevel}/5">\${chillies(pivot.desperationLevel)}</div>
        </div>
        <div class="card-desc">\${pivot.description}</div>
        <div class="card-rationale">💡 \${pivot.rationale}</div>
        <div class="card-footer">
          <span class="inspired-by">\${pivot.inspiredBy ? '✦ à la ' + pivot.inspiredBy : ''}</span>
          <a class="hubble-link" href="https://hubble.social/search?q=\${hubbleQuery}" target="_blank" rel="noopener">
            Find a \${pivot.advisorType} advisor →
          </a>
        </div>
      \`
      return card
    }

    document.getElementById('pivotForm').addEventListener('submit', async (e) => {
      e.preventDefault()
      const btn = document.getElementById('submitBtn')
      const status = document.getElementById('status')
      const results = document.getElementById('results')

      btn.disabled = true
      results.innerHTML = ''
      status.textContent = 'Analysing your startup... 🔍'

      const messages = [
        'Querying the graveyard of failed startups...',
        'Consulting the graph of pivots past...',
        'Generating increasingly unhinged suggestions...',
        'Almost done...',
      ]
      let msgIndex = 0
      const msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length
        status.textContent = messages[msgIndex]
      }, 2000)

      try {
        const res = await fetch('/pivot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: document.getElementById('description').value,
            failing: document.getElementById('failing').value,
          }),
        })

        if (!res.ok) throw new Error(await res.text())
        const { pivots } = await res.json()

        clearInterval(msgInterval)
        status.textContent = \`\${pivots.length} pivots generated. Good luck. 🫡\`
        pivots.forEach((p) => results.appendChild(renderPivot(p)))
      } catch (err) {
        clearInterval(msgInterval)
        status.textContent = 'Something went wrong: ' + err.message
      } finally {
        btn.disabled = false
      }
    })
  </script>
</body>
</html>`
}
