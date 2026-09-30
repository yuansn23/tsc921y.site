(function () {
  const root = document.getElementById('hero-art');
  if (!root) return;

  let s = 7 * 16807 % 2147483647;
  const rnd = () => (s = s * 16807 % 2147483647) / 2147483647;

  const W = 1600, H = 800;
  const chartL = 700, chartR = 1580;
  const n = 26;
  const step = (chartR - chartL) / n;
  const cw = Math.max(7, step * 0.44);
  const topClear = 250, bottom = 620;
  const trend = i => {
    const t = i / (n - 1);
    return bottom - (bottom - topClear) * Math.pow(t, 1.15) + Math.sin(t * 7.2) * 30 + Math.sin(t * 3.1 + 1.4) * 20;
  };

  const candles = [], pts = [];
  let prev = trend(0);
  for (let i = 0; i < n; i++) {
    const mid = trend(i);
    const open = prev, close = mid + (rnd() - 0.5) * 22;
    const body = Math.max(3, Math.abs(close - open));
    const wick = 11 + rnd() * 28;
    const cx = chartL + step * i + step / 2;
    const up = close <= open;
    const yTop = Math.min(open, close);
    candles.push({
      x: +(cx - cw / 2).toFixed(1), cx: +cx.toFixed(1), w: +cw.toFixed(1),
      y: +yTop.toFixed(1), h: +body.toFixed(1),
      hi: +(yTop - wick).toFixed(1), lo: +(yTop + body + wick * 0.7).toFixed(1),
      color: up ? '#16C784' : '#EA3943',
      fill: up ? 0.32 : 0.6,
      op: +(0.6 + 0.4 * (i / (n - 1))).toFixed(2)
    });
    pts.push([cx, close]);
    prev = close;
  }
  const trendPath = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');

  const ai = Math.round(n * 0.84);
  const alertX = +pts[ai][0].toFixed(1);
  const alertY = +(pts[ai][1] - 58).toFixed(1);

  let x = -40;
  const segs = [];
  const windows = [];
  while (x < 1640) {
    const bw = 46 + rnd() * 96;
    const bh = 80 + rnd() * 210;
    const top = H - bh;
    segs.push([x, top, bw]);
    const cols = Math.max(1, Math.floor(bw / 22));
    const rows = Math.max(1, Math.floor(bh / 30));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rnd() > 0.86) {
          windows.push({
            x: +(x + 10 + c * 22).toFixed(1),
            y: +(top + 16 + r * 30).toFixed(1),
            o: +(0.08 + rnd() * 0.22).toFixed(2)
          });
        }
      }
    }
    x += bw + 4 + rnd() * 12;
  }
  let sky = 'M-40 ' + H;
  segs.forEach(g => {
    sky += ' L' + g[0].toFixed(1) + ' ' + H +
      ' L' + g[0].toFixed(1) + ' ' + g[1].toFixed(1) +
      ' L' + (g[0] + g[2]).toFixed(1) + ' ' + g[1].toFixed(1) +
      ' L' + (g[0] + g[2]).toFixed(1) + ' ' + H;
  });
  const skylinePath = sky + ' L1640 ' + H + ' Z';

  const nodes = [];
  const count = 26;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const bx = 640 + t * (chartR - 640) + (rnd() - 0.5) * 100;
    const lift = 45 + rnd() * 220;
    const by = trend(t * (n - 1)) + (rnd() > 0.32 ? -1 : 1) * lift;
    const yy = Math.min(700, Math.max(140, by));
    if (nodes.some(q => Math.hypot(q.x - bx, q.y - yy) < 58)) continue;
    if (Math.hypot(bx - alertX, yy - alertY) < 55) continue;
    const near = Math.hypot(bx - alertX, yy - alertY) < 260;
    const r = 2.6 + rnd() * 4;
    nodes.push({
      x: +bx.toFixed(1), y: +yy.toFixed(1), r: +r.toFixed(1),
      halo: +(r * (near ? 3.4 : 2.2)).toFixed(1),
      haloO: +((near ? 0.3 : 0.12) + rnd() * 0.1).toFixed(2),
      o: +((near ? 0.85 : 0.45) + rnd() * 0.15).toFixed(2)
    });
  }
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (d < 210) {
        edges.push({
          x1: nodes[i].x, y1: nodes[i].y, x2: nodes[j].x, y2: nodes[j].y,
          o: +(0.3 * (1 - d / 210) + 0.05).toFixed(3),
          w: +(0.8 + 0.6 * (1 - d / 210)).toFixed(2)
        });
      }
    }
  }
  nodes.forEach(nd => {
    const d = Math.hypot(nd.x - alertX, nd.y - alertY);
    if (d < 300 && d > 40) edges.push({ x1: nd.x, y1: nd.y, x2: alertX, y2: alertY, o: 0.28, w: 1.1 });
  });

  const streams = [[-60, 780], [260, 860], [1660, 700], [1660, 340], [820, 870]].map(a => {
    const mx = (a[0] + alertX) / 2 + (rnd() - 0.5) * 300;
    const my = (a[1] + alertY) / 2 + (rnd() - 0.5) * 200;
    return {
      d: 'M' + a[0] + ' ' + a[1] + ' Q' + mx.toFixed(0) + ' ' + my.toFixed(0) + ' ' + alertX + ' ' + alertY,
      o: +(0.14 + rnd() * 0.18).toFixed(2),
      w: +(1 + rnd() * 2).toFixed(1)
    };
  });

  const alertCrossT = alertY - 150;
  const alertCrossB = alertY + 150;
  const alertCrossL = alertX - 190;
  const alertCrossR = alertX + 190;

  root.innerHTML = `
    <defs>
      <radialGradient id="hSky" cx="0.78" cy="0.42" r="0.62">
        <stop offset="0%" stop-color="#0E3350" stop-opacity="0.95"></stop>
        <stop offset="45%" stop-color="#0A1E33" stop-opacity="0.65"></stop>
        <stop offset="100%" stop-color="#050B16" stop-opacity="0"></stop>
      </radialGradient>
      <linearGradient id="hBuild" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0C1B2D" stop-opacity="0.98"></stop>
        <stop offset="100%" stop-color="#040A13" stop-opacity="1"></stop>
      </linearGradient>
      <linearGradient id="hLeft" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#050B16" stop-opacity="0.97"></stop>
        <stop offset="42%" stop-color="#050B16" stop-opacity="0.8"></stop>
        <stop offset="100%" stop-color="#050B16" stop-opacity="0"></stop>
      </linearGradient>
      <linearGradient id="hBot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#050B16" stop-opacity="0"></stop>
        <stop offset="100%" stop-color="#050B16" stop-opacity="0.95"></stop>
      </linearGradient>
      <pattern id="hGrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0 L0 0 0 40" fill="none" stroke="#00C2FF" stroke-opacity="0.05" stroke-width="1"></path>
      </pattern>
      <filter id="hSoft" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="6" result="b"></feGaussianBlur>
        <feMerge><feMergeNode in="b"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
      </filter>
      <filter id="hHard" x="-120%" y="-120%" width="340%" height="340%">
        <feGaussianBlur stdDeviation="14" result="b"></feGaussianBlur>
        <feMerge><feMergeNode in="b"></feMergeNode><feMergeNode in="b"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
      </filter>
      <filter id="hWide" x="-150%" y="-150%" width="400%" height="400%">
        <feGaussianBlur stdDeviation="30"></feGaussianBlur>
      </filter>
    </defs>
    <rect x="0" y="0" width="1600" height="800" fill="#050B16"></rect>
    <rect x="0" y="0" width="1600" height="800" fill="url(#hSky)"></rect>
    <rect x="0" y="0" width="1600" height="800" fill="url(#hGrid)"></rect>
    <g opacity="0.9">
      <path d="${skylinePath}" fill="url(#hBuild)"></path>
      ${windows.map(w => `<rect x="${w.x}" y="${w.y}" width="4" height="7" fill="#00C2FF" opacity="${w.o}"></rect>`).join('')}
    </g>
    <g opacity="0.5">
      ${streams.map(st => `<path d="${st.d}" fill="none" stroke="#00C2FF" stroke-opacity="${st.o}" stroke-width="${st.w}" stroke-linecap="round" filter="url(#hSoft)"></path>`).join('')}
    </g>
    <g>
      ${edges.map(e => `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="#00C2FF" stroke-opacity="${e.o}" stroke-width="${e.w}"></line>`).join('')}
    </g>
    <path d="${trendPath}" fill="none" stroke="#16C784" stroke-opacity="0.26" stroke-width="1.6"></path>
    <g>
      ${candles.map(c => `
        <g opacity="${c.op}">
          <line x1="${c.cx}" y1="${c.hi}" x2="${c.cx}" y2="${c.lo}" stroke="${c.color}" stroke-width="2" stroke-opacity="0.85"></line>
          <rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="1.5" fill="${c.color}" fill-opacity="${c.fill}" stroke="${c.color}" stroke-width="1.5"></rect>
        </g>`).join('')}
    </g>
    <g>
      ${nodes.map(n => `
        <g>
          <circle cx="${n.x}" cy="${n.y}" r="${n.halo}" fill="#00C2FF" opacity="${n.haloO}" filter="url(#hSoft)"></circle>
          <circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="#0A1728" stroke="#00C2FF" stroke-width="1.5" stroke-opacity="${n.o}"></circle>
        </g>`).join('')}
    </g>
    <g>
      <circle cx="${alertX}" cy="${alertY}" r="170" fill="#00C2FF" opacity="0.1" filter="url(#hWide)"></circle>
      <circle cx="${alertX}" cy="${alertY}" r="110" fill="#16C784" opacity="0.26" filter="url(#hWide)"></circle>
      <circle cx="${alertX}" cy="${alertY}" r="70" fill="none" stroke="#16C784" stroke-opacity="0.18" stroke-width="1.2"></circle>
      <circle cx="${alertX}" cy="${alertY}" r="44" fill="none" stroke="#16C784" stroke-opacity="0.38" stroke-width="1.5"></circle>
      <circle cx="${alertX}" cy="${alertY}" r="21" fill="none" stroke="#16C784" stroke-opacity="0.92" stroke-width="2.2" filter="url(#hHard)"></circle>
      <circle cx="${alertX}" cy="${alertY}" r="6.5" fill="#B9FFE2" filter="url(#hHard)"></circle>
      <line x1="${alertX}" y1="${alertCrossT}" x2="${alertX}" y2="${alertCrossB}" stroke="#16C784" stroke-opacity="0.28" stroke-width="1"></line>
      <line x1="${alertCrossL}" y1="${alertY}" x2="${alertCrossR}" y2="${alertY}" stroke="#16C784" stroke-opacity="0.28" stroke-width="1"></line>
    </g>
    <rect x="0" y="0" width="1000" height="800" fill="url(#hLeft)"></rect>
    <rect x="0" y="560" width="1600" height="240" fill="url(#hBot)"></rect>
  `;
})();
