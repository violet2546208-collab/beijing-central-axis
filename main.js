const SOURCE_UNESCO = 'https://whc.unesco.org/zh/list/1714';
const SOURCE_BEIJING = 'https://www.beijing.gov.cn/zhengce/dfxfg/202506/t20250610_4110461.html';

// 美工素材接入点：每个场景的主题、文案、建筑类型和热点集中在这里。
// 可在场景中添加 background / foreground 图片路径，再替换下方 SVG 示意图。
const scenes = [
  {
    theme: 'gate', number: '第一站 · 南端', title: '永定门', position: '永定门',
    summary: '从南端进入北京老城。沿着一条贯穿南北的城市脊梁，开始看见古都的尺度与秩序。', art: 'gate',
    hotspots: [{ title: '永定门', label: '永定门', x: 54, y: 51, eyebrow: '中轴线 · 南端', body: '永定门位于北京中轴线南端。向北延伸的轴线贯穿北京老城，形成整体的空间秩序。', source: SOURCE_BEIJING }]
  },
  {
    theme: 'street', number: '第二站 · 城市之门', title: '正阳门', position: '正阳门',
    summary: '由城门走向老城中心。脚下的道路把不同建筑和公共空间串联为一个整体。', art: 'gate',
    hotspots: [{ title: '正阳门', label: '正阳门', x: 53, y: 49, eyebrow: '中轴线 · 城市空间', body: '正阳门是北京中轴线的遗产构成要素之一。中轴线的意义不仅在单座建筑，也在建筑与道路之间的空间联系。', source: SOURCE_UNESCO }]
  },
  {
    theme: 'palace', number: '第三站 · 对称布局', title: '故宫与坛庙', position: '故宫',
    summary: '以中轴为参照，观察故宫与东西两侧坛庙。建筑的位置本身，就是一段可以读懂的文化叙事。', art: 'palace',
    hotspots: [
      { title: '故宫', label: '故宫', x: 53, y: 40, eyebrow: '中轴线 · 皇家宫苑', body: '故宫是北京中轴线的重要遗产构成要素。它与周围建筑共同呈现北京老城的规划格局。', source: SOURCE_UNESCO },
      { title: '太庙', label: '太庙 · 东', x: 76, y: 58, eyebrow: '中轴线 · 东侧', body: '太庙位于故宫东侧，与西侧的社稷坛形成相对布局，体现传统都城的礼仪秩序。', source: SOURCE_BEIJING },
      { title: '社稷坛', label: '社稷坛 · 西', x: 30, y: 58, eyebrow: '中轴线 · 西侧', body: '社稷坛位于故宫西侧，与东侧的太庙形成相对布局。', source: SOURCE_BEIJING }
    ]
  },
  {
    theme: 'tower', number: '第四站 · 北端', title: '钟鼓楼', position: '钟鼓楼',
    summary: '向北走到这条轴线的另一端。回望来路，城门、道路与建筑共同组成一座城的骨架。', art: 'tower',
    hotspots: [{ title: '钟鼓楼', label: '钟鼓楼', x: 54, y: 48, eyebrow: '中轴线 · 北端', body: '钟鼓楼位于北京中轴线北端，与南端的永定门共同界定这条贯穿老城的轴线。', source: SOURCE_BEIJING }]
  }
];

const $ = (selector) => document.querySelector(selector);
const stage = $('#story-stage');
const story = $('#story');
const steps = [...document.querySelectorAll('.story-step')];
const dialog = $('#info-dialog');
let activeScene = -1;
let ticking = false;
let lastStoryProgress = 0;

// 代码绘制的示意建筑；替换素材时保留外层 landmark-wrap 即可沿用视差效果。
function landmarkSvg(type) {
  const roof = '<path d="M112 154 Q250 77 388 154 L410 170 Q250 133 90 170Z" fill="#643c33" stroke="#e0b576" stroke-width="7"/><path d="M145 155 Q250 110 355 155" fill="none" stroke="#b87c55" stroke-width="7"/>';
  const base = '<path d="M100 338H400V362H100Z" fill="#b5795d"/><path d="M70 362H430V381H70Z" fill="#d7a981"/>';
  const doors = '<path d="M213 256Q250 215 287 256V338H213Z" fill="#34282b"/><path d="M248 230V338" stroke="#d4a16d" stroke-width="4"/>';
  const windows = '<g fill="#352c2d"><rect x="135" y="257" width="36" height="58" rx="16"/><rect x="329" y="257" width="36" height="58" rx="16"/></g>';
  let building = '';
  if (type === 'palace') {
    building = `<path d="M102 228H398V338H102Z" fill="#a95f4a"/><path d="M77 213Q250 119 423 213L438 231Q250 188 62 231Z" fill="#74443b" stroke="#e9c58f" stroke-width="8"/><path d="M160 213Q250 168 340 213" fill="none" stroke="#bd8a5e" stroke-width="6"/>${doors}${windows}<path d="M123 240H377" stroke="#e4b078" stroke-width="9"/>${base}`;
  } else if (type === 'tower') {
    building = `<path d="M142 221H358V338H142Z" fill="#aa654e"/><path d="M123 205Q250 135 377 205L394 224Q250 190 106 224Z" fill="#65403a" stroke="#e8bd83" stroke-width="7"/><path d="M167 149H333V207H167Z" fill="#bb7356"/><path d="M145 144Q250 88 355 144L368 160Q250 126 132 160Z" fill="#65403a" stroke="#e8bd83" stroke-width="7"/><path d="M215 260Q250 225 285 260V338H215Z" fill="#34282b"/>${base}`;
  } else {
    building = `<path d="M125 213H375V338H125Z" fill="#a7604a"/>${roof}<path d="M141 171H359V222H141Z" fill="#bd7658"/><path d="M150 220H350" stroke="#e6b983" stroke-width="8"/>${doors}${windows}${base}`;
  }
  return `<svg viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="建筑示意图"><ellipse cx="250" cy="380" rx="218" ry="18" fill="#172022" opacity=".23"/><path d="M34 380H466" stroke="#e8c18b" stroke-width="3" opacity=".65"/>${building}</svg>`;
}

