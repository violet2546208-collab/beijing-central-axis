const UNESCO = 'https://whc.unesco.org/zh/list/1714';
const BEIJING = 'https://www.beijing.gov.cn/zhengce/dfxfg/202506/t20250610_4110461.html';
const $ = (selector) => document.querySelector(selector);

// 从南向北的演示顺序。双侧建筑以 x 偏移显示，保持“建筑立在卷轴上”的视觉关系。
const stops = [
  { title: '永定门', category: '南端起点', description: '由永定门进入北京老城，沿城市中心向北展开这段旅程。', items: [{ name: '永定门', slug: 'yongdingmen', x: 0, text: '永定门位于北京中轴线南端，是观察整条轴线南北关系的起点。', source: BEIJING }] },
  { title: '天坛 · 先农坛', category: '礼仪空间', description: '轴线两侧的坛庙，把都城的礼仪秩序铺展到道路之外。', items: [{ name: '先农坛', slug: 'xiannongtan', x: -175, nightFallback: true, text: '先农坛位于中轴线西侧，是北京中轴线遗产构成要素之一。', source: UNESCO }, { name: '天坛', slug: 'tiantan', x: 175, text: '天坛位于中轴线东侧，与西侧的先农坛共同呈现古都的空间布局。', source: UNESCO }] },
  { title: '正阳门', category: '老城南门', description: '从箭楼到城楼，城门建筑在中轴线上层层展开。', items: [{ name: '正阳门箭楼', slug: 'zhengyangmen-arrow', x: -145, text: '正阳门建筑群位于北京老城中轴线上。', source: UNESCO }, { name: '正阳门城楼', slug: 'zhengyangmen-gate', x: 145, text: '正阳门是北京中轴线的遗产构成要素之一。', source: UNESCO }] },
  { title: '天安门广场', category: '公共空间', description: '从古都礼仪空间走向现代公共空间，轴线继续连接城市的不同年代。', items: [{ name: '天安门广场', slug: 'tiananmen-square', x: -105, text: '天安门广场及建筑群是北京中轴线的遗产构成要素。', source: UNESCO }, { name: '外金水桥', slug: 'outer-jinshui-bridge', x: 145, text: '外金水桥是北京中轴线的遗产构成要素之一。', source: UNESCO }] },
  { title: '太庙 · 社稷坛', category: '东西相望', description: '沿轴线看向两侧：太庙在东，社稷坛在西。', items: [{ name: '社稷坛', slug: 'shejitan', x: -175, text: '社稷坛位于故宫西侧，与东侧的太庙形成相对布局。', source: BEIJING }, { name: '太庙', slug: 'taimiao', x: 175, text: '太庙位于故宫东侧，与西侧的社稷坛形成相对布局。', source: BEIJING }] },
  { title: '端门', category: '宫城序列', description: '门与门之间的距离，构成走向宫城中心的节奏。', items: [{ name: '端门', slug: 'duanmen', x: 0, text: '端门属于北京中轴线上的古代皇家宫苑建筑要素。', source: UNESCO }] },
  { title: '故宫', category: '宫城中心', description: '轴线穿过故宫，建筑群的层次和秩序在这里格外鲜明。', items: [{ name: '故宫', slug: 'forbidden-city', x: 0, text: '故宫是北京中轴线的重要遗产构成要素，体现了中国传统都城规划与建筑营造。', source: UNESCO }] },
  { title: '景山', category: '登高望轴', description: '从景山回望，南北延伸的城市骨架更加清晰。', items: [{ name: '景山', slug: 'jingshan', x: 0, text: '景山位于故宫北侧，是北京中轴线的遗产构成要素。', source: UNESCO }] },
  { title: '万宁桥', category: '水与城', description: '轴线越过古桥，继续通向老城北端。', items: [{ name: '万宁桥', slug: 'wanning-bridge', x: 0, text: '万宁桥是北京中轴线的遗产构成要素之一。', source: UNESCO }] },
  { title: '钟鼓楼', category: '北端收束', description: '钟楼与鼓楼在北端相望，整条长轴在这里收束。', items: [{ name: '鼓楼', slug: 'drum-tower', x: -145, text: '鼓楼位于北京中轴线北端的钟鼓楼建筑群中。', source: BEIJING }, { name: '钟楼', slug: 'bell-tower', x: 145, text: '钟楼与鼓楼共同构成北京中轴线北端的建筑节点。', source: BEIJING }] }
];

