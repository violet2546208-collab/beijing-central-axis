const $ = (selector) => document.querySelector(selector);

// 从南向北的演示顺序。双侧建筑以 x 偏移显示，保持“建筑立在卷轴上”的视觉关系。
const contentDb = window.AXIS_CONTENT_DB;
if (!contentDb || !Array.isArray(contentDb.stops)) {
  throw new Error('中轴线点位资料库未加载');
}
const stops = contentDb.stops;

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
    button.querySelector('img').addEventListener('load', queueUpdate);
    button.querySelector('span').textContent = item.name;
    button.addEventListener('click', () => openInfo(item, button, stopIndex));
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
  stage.dataset.layout = stop.items.length === 1 ? 'single' : 'pair';
  $('.stage-caption').classList.toggle('long-title', stop.title.length > 5);
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
  stage.style.setProperty('--plant-shift', `${Math.round(progress * 18)}px`);

  const stageHeight = stage.clientHeight;
  for (const node of nodes) {
    const distance = node.stopIndex - currentPosition;
    node.button.hidden = distance <= -0.45 || distance >= 3.35;
  }

  let previousTop = Infinity;
  for (let stopIndex = 0; stopIndex < stops.length; stopIndex++) {
    const distance = stopIndex - currentPosition;
    if (distance <= -0.45 || distance >= 3.35) continue;
    const row = nodes.filter((node) => node.stopIndex === stopIndex);
    const scale = Math.pow(1 + Math.max(0, distance) * 0.7, -1.05);
    const sideShift = stageHeight * 0.075 * scale;
    const rowHeight = Math.max(...row.map(({ button, item }) =>
      (button.offsetHeight || button.offsetWidth * 1.12) * scale + (item.x > 0 ? sideShift : 0)));
    const desiredBottom = stageHeight * (0.05 + 0.87 * Math.exp(-0.5 * distance));
    const bottom = Math.min(desiredBottom, previousTop - Math.max(10, stageHeight * 0.012));
    previousTop = bottom - rowHeight;

    for (const { button, item } of row) {
      const pairOffset = item.x === 0 ? 0 : Math.sign(item.x) * button.offsetWidth * 0.46;
      const x = pairOffset * scale;
      const itemBottom = bottom - (item.x > 0 ? sideShift : 0);
      const opacity = Math.min(1, Math.max(0, (distance + 0.45) / 0.45), Math.max(0, (3.35 - distance) / 0.5));
      button.style.left = `calc(50% + ${x.toFixed(1)}px)`;
      button.style.top = `${itemBottom.toFixed(1)}px`;
      button.style.transform = `translate(-50%, -100%) scale(${scale.toFixed(3)})`;
      button.style.opacity = opacity.toFixed(3);
      button.style.zIndex = String(100 - Math.round(distance * 10) + (item.x < 0 ? 1 : 0));
      button.style.pointerEvents = distance > -0.12 && distance < 2.7 && opacity > 0.45 ? 'auto' : 'none';
    }
  }
}

function queueUpdate() {
  if (frameRequested) return;
  frameRequested = true;
  requestAnimationFrame(update);
}

function openInfo(item, button, stopIndex) {
  $('#info-category').textContent = stops[stopIndex].category;
  $('#info-title').textContent = item.name;
  $('#info-text').textContent = item.text;
  $('#info-source').href = item.source;
  $('#info-source').textContent = `查看资料来源 · ${item.sourceTitle} ↗`;
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
  if (current) openInfo(current.item, current.button, current.stopIndex);
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