function showScene(index) {
  if (index === activeScene) return;
  activeScene = index;
  if (dialog.open) dialog.close();
  const scene = scenes[index];
  stage.dataset.theme = scene.theme;
  $('#chapter-count').textContent = `${String(index + 1).padStart(2, '0')} / 04`;
  $('#scene-number').textContent = scene.number;
  $('#scene-title').textContent = scene.title;
  $('#scene-summary').textContent = scene.summary;
  $('#scene-position').textContent = scene.position;
  const art = $('#landmark-art');
  art.querySelectorAll('.art-frame').forEach((frame) => {
    frame.classList.remove('art-enter');
    frame.classList.add('art-exit');
    window.setTimeout(() => frame.remove(), 650);
  });
  const frame = document.createElement('div');
  frame.className = 'art-frame art-enter';
  frame.innerHTML = landmarkSvg(scene.art);
  art.append(frame);
  const copy = $('.stage-copy');
  copy.classList.remove('copy-enter');
  void copy.offsetWidth;
  copy.classList.add('copy-enter');
  const layer = $('#hotspots');
  layer.replaceChildren();
  for (const spot of scene.hotspots) {
    const button = document.createElement('button');
    button.className = 'hotspot';
    button.type = 'button';
    button.style.left = `${spot.x}%`;
    button.style.top = `${spot.y}%`;
    button.innerHTML = '<span class="hotspot-pulse" aria-hidden="true"></span><span class="hotspot-dot" aria-hidden="true"></span><span class="hotspot-label"></span>';
    button.querySelector('.hotspot-label').textContent = spot.label;
    button.setAttribute('aria-label', `了解${spot.title}`);
    button.addEventListener('click', () => openInfo(spot, button));
    layer.append(button);
  }
}

function openInfo(spot, button) {
  $('#dialog-eyebrow').textContent = spot.eyebrow;
  $('#dialog-title').textContent = spot.title;
  $('#dialog-body').textContent = spot.body;
  $('#dialog-source').href = spot.source;
  if (!dialog.open) dialog.show();
  const anchor = button.getBoundingClientRect();
  const gap = 18;
  const panelWidth = dialog.offsetWidth;
  const panelHeight = dialog.offsetHeight;
  const rightSide = anchor.right + gap + panelWidth <= window.innerWidth - 20;
  const left = rightSide ? anchor.right + gap : anchor.left - gap - panelWidth;
  dialog.style.left = `${Math.max(20, Math.min(left, window.innerWidth - panelWidth - 20))}px`;
  dialog.style.top = `${Math.max(20, Math.min(anchor.top - 32, window.innerHeight - panelHeight - 20))}px`;
}

function updateScroll() {
  ticking = false;
  const rect = story.getBoundingClientRect();
  const scrollable = Math.max(1, story.offsetHeight - window.innerHeight);
  const progress = Math.max(0, Math.min(0.9999, -rect.top / scrollable));
  const index = Math.min(scenes.length - 1, Math.floor(progress * scenes.length));
  if (dialog.open && Math.abs(progress - lastStoryProgress) > 0.002) dialog.close();
  lastStoryProgress = progress;
  showScene(index);
  stage.style.setProperty('--travel', `${(progress * 360).toFixed(2)}px`);
  stage.style.setProperty('--rise', `${(progress * 22).toFixed(2)}px`);
  stage.style.setProperty('--scale', (0.94 + progress * 0.11).toFixed(3));
  $('#progress-bar').style.width = `${Math.round(progress * 100)}%`;
}

function scheduleScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateScroll);
}

$('#next-scene').addEventListener('click', () => {
  const next = steps[activeScene + 1];
  (next || $('#quiz')).scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$('#close-dialog').addEventListener('click', () => dialog.close());
document.addEventListener('click', (event) => {
  if (dialog.open && !dialog.contains(event.target) && !event.target.closest('.hotspot')) dialog.close();
});
window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('resize', scheduleScroll);

document.querySelectorAll('.quiz-options button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.quiz-options button').forEach((item) => item.classList.remove('selected', 'correct', 'incorrect'));
    const correct = button.dataset.answer === 'correct';
    button.classList.add('selected', correct ? 'correct' : 'incorrect');
    $('#quiz-result').textContent = correct
      ? '答对了。太庙在东，社稷坛在西；两处与中轴上的宫城共同呈现传统都城的布局秩序。'
      : '再看一眼故宫两侧：太庙在东侧，社稷坛在西侧。你可以重新选择。';
  });
});

updateScroll();