const story = $('#axis');
const stage = $('#axis-stage');
const field = $('#building-field');
const info = $('#info-dialog');
const overview = $('#overview-dialog');
const nodes = [];
let mode = 'day';
let activeStop = -1;
let currentPosition = 0;
let frameRequested = false;

function assetPath(item, selectedMode) {
  const variant = selectedMode === 'night' && item.nightFallback ? 'day' : selectedMode;
  return `assets/buildings/${item.slug}-${variant}.webp`;
}

for (const [stopIndex, stop] of stops.entries()) {
  for (const item of stop.items) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = stop.items.length > 1 ? 'building building--pair' : 'building';
    button.setAttribute('aria-label', `了解${item.name}`);
    button.innerHTML = '<img alt="" decoding="async"><span></span>';
    button.querySelector('img').src = assetPath(item, mode);
    button.querySelector('span').textContent = item.name;
    button.addEventListener('click', () => openInfo(item, button));
    field.append(button);
    nodes.push({ button, item, stopIndex });
  }
}

const scrollCanvas = $('#scroll-canvas');
const scrollContext = scrollCanvas.getContext('2d');
const groundImages = {};

function scrollEdgeAt(t) {
  // 反求 SVG 边界曲线的参数，使云纹始终贴着弧形卷边。
  let low = 0;
  let high = 1;
  for (let i = 0; i < 12; i++) {
    const u = (low + high) / 2;
    const y = 3 * (1 - u) ** 2 * u * 0.42 + 3 * (1 - u) * u ** 2 * 0.805 + u ** 3;
    if (y < t) low = u;
    else high = u;
  }
  const u = (low + high) / 2;
  return 0.32 * (1 - u) ** 3 + 3 * 0.32 * (1 - u) ** 2 * u + 3 * 0.195 * (1 - u) * u ** 2 + 0.065 * u ** 3;
}

function drawScrollGround() {
  const source = groundImages[mode];
  if (!source?.naturalWidth || !scrollContext) {
    scrollCanvas.classList.remove('is-ready');
    return;
  }
  const width = scrollCanvas.clientWidth;
  const height = scrollCanvas.clientHeight;
  if (!width || !height) return;
  const density = Math.min(devicePixelRatio || 1, 1.5);
  scrollCanvas.width = Math.round(width * density);
  scrollCanvas.height = Math.round(height * density);
  scrollContext.setTransform(density, 0, 0, density, 0, 0);
  scrollContext.imageSmoothingQuality = 'high';

  for (let y = 0; y < height; y++) {
    const top = y / height;
    const bottom = Math.min(1, (y + 1) / height);
    const left = scrollEdgeAt((top + bottom) / 2) * width;
    const sourceTop = source.naturalHeight * top ** 0.72;
    const sourceBottom = source.naturalHeight * bottom ** 0.72;
    scrollContext.drawImage(source, 0, sourceTop, source.naturalWidth, sourceBottom - sourceTop, left, y, width - 2 * left, 1.2);
  }
  scrollCanvas.classList.add('is-ready');
}

for (const selectedMode of ['day', 'night']) {
  const image = new Image();
  image.onload = () => { if (selectedMode === mode) drawScrollGround(); };
  groundImages[selectedMode] = image;
  image.src = `assets/scroll-ground-${selectedMode}-vertical.webp`;
}

function setMode(nextMode) {
  mode = nextMode;
  document.documentElement.dataset.mode = mode;
  $('#mode-label').textContent = mode === 'day' ? '切换黑夜' : '切换白昼';
  $('#mode-status').textContent = mode === 'day' ? '白昼' : '黑夜';
  $('#mode-toggle').setAttribute('aria-pressed', String(mode === 'night'));
  $('#overview-image').src = `assets/axis-overview-${mode}.webp`;
  document.querySelector('.landing-building-front').src = assetPath({ slug: 'yongdingmen' }, mode);
  document.querySelector('.landing-building-back').src = assetPath({ slug: 'bell-tower' }, mode);
  for (const { button, item } of nodes) button.querySelector('img').src = assetPath(item, mode);
  drawScrollGround();
  try { localStorage.setItem('axis-mode', mode); } catch { /* file previews can disable storage */ }
}

