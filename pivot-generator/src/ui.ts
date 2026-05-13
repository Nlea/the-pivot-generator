export function renderUI(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Pivot Generator</title>
  <script src="https://cdn.jsdelivr.net/npm/d3@7"><\/script>
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
    .container-wide { max-width: 1040px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 3rem; }
    h1 { font-size: 2.5rem; font-weight: 800; letter-spacing: -1px; }
    h1 span { color: #ff4500; }
    .subtitle { color: #888; margin-top: 0.5rem; font-size: 1rem; }
    form { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
    label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 0.25rem; display: block; }
    textarea {
      width: 100%; background: #1a1a1a; border: 1px solid #333; border-radius: 8px;
      color: #f0f0f0; font-size: 0.95rem; padding: 0.75rem 1rem;
      resize: vertical; font-family: inherit; min-height: 80px;
    }
    textarea:focus { outline: none; border-color: #ff4500; }
    button {
      background: #ff4500; color: #fff; border: none; border-radius: 8px;
      padding: 0.85rem 2rem; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background 0.2s;
    }
    button:hover { background: #e03d00; }
    button:disabled { background: #444; cursor: not-allowed; }
    #status { text-align: center; color: #888; font-size: 0.9rem; min-height: 1.5rem; margin-bottom: 1rem; }

    /* exploration graph */
    #explorationSection { display: none; margin-bottom: 3rem; }
    .exploration-header { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 0.75rem; }
    .exploration-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #555; }
    .exploration-stat { font-size: 0.8rem; color: #ff4500; font-weight: 600; }
    #treeContainer { background: #0d0d0d; border: 1px solid #1e1e1e; border-radius: 12px; overflow: hidden; position: relative; }
    #treeContainer svg { display: block; width: 100%; }
    .tree-tooltip {
      position: absolute; background: #1a1a1a; border: 1px solid #333; border-radius: 6px;
      padding: 0.4rem 0.75rem; font-size: 0.75rem; color: #ddd; pointer-events: none;
      opacity: 0; transition: opacity 0.15s; max-width: 220px; z-index: 10;
    }
    .tree-legend { display: flex; gap: 1.25rem; padding: 0.6rem 1rem; border-top: 1px solid #1a1a1a; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 0.35rem; font-size: 0.7rem; color: #555; }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .legend-star {
      width: 10px; height: 10px; flex-shrink: 0; background: #ffd700;
      clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
    }

    /* cards */
    .results-header { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #555; margin-bottom: 1.25rem; }
    .pivots { display: flex; flex-direction: column; gap: 1.25rem; }
    .pivot-card {
      background: #1a1a1a; border-radius: 12px; padding: 1.25rem 1.5rem;
      border-left: 4px solid var(--heat-color);
      animation: fadeSlideIn 0.4s ease;
    }
    @keyframes fadeSlideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
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
      font-size: 0.75rem; background: #1e1e2e; border: 1px solid #444; border-radius: 20px;
      padding: 0.3rem 0.75rem; color: #a0a0ff; text-decoration: none; white-space: nowrap;
    }
    .hubble-link:hover { border-color: #a0a0ff; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>The Pivot <span>Generator</span></h1>
      <p class="subtitle">Describe your failing startup. We explore 200+ pivot paths live and surface the best 5.</p>
    </header>
    <form id="pivotForm">
      <div>
        <label for="description">What does your startup do?</label>
        <textarea id="description" placeholder="e.g. B2B expense tracking SaaS for SMBs — we sync credit card transactions and auto-categorise spend..." required></textarea>
      </div>
      <div>
        <label for="failing">What's not working?</label>
        <textarea id="failing" placeholder="e.g. Nobody's converting past the free tier. We have 800 users but 3 paying customers..." required style="min-height:60px"></textarea>
      </div>
      <button type="submit" id="submitBtn">Explore Pivot Space 🌶️</button>
    </form>
    <div id="status"></div>
  </div>

  <div class="container-wide">
    <div id="explorationSection">
      <div class="exploration-header">
        <span class="exploration-title">Pivot exploration graph — Neo4j</span>
        <span class="exploration-stat" id="explorationStat">0 nodes</span>
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
    var HEAT_COLORS = ['#4caf50','#8bc34a','#ffc107','#ff5722','#f44336'];
    var HEAT_LABELS = ['Sensible','Reasonable','Bold','Desperate','Unhinged'];
    var ADVISOR_HUBBLE = { GTM:'go-to-market', Product:'product', Finance:'finance', Growth:'growth', Technical:'technical', Fundraising:'fundraising' };
    var PAT_COLORS = { company:'#ff4500', asset:'#4a9eff', from:'#888', to:'#4caf50' };
    var PAT_RADII  = { company:16, asset:10, from:12, to:12 };

    // ── Small historical pattern graph per card ───────────────────────────────
    function renderPatternGraph(containerId, pattern) {
      var wrap = document.getElementById(containerId);
      if (!wrap) return;
      var W = 680, H = 180;
      var nodes = [{ id:pattern.company, type:'company', label:pattern.company }];
      pattern.sharedAssets.forEach(function(a){ nodes.push({ id:a, type:'asset', label:a.replace(/-/g,' ') }); });
      nodes.push({ id:'__from__', type:'from', label:pattern.fromDomain.replace(/-/g,' ') });
      nodes.push({ id:'__to__',   type:'to',   label:pattern.toDomain.replace(/-/g,' ')   });
      var links = [];
      pattern.sharedAssets.forEach(function(a){ links.push({ source:a, target:pattern.company, type:'asset' }); });
      links.push({ source:'__from__', target:pattern.company, type:'from' });
      links.push({ source:pattern.company, target:'__to__', type:'to' });
      var svg = d3.select('#'+containerId).append('svg').attr('width','100%').attr('height',H).attr('viewBox','0 0 '+W+' '+H);
      var sim = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(function(d){return d.id;}).distance(75))
        .force('charge', d3.forceManyBody().strength(-220))
        .force('center', d3.forceCenter(W/2,H/2))
        .force('collide', d3.forceCollide().radius(function(d){return PAT_RADII[d.type]+18;}));
      var link = svg.append('g').selectAll('line').data(links).join('line')
        .attr('stroke',function(d){return d.type==='asset'?'#4a9eff':d.type==='from'?'#888':'#4caf50';})
        .attr('stroke-opacity',0.4).attr('stroke-width',function(d){return d.type==='asset'?1:1.5;})
        .attr('stroke-dasharray',function(d){return d.type==='asset'?'4 3':null;});
      var node = svg.append('g').selectAll('circle').data(nodes).join('circle')
        .attr('r',function(d){return PAT_RADII[d.type];}).attr('fill',function(d){return PAT_COLORS[d.type];})
        .attr('fill-opacity',0.85).attr('stroke','#0a0a0a').attr('stroke-width',2);
      var label = svg.append('g').selectAll('text').data(nodes).join('text')
        .text(function(d){return d.label;})
        .attr('font-size',function(d){return d.type==='company'?10:8.5;})
        .attr('font-weight',function(d){return d.type==='company'?'bold':'normal';})
        .attr('fill','#d0d0d0').attr('text-anchor','middle').attr('pointer-events','none');
      sim.on('tick',function(){
        link.attr('x1',function(d){return d.source.x;}).attr('y1',function(d){return d.source.y;})
            .attr('x2',function(d){return d.target.x;}).attr('y2',function(d){return d.target.y;});
        node.attr('cx',function(d){d.x=Math.max(PAT_RADII[d.type]+4,Math.min(W-PAT_RADII[d.type]-4,d.x));return d.x;})
            .attr('cy',function(d){d.y=Math.max(PAT_RADII[d.type]+4,Math.min(H-PAT_RADII[d.type]-4,d.y));return d.y;});
        label.attr('x',function(d){return d.x;}).attr('y',function(d){return d.y+PAT_RADII[d.type]+11;});
      });
    }

    // ── Live exploration tree ─────────────────────────────────────────────────
    var treeNodes=[], treeLinks=[], nodeById={};
    var simulation, linkGroup, nodeGroup, labelGroup;
    var linkSel, nodeSel, labelSel;
    var treeW, treeH, cx, cy, RADII;
    var treeInitialized = false;

    function nodeRadius(d) {
      if (d.level===0) return 8;
      if (d.level===1) return 9;
      if (d.level===2) return 5;
      return 2.5;
    }
    function nodeColor(d) {
      if (d.selected) return '#ffd700';
      if (d.level<=1)  return '#ff4500';
      if (d.level===2) return '#4a9eff';
      return '#3a3a3a';
    }

    function initTree() {
      if (treeInitialized) return;
      treeInitialized = true;
      var container = document.getElementById('treeContainer');
      treeW = container.clientWidth || 960;
      treeH = Math.min(580, Math.max(380, treeW * 0.58));
      cx = treeW/2; cy = treeH/2;
      RADII = { 0:0, 1:treeW*0.13, 2:treeW*0.27, 3:treeW*0.43 };

      var svg = d3.select('#treeContainer').append('svg').attr('width',treeW).attr('height',treeH);

      [1,2,3].forEach(function(lvl){
        svg.append('circle').attr('cx',cx).attr('cy',cy).attr('r',RADII[lvl])
          .attr('fill','none').attr('stroke','#1a1a1a').attr('stroke-width',1);
      });

      var defs = svg.append('defs');
      var f = defs.append('filter').attr('id','glow').attr('x','-60%').attr('y','-60%').attr('width','220%').attr('height','220%');
      f.append('feGaussianBlur').attr('stdDeviation','5').attr('result','blur');
      var fm = f.append('feMerge');
      fm.append('feMergeNode').attr('in','blur');
      fm.append('feMergeNode').attr('in','SourceGraphic');

      linkGroup  = svg.append('g').attr('class','links');
      nodeGroup  = svg.append('g').attr('class','nodes');
      labelGroup = svg.append('g').attr('class','labels');
      linkSel  = linkGroup.selectAll('line');
      nodeSel  = nodeGroup.selectAll('circle');
      labelSel = labelGroup.selectAll('text');

      var root = { id:'__root__', level:0, selected:false, title:'Your Startup', fx:cx, fy:cy };
      treeNodes.push(root);
      nodeById['__root__'] = root;

      simulation = d3.forceSimulation(treeNodes)
        .force('link', d3.forceLink(treeLinks).id(function(d){return d.id;})
          .distance(function(d){
            var tl = (typeof d.target==='object' ? d.target.level : (nodeById[d.target]||{level:1}).level) || 1;
            return (RADII[tl] - RADII[tl-1]) * 0.55;
          }).strength(0.5))
        .force('radial', d3.forceRadial(function(d){return RADII[d.level]||0;}, cx, cy)
          .strength(function(d){ return d.id==='__root__' ? 0 : 0.9; }))
        .force('charge', d3.forceManyBody().strength(function(d){
          if (d.level===3) return -3;
          if (d.level===2) return -15;
          return -55;
        }))
        .force('collide', d3.forceCollide().radius(function(d){return nodeRadius(d)+(d.level===3?1:3);}).strength(0.6))
        .alphaDecay(0.015)
        .on('tick', onTick);

      var tooltip = document.getElementById('treeTooltip');
      nodeGroup.on('mousemove', function(event){
        var d = d3.select(event.target).datum();
        if (!d || !d.title || d.level===0) { tooltip.style.opacity='0'; return; }
        var rect = document.getElementById('treeContainer').getBoundingClientRect();
        tooltip.style.left = Math.min(event.clientX-rect.left+10, treeW-230)+'px';
        tooltip.style.top  = Math.max(event.clientY-rect.top-30, 0)+'px';
        tooltip.textContent = d.title + (d.selected ? ' ★' : '');
        tooltip.style.opacity = '1';
      }).on('mouseleave', function(){ tooltip.style.opacity='0'; });
    }

    function onTick() {
      if (linkSel) linkSel
        .attr('x1',function(d){return d.source.x;}).attr('y1',function(d){return d.source.y;})
        .attr('x2',function(d){return d.target.x;}).attr('y2',function(d){return d.target.y;});
      if (nodeSel) nodeSel
        .attr('cx',function(d){return d.x;}).attr('cy',function(d){return d.y;});
      if (labelSel) labelSel
        .attr('x',function(d){return d.x;}).attr('y',function(d){return d.y+nodeRadius(d)+9;});
    }

    function addTreeNode(data) {
      var parent = nodeById[data.parentId] || nodeById['__root__'];
      var n = Object.assign({}, data, { x: parent ? parent.x : cx, y: parent ? parent.y : cy });
      treeNodes.push(n);
      nodeById[n.id] = n;
      treeLinks.push({ source: data.parentId || '__root__', target: n.id });

      simulation.nodes(treeNodes);
      simulation.force('link').links(treeLinks);
      simulation.alpha(Math.max(simulation.alpha(), 0.25)).restart();

      refreshSelections();
      document.getElementById('explorationStat').textContent = (treeNodes.length-1)+' nodes';
    }

    function refreshSelections() {
      // Links
      linkSel = linkGroup.selectAll('line')
        .data(treeLinks, function(d){
          var s = typeof d.source==='object' ? d.source.id : d.source;
          var t = typeof d.target==='object' ? d.target.id : d.target;
          return s+'-'+t;
        });
      linkSel.enter().append('line')
        .attr('stroke', function(d){
          var tl = typeof d.target==='object' ? d.target.level : (nodeById[d.target]||{level:1}).level;
          return tl<=1 ? '#ff4500' : tl===2 ? '#4a9eff' : '#222';
        })
        .attr('stroke-opacity', 0)
        .attr('stroke-width', function(d){
          var tl = typeof d.target==='object' ? d.target.level : (nodeById[d.target]||{level:1}).level;
          return tl<=1 ? 1.5 : tl===2 ? 0.8 : 0.4;
        })
        .transition().duration(600)
        .attr('stroke-opacity', function(d){
          var tl = typeof d.target==='object' ? d.target.level : (nodeById[d.target]||{level:1}).level;
          return tl<=1 ? 0.5 : tl===2 ? 0.2 : 0.08;
        });
      linkSel = linkGroup.selectAll('line');

      // Nodes
      nodeSel = nodeGroup.selectAll('circle')
        .data(treeNodes, function(d){ return d.id; });
      nodeSel.enter().append('circle')
        .attr('r', 0)
        .attr('cx', function(d){ return d.x||cx; })
        .attr('cy', function(d){ return d.y||cy; })
        .attr('fill', nodeColor)
        .attr('fill-opacity', function(d){ return d.level===3 ? 0.65 : 0.9; })
        .attr('stroke','none')
        .style('cursor', function(d){ return d.level<=2 ? 'pointer' : 'default'; })
        .transition().duration(400).attr('r', nodeRadius);
      nodeSel = nodeGroup.selectAll('circle');

      // Labels (L1 only)
      var l1 = treeNodes.filter(function(n){ return n.level===1; });
      labelSel = labelGroup.selectAll('text').data(l1, function(d){ return d.id; });
      labelSel.enter().append('text')
        .attr('font-size',8).attr('fill','#777').attr('text-anchor','middle').attr('pointer-events','none')
        .attr('opacity',0)
        .text(function(d){ return d.title.length>24 ? d.title.slice(0,22)+'…' : d.title; })
        .transition().duration(500).attr('opacity',1);
      labelSel = labelGroup.selectAll('text');
    }

    function markSelected(selectedIds) {
      treeNodes.forEach(function(n){ if (selectedIds.indexOf(n.id)!==-1) n.selected=true; });
      nodeGroup.selectAll('circle')
        .transition().duration(700)
        .attr('fill', nodeColor)
        .attr('filter', function(d){ return d.selected ? 'url(#glow)' : null; })
        .attr('stroke', function(d){ return d.selected ? '#ffd700' : 'none'; })
        .attr('stroke-width', function(d){ return d.selected ? 2.5 : 0; })
        .attr('r', function(d){ return d.selected ? nodeRadius(d)*1.7 : nodeRadius(d); });
    }

    // ── Card rendering ────────────────────────────────────────────────────────
    function renderPivotCard(pivot, patterns) {
      var color = HEAT_COLORS[pivot.desperationLevel-1];
      var label = HEAT_LABELS[pivot.desperationLevel-1];
      var hubbleQuery = encodeURIComponent(ADVISOR_HUBBLE[pivot.advisorType]||pivot.advisorType);
      var pattern = patterns && pivot.inspiredBy
        ? patterns.find(function(p){ return p.company===pivot.inspiredBy; }) : null;
      var graphId = 'pgraph-'+pivot.id;
      var card = document.createElement('div');
      card.className = 'pivot-card';
      card.style.setProperty('--heat-color', color);
      card.innerHTML =
        '<div class="desperation-label">'+label+'</div>'+
        '<div class="card-header">'+
          '<div class="card-title">'+pivot.title+'</div>'+
          '<div class="heat" title="Desperation level '+pivot.desperationLevel+'/5">'+'🌶️'.repeat(pivot.desperationLevel)+'</div>'+
        '</div>'+
        '<div class="card-desc">'+pivot.description+'</div>'+
        '<div class="card-rationale">💡 '+pivot.rationale+'</div>'+
        (pattern ?
          '<div class="graph-section">'+
            '<div class="graph-label">Inspired by: '+pattern.company+'</div>'+
            '<div class="graph-wrap">'+
              '<div id="'+graphId+'"></div>'+
              '<div class="graph-legend">'+
                '<span class="legend-item"><span class="legend-dot" style="background:#ff4500"></span>company</span>'+
                '<span class="legend-item"><span class="legend-dot" style="background:#4a9eff"></span>shared asset</span>'+
                '<span class="legend-item"><span class="legend-dot" style="background:#888"></span>pivoted from</span>'+
                '<span class="legend-item"><span class="legend-dot" style="background:#4caf50"></span>pivoted to</span>'+
              '</div>'+
            '</div>'+
          '</div>'
        : '')+
        '<div class="card-footer">'+
          '<span class="inspired-by">'+(pivot.inspiredBy ? '✦ à la '+pivot.inspiredBy : '')+'</span>'+
          '<a class="hubble-link" href="https://hubble.social/search?q='+hubbleQuery+'" target="_blank" rel="noopener">Find a '+pivot.advisorType+' advisor →</a>'+
        '</div>';
      document.getElementById('results').appendChild(card);
      if (pattern) requestAnimationFrame(function(){ renderPatternGraph(graphId, pattern); });
    }

    // ── SSE stream reader ─────────────────────────────────────────────────────
    function parseSSEChunk(text) {
      var events = [], blocks = text.split('\\n\\n'), remaining = blocks.pop();
      blocks.forEach(function(block){
        var evType='message', data='';
        block.split('\\n').forEach(function(line){
          if (line.startsWith('event: ')) evType = line.slice(7).trim();
          if (line.startsWith('data: '))  data  = line.slice(6).trim();
        });
        if (data) events.push({ event:evType, data:data });
      });
      return { events:events, remaining:remaining };
    }

    // ── Form submit ───────────────────────────────────────────────────────────
    document.getElementById('pivotForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      var btn = document.getElementById('submitBtn');
      var status = document.getElementById('status');
      btn.disabled = true;
      document.getElementById('results').innerHTML = '';
      document.getElementById('explorationSection').style.display = 'none';
      document.getElementById('resultsContainer').style.display = 'none';
      d3.select('#treeContainer svg').remove();
      treeNodes=[]; treeLinks=[]; nodeById={}; treeInitialized=false;
      status.textContent = 'Analysing your startup… 🔍';

      try {
        var res = await fetch('/pivot', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({
            description: document.getElementById('description').value,
            failing:     document.getElementById('failing').value,
          }),
        });
        if (!res.ok) throw new Error(await res.text());

        var reader = res.body.getReader();
        var decoder = new TextDecoder();
        var sseBuffer = '';

        while (true) {
          var chunk = await reader.read();
          if (chunk.done) break;
          sseBuffer += decoder.decode(chunk.value, { stream:true });
          var parsed = parseSSEChunk(sseBuffer);
          sseBuffer = parsed.remaining;

          parsed.events.forEach(function(ev) {
            var payload;
            try { payload = JSON.parse(ev.data); } catch { return; }

            if (ev.event === 'assets') {
              status.textContent = 'Assets: ' + payload.assets.join(', ');
            } else if (ev.event === 'patterns') {
              status.textContent = payload.patterns.length + ' historical pivot patterns found. Generating ideas…';
            } else if (ev.event === 'node') {
              if (!treeInitialized) {
                document.getElementById('explorationSection').style.display = 'block';
                initTree();
              }
              var lvl = payload.level===1 ? 'L1' : payload.level===2 ? 'L2' : 'L3';
              status.textContent = '['+lvl+'] '+payload.title;
              addTreeNode(payload);
            } else if (ev.event === 'selected') {
              markSelected(payload.selectedIds);
              status.textContent = 'Selected '+payload.selectedNodes.length+' best pivots from '+(treeNodes.length-1)+' explored 🫡';
              document.getElementById('resultsContainer').style.display = 'block';
              document.getElementById('resultsHeader').textContent =
                'Top '+payload.selectedNodes.length+' pivots — chosen from '+(treeNodes.length-1)+' explored';
              payload.selectedNodes.forEach(function(pivot){
                renderPivotCard(pivot, payload.patterns);
              });
            } else if (ev.event === 'done') {
              document.getElementById('explorationStat').textContent =
                payload.totalExplored+' nodes · stored in Neo4j';
            }
          });
        }
      } catch(err) {
        status.textContent = 'Something went wrong: '+err.message;
      } finally {
        btn.disabled = false;
      }
    });
  <\/script>
</body>
</html>`
}
