export function renderUI(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Pivot Generator</title>
  <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0a;
      color: #f0f0f0;
      min-height: 100vh;
      padding: 2rem 1rem 4rem;
    }
    .container { max-width: 780px; margin: 0 auto; }
    .container-wide { max-width: 1000px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 3rem; }
    h1 { font-size: 2.5rem; font-weight: 800; letter-spacing: -1px; }
    h1 span { color: #ff4500; }
    .subtitle { color: #888; margin-top: 0.5rem; font-size: 1rem; }

    form { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
    label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 0.25rem; display: block; }
    textarea {
      width: 100%;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      color: #f0f0f0;
      font-size: 0.95rem;
      padding: 0.75rem 1rem;
      resize: vertical;
      font-family: inherit;
      min-height: 80px;
    }
    textarea:focus { outline: none; border-color: #ff4500; }
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

    #status {
      text-align: center;
      color: #888;
      font-size: 0.9rem;
      min-height: 1.5rem;
      margin-bottom: 1rem;
    }

    /* ── Exploration graph ── */
    #explorationSection { display: none; margin-bottom: 3rem; }
    .exploration-header {
      display: flex;
      align-items: baseline;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }
    .exploration-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #555;
    }
    .exploration-stat {
      font-size: 0.8rem;
      color: #ff4500;
      font-weight: 600;
    }
    #treeContainer {
      background: #0d0d0d;
      border: 1px solid #1e1e1e;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
    }
    #treeContainer svg { display: block; width: 100%; }
    .tree-tooltip {
      position: absolute;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 6px;
      padding: 0.4rem 0.75rem;
      font-size: 0.75rem;
      color: #ddd;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
      max-width: 200px;
      z-index: 10;
    }
    .tree-legend {
      display: flex;
      gap: 1.25rem;
      padding: 0.6rem 1rem;
      border-top: 1px solid #1a1a1a;
      flex-wrap: wrap;
    }
    .legend-item { display: flex; align-items: center; gap: 0.35rem; font-size: 0.7rem; color: #555; }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .legend-star {
      width: 10px; height: 10px; flex-shrink: 0;
      background: #ffd700;
      clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    }

    /* ── Result cards ── */
    .results-header {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #555;
      margin-bottom: 1.25rem;
    }
    .pivots { display: flex; flex-direction: column; gap: 1.25rem; }
    .pivot-card {
      background: #1a1a1a;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      border-left: 4px solid var(--heat-color);
    }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
    .card-title { font-weight: 700; font-size: 1.05rem; }
    .heat { font-size: 1.2rem; letter-spacing: -2px; }
    .desperation-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--heat-color); margin-bottom: 0.25rem; }
    .card-desc { color: #ccc; font-size: 0.9rem; line-height: 1.5; margin-bottom: 0.5rem; }
    .card-rationale { color: #888; font-size: 0.8rem; font-style: italic; margin-bottom: 0.75rem; }

    .graph-section { margin: 0.75rem 0; }
    .graph-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 0.4rem; }
    .graph-wrap { background: #111; border-radius: 8px; overflow: hidden; border: 1px solid #222; }
    .graph-legend { display: flex; gap: 1rem; padding: 0.4rem 0.75rem; border-top: 1px solid #222; flex-wrap: wrap; }

    .card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 0.75rem; }
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
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>The Pivot <span>Generator</span></h1>
      <p class="subtitle">Describe your failing startup. We'll explore 200+ pivot paths and surface the best 5.</p>
    </header>

    <form id="pivotForm">
      <div>
        <label for="description">What does your startup do?</label>
        <textarea id="description" placeholder="e.g. B2B expense tracking SaaS for SMBs — we sync credit card transactions and auto-categorise spend..." required></textarea>
      </div>
      <div>
        <label for="failing">What's not working?</label>
        <textarea id="failing" placeholder="e.g. Nobody's converting past the free tier. We have 800 users but 3 paying customers..." required style="min-height: 60px;"></textarea>
      </div>
      <button type="submit" id="submitBtn">Explore Pivot Space 🌶️</button>
    </form>

    <div id="status"></div>
  </div>

  <div class="container-wide">
    <div id="explorationSection">
      <div class="exploration-header">
        <span class="exploration-title">Pivot exploration graph</span>
        <span class="exploration-stat" id="explorationStat"></span>
      </div>
      <div id="treeContainer">
        <div class="tree-tooltip" id="treeTooltip"></div>
      </div>
      <div class="tree-legend">
        <span class="legend-item"><span class="legend-dot" style="background:#ff4500"></span>root direction (L1)</span>
        <span class="legend-item"><span class="legend-dot" style="background:#4a9eff"></span>sub-direction (L2)</span>
        <span class="legend-item"><span class="legend-dot" style="background:#3a3a3a"></span>variant (L3)</span>
        <span class="legend-item"><span class="legend-star"></span>selected (top 5)</span>
      </div>
    </div>
  </div>

  <div class="container" id="resultsContainer" style="display:none">
    <div class="results-header" id="resultsHeader"></div>
    <div id="results" class="pivots"></div>
  </div>

  <script>
    const HEAT_COLORS = ['#4caf50', '#8bc34a', '#ffc107', '#ff5722', '#f44336'];
    const HEAT_LABELS = ['Sensible', 'Reasonable', 'Bold', 'Desperate', 'Unhinged'];
    const ADVISOR_HUBBLE = {
      GTM: 'go-to-market', Product: 'product', Finance: 'finance',
      Growth: 'growth', Technical: 'technical', Fundraising: 'fundraising'
    };
    const NODE_COLORS = { company: '#ff4500', asset: '#4a9eff', from: '#888888', to: '#4caf50' };
    const NODE_RADII = { company: 16, asset: 10, from: 12, to: 12 };

    // ── Small pattern graph per card ─────────────────────────────────────────
    function renderPatternGraph(containerId, pattern) {
      var wrap = document.getElementById(containerId);
      if (!wrap) return;
      var W = 680, H = 180;
      var nodes = [{ id: pattern.company, type: 'company', label: pattern.company }];
      pattern.sharedAssets.forEach(function(a) {
        nodes.push({ id: a, type: 'asset', label: a.replace(/-/g, ' ') });
      });
      nodes.push({ id: '__from__', type: 'from', label: pattern.fromDomain.replace(/-/g, ' ') });
      nodes.push({ id: '__to__', type: 'to', label: pattern.toDomain.replace(/-/g, ' ') });

      var links = [];
      pattern.sharedAssets.forEach(function(a) {
        links.push({ source: a, target: pattern.company, type: 'asset' });
      });
      links.push({ source: '__from__', target: pattern.company, type: 'from' });
      links.push({ source: pattern.company, target: '__to__', type: 'to' });

      var svg = d3.select('#' + containerId)
        .append('svg')
        .attr('width', '100%').attr('height', H)
        .attr('viewBox', '0 0 ' + W + ' ' + H);

      var sim = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(function(d) { return d.id; }).distance(75))
        .force('charge', d3.forceManyBody().strength(-220))
        .force('center', d3.forceCenter(W / 2, H / 2))
        .force('collide', d3.forceCollide().radius(function(d) { return NODE_RADII[d.type] + 18; }));

      var link = svg.append('g').selectAll('line').data(links).join('line')
        .attr('stroke', function(d) {
          if (d.type === 'asset') return '#4a9eff';
          if (d.type === 'from') return '#888888';
          return '#4caf50';
        })
        .attr('stroke-opacity', 0.4).attr('stroke-width', function(d) { return d.type === 'asset' ? 1 : 1.5; })
        .attr('stroke-dasharray', function(d) { return d.type === 'asset' ? '4 3' : null; });

      var node = svg.append('g').selectAll('circle').data(nodes).join('circle')
        .attr('r', function(d) { return NODE_RADII[d.type]; })
        .attr('fill', function(d) { return NODE_COLORS[d.type]; })
        .attr('fill-opacity', 0.85).attr('stroke', '#0a0a0a').attr('stroke-width', 2);

      var label = svg.append('g').selectAll('text').data(nodes).join('text')
        .text(function(d) { return d.label; })
        .attr('font-size', function(d) { return d.type === 'company' ? 10 : 8.5; })
        .attr('font-weight', function(d) { return d.type === 'company' ? 'bold' : 'normal'; })
        .attr('fill', '#d0d0d0').attr('text-anchor', 'middle').attr('pointer-events', 'none');

      sim.on('tick', function() {
        link
          .attr('x1', function(d) { return d.source.x; }).attr('y1', function(d) { return d.source.y; })
          .attr('x2', function(d) { return d.target.x; }).attr('y2', function(d) { return d.target.y; });
        node
          .attr('cx', function(d) { d.x = Math.max(NODE_RADII[d.type] + 4, Math.min(W - NODE_RADII[d.type] - 4, d.x)); return d.x; })
          .attr('cy', function(d) { d.y = Math.max(NODE_RADII[d.type] + 4, Math.min(H - NODE_RADII[d.type] - 4, d.y)); return d.y; });
        label
          .attr('x', function(d) { return d.x; })
          .attr('y', function(d) { return d.y + NODE_RADII[d.type] + 11; });
      });
    }

    // ── Big exploration tree graph ────────────────────────────────────────────
    function renderExplorationGraph(nodesData, linksData) {
      var container = document.getElementById('treeContainer');
      var tooltip = document.getElementById('treeTooltip');
      var W = container.clientWidth || 960;
      var H = Math.min(600, Math.max(400, W * 0.6));
      var cx = W / 2, cy = H / 2;

      // Radii for each level
      var RADII = { 0: 0, 1: Math.min(120, W * 0.13), 2: Math.min(260, W * 0.27), 3: Math.min(420, W * 0.44) };

      // Add virtual root node
      var rootNode = { id: '__root__', level: 0, selected: false, title: 'Your Startup', fx: cx, fy: cy };
      var rootLinks = nodesData.filter(function(n) { return n.level === 1; })
        .map(function(n) { return { source: '__root__', target: n.id }; });

      var nodes = [rootNode].concat(nodesData.map(function(n) { return Object.assign({}, n); }));
      var links = rootLinks.concat(linksData.map(function(l) { return Object.assign({}, l); }));

      var svg = d3.select('#treeContainer').append('svg')
        .attr('width', W).attr('height', H)
        .attr('viewBox', '0 0 ' + W + ' ' + H);

      // Faint ring guides
      [1, 2, 3].forEach(function(lvl) {
        svg.append('circle')
          .attr('cx', cx).attr('cy', cy).attr('r', RADII[lvl])
          .attr('fill', 'none').attr('stroke', '#1a1a1a').attr('stroke-width', 1);
      });

      var sim = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(function(d) { return d.id; }).distance(function(d) {
          var sl = d.source.level !== undefined ? d.source.level : 0;
          var tl = d.target.level !== undefined ? d.target.level : 0;
          return (RADII[tl] - RADII[sl]) * 0.65;
        }).strength(0.6))
        .force('radial', d3.forceRadial(function(d) { return RADII[d.level] || 0; }, cx, cy).strength(function(d) {
          return d.id === '__root__' ? 0 : 0.92;
        }))
        .force('charge', d3.forceManyBody().strength(function(d) {
          if (d.level === 3) return -4;
          if (d.level === 2) return -18;
          return -60;
        }))
        .force('collide', d3.forceCollide().radius(function(d) {
          if (d.level === 3) return 4;
          if (d.level === 2) return 8;
          return 16;
        }).strength(0.7))
        .stop();

      // Run simulation to convergence (headless — no animation lag)
      var n = Math.ceil(Math.log(sim.alphaMin()) / Math.log(1 - sim.alphaDecay()));
      for (var i = 0; i < Math.min(n, 350); i++) sim.tick();

      // Draw links
      var linkSel = svg.append('g').selectAll('line').data(links).join('line')
        .attr('stroke', function(d) {
          var tl = d.target.level !== undefined ? d.target.level : (typeof d.target === 'object' ? d.target.level : 0);
          if (tl <= 1) return '#ff4500';
          if (tl === 2) return '#4a9eff';
          return '#2a2a2a';
        })
        .attr('stroke-opacity', function(d) {
          var tl = d.target.level !== undefined ? d.target.level : (typeof d.target === 'object' ? d.target.level : 0);
          if (tl <= 1) return 0.5;
          if (tl === 2) return 0.25;
          return 0.12;
        })
        .attr('stroke-width', function(d) {
          var tl = d.target.level !== undefined ? d.target.level : (typeof d.target === 'object' ? d.target.level : 0);
          if (tl <= 1) return 1.5;
          if (tl === 2) return 1;
          return 0.5;
        })
        .attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });

      // Draw nodes
      function nodeRadius(d) {
        if (d.level === 0) return 10;
        if (d.level === 1) return 9;
        if (d.level === 2) return 5;
        return 2.5;
      }
      function nodeColor(d) {
        if (d.selected) return '#ffd700';
        if (d.level === 0) return '#ff4500';
        if (d.level === 1) return '#ff4500';
        if (d.level === 2) return '#4a9eff';
        return '#3a3a3a';
      }

      // Glow filter for selected nodes
      var defs = svg.append('defs');
      var glow = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
      glow.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
      var merge = glow.append('feMerge');
      merge.append('feMergeNode').attr('in', 'coloredBlur');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');

      var nodeSel = svg.append('g').selectAll('circle').data(nodes).join('circle')
        .attr('r', nodeRadius)
        .attr('fill', nodeColor)
        .attr('fill-opacity', function(d) { return d.level === 3 ? 0.7 : 0.9; })
        .attr('stroke', function(d) { return d.selected ? '#ffd700' : 'none'; })
        .attr('stroke-width', function(d) { return d.selected ? 2 : 0; })
        .attr('filter', function(d) { return d.selected ? 'url(#glow)' : null; })
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; })
        .style('cursor', function(d) { return d.level <= 2 ? 'pointer' : 'default'; });

      // Labels for L1 nodes
      svg.append('g').selectAll('text').data(nodes.filter(function(d) { return d.level === 1; })).join('text')
        .text(function(d) { return d.title.length > 22 ? d.title.slice(0, 20) + '…' : d.title; })
        .attr('font-size', 8)
        .attr('fill', '#888')
        .attr('text-anchor', 'middle')
        .attr('pointer-events', 'none')
        .attr('x', function(d) { return d.x; })
        .attr('y', function(d) { return d.y + nodeRadius(d) + 9; });

      // Tooltip on hover
      nodeSel.on('mousemove', function(event, d) {
        if (!d.title || d.level === 0) return;
        var rect = container.getBoundingClientRect();
        var mx = event.clientX - rect.left;
        var my = event.clientY - rect.top;
        tooltip.style.left = Math.min(mx + 10, W - 210) + 'px';
        tooltip.style.top = Math.max(my - 30, 0) + 'px';
        tooltip.textContent = d.title + (d.selected ? ' ★' : '');
        tooltip.style.opacity = '1';
      }).on('mouseleave', function() {
        tooltip.style.opacity = '0';
      });
    }

    // ── Card rendering ────────────────────────────────────────────────────────
    function renderPivot(pivot, patterns) {
      var color = HEAT_COLORS[pivot.desperationLevel - 1];
      var label = HEAT_LABELS[pivot.desperationLevel - 1];
      var hubbleQuery = encodeURIComponent(ADVISOR_HUBBLE[pivot.advisorType] || pivot.advisorType);
      var pattern = patterns && pivot.inspiredBy
        ? patterns.find(function(p) { return p.company === pivot.inspiredBy; })
        : null;

      var card = document.createElement('div');
      card.className = 'pivot-card';
      card.style.setProperty('--heat-color', color);

      var graphId = 'graph-' + pivot.id + '-' + Date.now();

      card.innerHTML =
        '<div class="desperation-label">' + label + '</div>' +
        '<div class="card-header">' +
          '<div class="card-title">' + pivot.title + '</div>' +
          '<div class="heat" title="Desperation level ' + pivot.desperationLevel + '/5">' + '🌶️'.repeat(pivot.desperationLevel) + '</div>' +
        '</div>' +
        '<div class="card-desc">' + pivot.description + '</div>' +
        '<div class="card-rationale">💡 ' + pivot.rationale + '</div>' +
        (pattern ? (
          '<div class="graph-section">' +
            '<div class="graph-label">Inspired by: ' + pattern.company + '</div>' +
            '<div class="graph-wrap">' +
              '<div id="' + graphId + '"></div>' +
              '<div class="graph-legend">' +
                '<span class="legend-item"><span class="legend-dot" style="background:#ff4500"></span>company</span>' +
                '<span class="legend-item"><span class="legend-dot" style="background:#4a9eff"></span>shared asset</span>' +
                '<span class="legend-item"><span class="legend-dot" style="background:#888"></span>pivoted from</span>' +
                '<span class="legend-item"><span class="legend-dot" style="background:#4caf50"></span>pivoted to</span>' +
              '</div>' +
            '</div>' +
          '</div>'
        ) : '') +
        '<div class="card-footer">' +
          '<span class="inspired-by">' + (pivot.inspiredBy ? '✦ à la ' + pivot.inspiredBy : '') + '</span>' +
          '<a class="hubble-link" href="https://hubble.social/search?q=' + hubbleQuery + '" target="_blank" rel="noopener">Find a ' + pivot.advisorType + ' advisor →</a>' +
        '</div>';

      return { card, graphId, pattern };
    }

    // ── Form submit ───────────────────────────────────────────────────────────
    document.getElementById('pivotForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      var btn = document.getElementById('submitBtn');
      var status = document.getElementById('status');
      var results = document.getElementById('results');
      var explorationSection = document.getElementById('explorationSection');
      var resultsContainer = document.getElementById('resultsContainer');

      btn.disabled = true;
      results.innerHTML = '';
      explorationSection.style.display = 'none';
      resultsContainer.style.display = 'none';
      d3.select('#treeContainer svg').remove();
      status.textContent = 'Analysing your startup DNA... 🔍';

      var messages = [
        'Extracting your core assets...',
        'Querying the Neo4j graveyard of failed startups...',
        'Generating 6 pivot directions...',
        'Branching each into 6 deeper options... (36 paths)',
        'Drilling one level deeper... (up to 216 paths)',
        'AI evaluating all pivot paths...',
        'Writing exploration tree to Neo4j graph database...',
        'Surfacing the top 5 moves...',
      ];
      var msgIndex = 0;
      var msgInterval = setInterval(function() {
        msgIndex = Math.min(msgIndex + 1, messages.length - 1);
        status.textContent = messages[msgIndex];
      }, 3500);

      try {
        var res = await fetch('/pivot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: document.getElementById('description').value,
            failing: document.getElementById('failing').value,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        var data = await res.json();

        clearInterval(msgInterval);

        // Show exploration graph
        explorationSection.style.display = 'block';
        document.getElementById('explorationStat').textContent =
          data.totalExplored + ' paths explored → ' + data.selected.length + ' selected';
        renderExplorationGraph(data.nodes, data.links);

        status.textContent = 'Explored ' + data.totalExplored + ' pivot paths. Top ' + data.selected.length + ' surfaced below. 🫡';

        // Show selected pivot cards
        resultsContainer.style.display = 'block';
        document.getElementById('resultsHeader').textContent =
          'Top ' + data.selected.length + ' pivots — selected from ' + data.totalExplored + ' explored';

        data.selected.forEach(function(pivot) {
          var rendered = renderPivot(pivot, data.patterns);
          results.appendChild(rendered.card);
          if (rendered.pattern) {
            requestAnimationFrame(function() { renderPatternGraph(rendered.graphId, rendered.pattern); });
          }
        });
      } catch (err) {
        clearInterval(msgInterval);
        status.textContent = 'Something went wrong: ' + err.message;
      } finally {
        btn.disabled = false;
      }
    });
  </script>
</body>
</html>`
}