function showStop(index) {
  if (index === activeStop) return;
  activeStop = index;
  const stop = stops[index];
  $('#stop-count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(stops.length).padStart(2, '0')}`;
  $('#stop-category').textContent = stop.category;
  $('#stop-title').textContent = stop.title;
  $('#stop-description').textContent = stop.description;
  $('.stage-caption').classList.remove('caption-in');
  void $('.stage-caption').offsetWidth;
  $('.stage-caption').classList.add('caption-in');
  if (info.open) info.close();
}

function update() {
  frameRequested = false;
  const rect = story.getBoundingClientRect();
  const scrollable = Math.max(1, story.offsetHeight - innerHeight);
  const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
  currentPosition = progress * (stops.length - 1);
  showStop(Math.round(currentPosition));
  $('#progress-fill').style.width = `${(progress * 100).toFixed(2)}%`;
  stage.style.setProperty('--plant-shift', `${Math.round(progress * 60)}px`);

  for (const { button, item, stopIndex } of nodes) {
    const distance = stopIndex - currentPosition;
    const visible = distance > -0.55 && distance < 1.3;
    button.hidden = !visible;
    if (!visible) continue;
    const depth = Math.max(0, distance);
    const scale = 1 / (1 + depth * 0.5);
    const pairOffset = item.x === 0 ? 0 : Math.sign(item.x) * Math.max(Math.abs(item.x) * 1.25, button.offsetWidth / 2 + 36);
    const x = pairOffset * scale;
    const y = 77 - distance * 38;
    const opacity = Math.min(1, Math.max(0, (distance + 0.55) * 3), Math.max(0, (1.3 - distance) * 3));
    button.style.left = `calc(50% + ${x.toFixed(1)}px)`;
    button.style.top = `${y.toFixed(2)}%`;
    button.style.transform = `translate(-50%, -100%) scale(${scale.toFixed(3)})`;
    button.style.opacity = opacity.toFixed(3);
    button.style.zIndex = String(100 - Math.round(distance * 10));
    button.style.pointerEvents = distance > -0.2 && distance < 1.15 ? 'auto' : 'none';
  }
}

function queueUpdate() {
  if (frameRequested) return;
  frameRequested = true;
  requestAnimationFrame(update);
}

function openInfo(item, button) {
  $('#info-category').textContent = stops[activeStop].category;
  $('#info-title').textContent = item.name;
  $('#info-text').textContent = item.text;
  $('#info-source').href = item.source;
  if (!info.open) info.show();
  const rect = button.getBoundingClientRect();
  const width = info.offsetWidth;
  const height = info.offsetHeight;
  const right = rect.right + 18;
  const left = right + width < innerWidth - 24 ? right : rect.left - width - 18;
  info.style.left = `${Math.max(24, Math.min(left, innerWidth - width - 24))}px`;
  info.style.top = `${Math.max(80, Math.min(rect.top - 30, innerHeight - height - 24))}px`;
}

function openOverview() { overview.showModal(); }
$('#mode-toggle').addEventListener('click', () => setMode(mode === 'day' ? 'night' : 'day'));
$('#overview-open').addEventListener('click', openOverview);
$('#ending-overview').addEventListener('click', openOverview);
$('#overview-close').addEventListener('click', () => overview.close());
$('#info-close').addEventListener('click', () => info.close());
$('#stop-detail').addEventListener('click', () => {
  const current = nodes.find((node) => node.stopIndex === activeStop);
  if (current) openInfo(current.item, current.button);
});
$('#next-stop').addEventListener('click', () => {
  const next = Math.min(stops.length - 1, activeStop + 1);
  const scrollable = story.offsetHeight - innerHeight;
  if (next === activeStop) $('#about').scrollIntoView({ behavior: 'smooth' });
  else scrollTo({ top: story.offsetTop + (next / (stops.length - 1)) * scrollable, behavior: 'smooth' });
});
document.addEventListener('click', (event) => {
  if (info.open && !info.contains(event.target) && !event.target.closest('.building') && event.target !== $('#stop-detail')) info.close();
});
window.addEventListener('scroll', () => { if (info.open) info.close(); queueUpdate(); }, { passive: true });
window.addEventListener('resize', () => { queueUpdate(); drawScrollGround(); });
try { if (localStorage.getItem('axis-mode') === 'night') mode = 'night'; } catch { /* local preview */ }
setMode(mode);
update();
