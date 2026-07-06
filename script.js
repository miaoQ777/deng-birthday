/* ============================================================
   赛博朋克生日祝福网站 — 主脚本
   场景管理 · 音效引擎 · 终端动画 · 进度条 · 横屏检测
   ============================================================ */

// ============================================================
// 工具函数
// ============================================================

/** 延迟工具：返回一个在 ms 毫秒后 resolve 的 Promise */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 获取 DOM 元素快捷方式 */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ============================================================
// 背景粒子画布
// ============================================================

class ParticleBackground {
  constructor() {
    this.canvas = $('#bg-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 50;
    this.resize();
    this.initParticles();
    this.bindEvents();
    this.animate();
  }

  /** 调整画布尺寸以匹配视口 */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /** 初始化粒子 */
  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speedY: Math.random() * 0.3 + 0.1,
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.4 + 0.1,
        flickerSpeed: Math.random() * 0.02 + 0.005,
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
  }

  /** 每帧绘制 */
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      // 粒子缓慢上浮
      p.y -= p.speedY;
      p.x += p.speedX;
      // 随机闪烁
      p.opacity += (Math.random() - 0.5) * p.flickerSpeed;
      p.opacity = Math.max(0.05, Math.min(0.5, p.opacity));

      // 越界后重置到底部
      if (p.y < -5) {
        p.y = this.canvas.height + 5;
        p.x = Math.random() * this.canvas.width;
      }
      if (p.x < -5) p.x = this.canvas.width + 5;
      if (p.x > this.canvas.width + 5) p.x = -5;

      // 绘制绿色微光粒子
      this.ctx.fillStyle = `rgba(0, 255, 65, ${p.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================================
// Web Audio API 音效引擎
// ============================================================

class SoundEngine {
  constructor() {
    // 延迟初始化 AudioContext（需用户首次交互后）
    this.ctx = null;
    this.initialized = false;
  }

  /** 在首次用户交互时初始化 AudioContext（浏览器策略要求） */
  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API 不可用:', e);
    }
  }

  /** 终端打字音效：短促高频 blip */
  playTyping() {
    if (!this.initialized) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.04);
  }

  /** 扫描线音效：从低到高的频率扫描 */
  playScan() {
    if (!this.initialized) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 1.2);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 1.5);
  }

  /** 终端完成音效：短升调 */
  playComplete() {
    if (!this.initialized) return;
    const notes = [523, 659, 784]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.15);
      osc.start(this.ctx.currentTime + i * 0.1);
      osc.stop(this.ctx.currentTime + i * 0.1 + 0.15);
    });
  }

  /** 能量注入音效：快速脉冲上升 */
  playEnergyInject() {
    if (!this.initialized) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(400, this.ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.9);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.9);
  }

  /** 对勾完成音效：清脆叮咚 */
  playCheckmark() {
    if (!this.initialized) return;
    const notes = [784, 988]; // G5, B5
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.08 + 0.2);
      osc.start(this.ctx.currentTime + i * 0.08);
      osc.stop(this.ctx.currentTime + i * 0.08 + 0.2);
    });
  }

  /** 进度条卡住/警告音效：低频脉冲 */
  playWarning() {
    if (!this.initialized) return;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime + i * 0.25);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.25 + 0.2);

      osc.start(this.ctx.currentTime + i * 0.25);
      osc.stop(this.ctx.currentTime + i * 0.25 + 0.2);
    }
  }

  /** 按钮点击音效 */
  playClick() {
    if (!this.initialized) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.12);
  }

  /** 终端报错音效：刺耳短蜂鸣 */
  playErrorBeep() {
    if (!this.initialized) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.setValueAtTime(180, this.ctx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.06);
  }

  /** 访问拒绝音效：低沉嗡鸣 */
  playDenied() {
    if (!this.initialized) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.6);
  }
}

// 全局音效实例
const sound = new SoundEngine();

// ============================================================
// 场景管理器
// ============================================================

class SceneManager {
  constructor() {
    this.currentScene = 0;
    this.transitioning = false;
  }

  /**
   * 切换到指定场景
   * @param {number} sceneNumber - 目标场景编号 (1-5)
   */
  async switchTo(sceneNumber) {
    if (this.transitioning || sceneNumber === this.currentScene) return;
    this.transitioning = true;

    const currentEl = $(`#scene-${this.currentScene}`);
    const targetEl = $(`#scene-${sceneNumber}`);

    // 淡出当前场景
    if (currentEl) {
      currentEl.classList.remove('active');
      currentEl.classList.add('hidden');
    }

    // 短暂延迟后淡入新场景
    await wait(400);

    if (targetEl) {
      targetEl.classList.remove('hidden');
      targetEl.classList.add('active');
    }

    this.currentScene = sceneNumber;
    this.transitioning = false;
  }
}

const scenes = new SceneManager();

// ============================================================
// 横屏锁定检测
// ============================================================

class OrientationLock {
  constructor() {
    this.overlay = $('#orientation-overlay');
    this.check = this.check.bind(this);
    this.init();
  }

  init() {
    // 使用 screen.orientation API 监听变化
    if (screen.orientation) {
      screen.orientation.addEventListener('change', () => this.check());
    }
    // 兜底：监听 resize 事件
    window.addEventListener('resize', () => this.check());
    // 初始检测
    this.check();
  }

  check() {
    const isPortrait = window.innerHeight > window.innerWidth;
    if (isPortrait) {
      this.overlay.classList.add('visible');
      this.overlay.classList.remove('hidden');
    } else {
      this.overlay.classList.add('hidden');
      this.overlay.classList.remove('visible');
    }
  }
}

// ============================================================
// 打字机动画引擎
// ============================================================

class TypeWriter {
  /**
   * @param {HTMLElement} element - 要输出文字的目标元素
   * @param {string} text - 要逐字显示的文字
   * @param {number} speed - 每个字的间隔 (ms)
   */
  constructor(element, text, speed = 60) {
    this.element = element;
    this.text = text;
    this.speed = speed;
    this.charIndex = 0;
  }

  /** 开始打字，返回一个在打完所有字时 resolve 的 Promise */
  async start() {
    this.element.textContent = '';
    this.charIndex = 0;

    return new Promise((resolve) => {
      const type = () => {
        if (this.charIndex < this.text.length) {
          this.element.textContent += this.text[this.charIndex];
          sound.playTyping();
          this.charIndex++;
          // 随机微调速度，模拟真实打字节奏
          const jitter = (Math.random() - 0.5) * 30;
          setTimeout(type, this.speed + jitter);
        } else {
          resolve();
        }
      };
      type();
    });
  }
}

// ============================================================
// 场景零：身份验证门禁
// ============================================================

function runScene0() {
  const input = $('#name-input');
  const errorEl = $('#gate-error');
  const container = $('.name-gate-container');

  // 自动聚焦输入框
  setTimeout(() => input.focus(), 600);

  const tryEnter = () => {
    const name = input.value.trim();

    if (!name) return; // 空输入忽略

    if (name === '邓均泽') {
      // 验证通过：绿色闪光 → 切换到场景一
      sound.init();
      sound.playCheckmark();
      container.classList.add('success-flash');
      input.disabled = true;
      input.style.borderColor = 'var(--text-primary)';
      input.style.boxShadow = '0 0 16px rgba(0, 255, 65, 0.4)';

      setTimeout(async () => {
        await scenes.switchTo(1);
        runScene1();
      }, 800);

    } else {
      // 验证失败：红色抖动 + 错误提示
      sound.init();
      sound.playDenied();
      errorEl.classList.remove('hidden');
      input.style.borderColor = 'var(--accent-red)';
      input.style.boxShadow = '0 0 16px rgba(255, 0, 0, 0.4)';
      input.value = '';

      // 2 秒后清除错误状态
      setTimeout(() => {
        errorEl.classList.add('hidden');
        input.style.borderColor = '';
        input.style.boxShadow = '';
        input.focus();
      }, 2000);
    }
  };

  // 回车提交
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryEnter();
  });

  // 移动端完成按钮
  input.addEventListener('blur', () => {
    // 短暂延迟后检查，给回车事件时间触发
    setTimeout(() => {
      if (input.value.trim() && !input.disabled) {
        tryEnter();
      }
    }, 200);
  });
}

// ============================================================
// 终端报错刷屏
// ============================================================

async function runTerminalErrorSpam() {
  const errorLog = $('#error-log');
  const energyLines = $('#energy-lines');

  // 隐藏能量区，显示报错区
  energyLines.style.display = 'none';
  errorLog.classList.remove('hidden');
  errorLog.classList.add('visible');
  errorLog.innerHTML = '';

  // 报错日志内容
  const errors = [
    { text: '协议冲突 @ 0x7F3A — 无忧无虑写入被拦截',              cls: '' },
    { text: '检测到未授权负面情绪注入向量',                          cls: 'warn' },
    { text: '防火墙告警：外来实体正在侵蚀能量场',                     cls: '' },
    { text: '溯源追踪中... 目标锁定：负面协议「忧」',                 cls: 'warn' },
    { text: '溯源追踪中... 目标锁定：负面协议「虑」',                 cls: 'warn' },
    { text: '能量场完整度下降：97% → 89% → 74%',                   cls: 'critical' },
    { text: '防御协议被绕过 — 需要手动干预',                         cls: 'critical' },
    { text: '无忧无虑核心模块离线风险：高',                           cls: 'critical' },
    { text: '系统建议：立即启动讨伐程序清除外来协议',                  cls: '' },
    { text: '等待用户指令中...',                                     cls: '' },
  ];

  for (let i = 0; i < errors.length; i++) {
    const lineEl = document.createElement('div');
    lineEl.className = 'error-line ' + (errors[i].cls || '');
    errorLog.appendChild(lineEl);

    // 逐字快速打出（比正常快，模拟刷屏感）
    const tw = new TypeWriter(lineEl, errors[i].text, 25);
    sound.playErrorBeep();
    await tw.start();
    await wait(120);

    // 自动滚动
    errorLog.scrollTop = errorLog.scrollHeight;
  }

  await wait(600);

  // 显示警告弹窗
  const warningOverlay = $('#warning-overlay');
  warningOverlay.classList.remove('hidden');
  warningOverlay.classList.add('visible');
  sound.playWarning();
}

// ============================================================
// 场景一：黑客终端初始化
// ============================================================

async function runScene1() {
  // 等待扫描动画完成（CSS 动画时长 1.5s）
  await wait(800);

  // 播放扫描音效
  sound.playScan();

  // 等待扫描线扫过
  await wait(1200);

  // 获取终端行元素
  const line1 = $('#terminal-line-1');
  const line2 = $('#terminal-line-2');
  const line3 = $('#terminal-line-3');
  const line4 = $('#terminal-line-4');
  const cursor = $('#terminal-cursor');

  // 第一行：系统检测中...
  const tw1 = new TypeWriter(line1, '系统检测中...', 90);
  await tw1.start();
  await wait(300);

  // 第二行：经验值扫描
  const tw2 = new TypeWriter(line2, '经验值：99%...', 80);
  await tw2.start();
  await wait(400);

  // 第三行：经验值已满
  const tw3 = new TypeWriter(line3, '经验值已满！触发自动升级程序！', 70);
  await tw3.start();
  await wait(500);

  // 第四行：准备就绪信号
  line4.textContent = '';
  line4.style.color = 'var(--accent-cyan)';
  const tw4 = new TypeWriter(line4, '>>> 升级程序已就绪，正在跳转至能量注入界面...', 60);
  await tw4.start();

  // 完成音效
  sound.playComplete();

  // 光标停止闪烁
  cursor.classList.add('done');

  await wait(800);

  // 切换到场景二
  await scenes.switchTo(2);

  // 启动场景二
  runScene2();
}

// ============================================================
// 场景二：能量注入与冲突
// ============================================================

async function runScene2() {
  const energyLines = $('#energy-lines');
  const errorLog = $('#error-log');
  const warningOverlay = $('#warning-overlay');

  // 重置状态
  energyLines.innerHTML = '';
  energyLines.style.display = '';
  errorLog.classList.remove('visible');
  errorLog.classList.add('hidden');
  warningOverlay.classList.remove('visible');
  warningOverlay.classList.add('hidden');

  await wait(600);

  // 五条能量数据：最后一条是"无忧无虑"，会卡在 25%
  const messages = [
    { text: '开心能量注入中...',    stuck: false },
    { text: '幸福能量注入中...',    stuck: false },
    { text: '信心能量注入中...',    stuck: false },
    { text: '善良品质升级中...',    stuck: false },
    { text: '无忧无虑协议激活中...', stuck: true, stuckAt: 25 },
  ];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    // ----- 创建能量项容器 -----
    const itemEl = document.createElement('div');
    itemEl.className = 'energy-item';
    energyLines.appendChild(itemEl);

    // 文本行
    const textEl = document.createElement('div');
    textEl.className = 'energy-text';
    itemEl.appendChild(textEl);

    // 进度条行（轨道 + 百分比）
    const progressRow = document.createElement('div');
    progressRow.style.cssText = 'display: flex; align-items: center;';
    const trackEl = document.createElement('div');
    trackEl.className = 'energy-mini-track';
    const fillEl = document.createElement('div');
    fillEl.className = 'energy-mini-fill';
    trackEl.appendChild(fillEl);
    const pctEl = document.createElement('span');
    pctEl.className = 'energy-mini-pct';
    pctEl.textContent = '0%';
    progressRow.appendChild(trackEl);
    progressRow.appendChild(pctEl);
    itemEl.appendChild(progressRow);

    // 对勾（仅前四条有）
    let checkEl = null;
    if (!msg.stuck) {
      checkEl = document.createElement('span');
      checkEl.className = 'energy-check';
      checkEl.textContent = '✓';
      textEl.appendChild(checkEl);
    }

    // 让元素进入 DOM 后显示
    await wait(150);
    itemEl.classList.add('visible');

    // ----- 打字显示文本（放慢速度，一字一顿有仪式感）-----
    const tw = new TypeWriter(textEl, msg.text, 90);
    await tw.start();
    await wait(400);

    // ----- 播放注入音效，激活电流特效，填充进度条 -----
    sound.playEnergyInject();
    trackEl.classList.add('live');        // 轨道电流特效
    fillEl.classList.add('filling');      // 填充电光闪烁

    const targetPct = msg.stuck ? msg.stuckAt : 100;
    const duration = msg.stuck ? 2000 : 3200;
    const steps = 50;
    const stepTime = duration / steps;
    const increment = targetPct / steps;

    for (let s = 0; s <= steps; s++) {
      const pct = Math.round(s * increment);
      fillEl.style.width = pct + '%';
      pctEl.textContent = pct + '%';
      await wait(stepTime);
    }

    // 关闭填充闪烁，保留轨道电流
    fillEl.classList.remove('filling');

    if (!msg.stuck) {
      // 前四条：到达 100%，关闭特效，显示绿色对勾
      trackEl.classList.remove('live');
      sound.playCheckmark();
      checkEl.classList.add('show');
      await wait(700);
    } else {
      // 第五条：卡在 25%，电流特效变红，闪烁
      await wait(500);
      trackEl.classList.remove('live');
      fillEl.classList.add('stuck');
      pctEl.style.color = 'var(--accent-red)';
      sound.playWarning();
      await wait(2000);

      // ----- 终端报错刷屏，然后弹窗 -----
      await runTerminalErrorSpam();
    }

    // 滚动到当前能量项
    itemEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ----- 绑定讨伐按钮事件 -----
  const btn1 = $('#btn-fight-1');
  const btn2 = $('#btn-fight-2');

  const handleFight = () => {
    sound.init();
    sound.playClick();
    switchToGame();
  };

  btn1.addEventListener('click', handleFight);
  btn2.addEventListener('click', handleFight);
  btn1.addEventListener('touchend', (e) => { e.preventDefault(); handleFight(); });
  btn2.addEventListener('touchend', (e) => { e.preventDefault(); handleFight(); });
}

// ============================================================
// 场景三：弹幕射击游戏（精灵素材 · 暗色背景 · 单发白弹）
// ============================================================

// ----- 网格常量 -----
const GRID_ROWS = 5;
const CELL_H  = 60;
const GRID_X0 = 44;
const GRID_Y0 = 30;
const PLAYER_COL_W = 56;
const BOSS_COL_W   = 64;
const FIELD_COL_W  = 52;
const BULLET_DMG = 7;
const MINION_HP  = 1;
const BOSS_HP    = 150;

function colX(col) {
  if (col === 0) return GRID_X0;
  return GRID_X0 + PLAYER_COL_W + (col - 1) * FIELD_COL_W;
}
function rowY(row) { return GRID_Y0 + row * CELL_H; }

// ----- 精灵图预加载 -----
const SPRITES = {};
function preloadSprites() {
  const files = { player: '玩家.png', bossYou: '忧.png', bossLv: '虑.png', minion: '负面情绪.png' };
  let pending = Object.keys(files).length;
  return new Promise((resolve) => {
    for (const [key, src] of Object.entries(files)) {
      const img = new Image();
      img.onload = () => { pending--; if (pending === 0) resolve(); };
      img.onerror = () => { pending--; if (pending === 0) resolve(); };
      img.src = encodeURI(src);
      SPRITES[key] = img;
    }
    if (pending === 0) resolve();
  });
}

// ----- 游戏类 -----
class ShootingGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.frame = 0;

    this.playerRow = 2;
    this.playerY = rowY(2) + CELL_H/2;
    this.invincible = 0;
    this.lives = 5;

    this.bosses = [
      { name: '忧', rowStart: 0, rowEnd: 1, hp: BOSS_HP, maxHp: BOSS_HP, alive: true, flash: 0, sprite: SPRITES.bossYou },
      { name: '虑', rowStart: 3, rowEnd: 4, hp: BOSS_HP, maxHp: BOSS_HP, alive: true, flash: 0, sprite: SPRITES.bossLv },
    ];

    this.minions = [];
    this.bullets = [];
    this.particles = [];

    this.shootCooldown = 0;
    this.shootRequested = false;
    this.state = 'playing';
    this.winTimer = 0;
    this.screenShake = 0;

    this.inputUp     = false;
    this.inputDown   = false;
    this.moveCooldown = 0;

    this._bindInput();
  }

  spawnMinion() {
    const row = Math.floor(Math.random() * GRID_ROWS);
    const startX = colX(7) + FIELD_COL_W + 20 + Math.random() * 50;
    this.minions.push({
      x: startX, y: rowY(row) + CELL_H/2,
      row, hp: MINION_HP, maxHp: MINION_HP,
      speed: 0.55 + Math.random() * 0.45,
    });
  }

  shoot() {
    if (!sound.initialized) sound.init();
    const bx = colX(0) + PLAYER_COL_W;
    this.bullets.push({ x: bx, y: this.playerY - 4, r: 5, speed: 4.5 });
    sound.playTyping();
  }

  spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI*2*i)/count + Math.random()*0.4;
      const s = 1 + Math.random()*2.5;
      this.particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 20, maxLife: 20, color });
    }
  }

  // ---------- 输入（单发模式）----------

  _bindInput() {
    this._onKeyDown = (e) => {
      if (e.key === 'ArrowUp'    || e.key === 'w') { this.inputUp = true;     e.preventDefault(); }
      if (e.key === 'ArrowDown'  || e.key === 's') { this.inputDown = true;   e.preventDefault(); }
      if (e.key === ' '          || e.key === 'j') { this.shootRequested = true; e.preventDefault(); }
    };
    this._onKeyUp = (e) => {
      if (e.key === 'ArrowUp'    || e.key === 'w') { this.inputUp = false;    e.preventDefault(); }
      if (e.key === 'ArrowDown'  || e.key === 's') { this.inputDown = false;  e.preventDefault(); }
    };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);

    const bindBtn = (id, action) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (action === 'shoot') { this.shootRequested = true; }
        else { this[action] = true; }
        el.classList.add('pressed');
      });
      el.addEventListener('pointerup', (e) => {
        e.preventDefault();
        if (action !== 'shoot') this[action] = false;
        el.classList.remove('pressed');
      });
      el.addEventListener('pointerleave', () => {
        if (action !== 'shoot') this[action] = false;
        el.classList.remove('pressed');
      });
    };
    bindBtn('btn-up',     'inputUp');
    bindBtn('btn-down',   'inputDown');
    bindBtn('btn-attack', 'shoot');
  }

  _unbindInput() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
  }

  // ---------- 更新 ----------

  update() {
    if (this.state === 'won') {
      this.winTimer++;
      for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.life--; }
      this.particles = this.particles.filter(p => p.life > 0);
      return;
    }

    this.frame++;

    // --- 移动 ---
    this.moveCooldown--;
    if (this.moveCooldown <= 0) {
      if (this.inputUp   && this.playerRow > 0)            { this.playerRow--; this.moveCooldown = 18; }
      if (this.inputDown && this.playerRow < GRID_ROWS-1)  { this.playerRow++; this.moveCooldown = 18; }
    }
    const targetY = rowY(this.playerRow) + CELL_H/2;
    this.playerY += (targetY - this.playerY) * 0.25;
    if (this.invincible > 0) this.invincible--;
    if (this.screenShake > 0) this.screenShake--;

    // --- 单发射击：点一下一颗，12 帧冷却防键盘连发 ---
    this.shootCooldown--;
    if (this.shootRequested && this.shootCooldown <= 0) {
      this.shootCooldown = 12;
      this.shootRequested = false;
      this.shoot();
    } else if (this.shootRequested && this.shootCooldown > 0) {
      this.shootRequested = false;
    }

    // --- 生成小怪 ---
    if (this.frame % (65 + (this.frame % 35)) === 0 && this.minions.length < 6) {
      this.spawnMinion();
    }

    // --- 子弹移动 ---
    for (const b of this.bullets) b.x += b.speed;

    // 子弹 vs BOSS（碰撞框扩大适配大精灵）
    for (const boss of this.bosses) {
      if (!boss.alive) continue;
      const bx = colX(8) - 10, bw = BOSS_COL_W * 2 + 20;
      const by = rowY(boss.rowStart) - 20, bh = (boss.rowEnd - boss.rowStart + 1) * CELL_H + 40;
      for (let i = this.bullets.length-1; i >= 0; i--) {
        const bl = this.bullets[i];
        if (bl.x + bl.r > bx && bl.x - bl.r < bx + bw && bl.y + bl.r > by && bl.y - bl.r < by + bh) {
          boss.hp -= BULLET_DMG;
          boss.flash = 6;
          this.spawnParticles(bl.x, bl.y, '#ffcc00', 5);
          this.bullets.splice(i, 1);
          if (boss.hp <= 0) {
            boss.hp = 0; boss.alive = false;
            this.screenShake = 15;
            this.spawnParticles(bx + bw/2, by + bh/2, '#ff6600', 50);
            sound.playCheckmark();
          }
        }
      }
    }

    // 子弹 vs 小怪（碰撞框 36×44）
    for (const m of this.minions) {
      for (let i = this.bullets.length-1; i >= 0; i--) {
        const bl = this.bullets[i];
        if (Math.abs(bl.x - m.x) < 22 && Math.abs(bl.y - m.y) < 26) {
          m.hp -= BULLET_DMG;
          this.spawnParticles(bl.x, bl.y, '#ffaa00', 3);
          this.bullets.splice(i, 1);
          if (m.hp <= 0) { m.dead = true; this.spawnParticles(m.x, m.y, '#ff6644', 12); }
        }
      }
    }
    this.bullets = this.bullets.filter(b => b.x < 680);
    this.minions = this.minions.filter(m => !m.dead);

    for (const m of this.minions) m.x -= m.speed;
    this.minions = this.minions.filter(m => m.x > -30);

    // 小怪 vs 玩家（碰撞框 30×40）
    if (this.invincible === 0) {
      const px = colX(0) + PLAYER_COL_W/2;
      for (let i = this.minions.length-1; i >= 0; i--) {
        const m = this.minions[i];
        if (Math.abs(m.x - px) < 30 && Math.abs(m.y - this.playerY) < 25) {
          this.lives--;
          this.invincible = 75;
          this.spawnParticles(px, this.playerY, '#ff2222', 16);
          sound.playWarning();
          this.minions.splice(i, 1);
          if (this.lives <= 0) {
            this.lives = 5; this.playerRow = 2;
            this.playerY = rowY(2) + CELL_H/2; this.invincible = 120;
          }
        }
      }
    }

    for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.life--; }
    this.particles = this.particles.filter(p => p.life > 0);
    for (const b of this.bosses) if (b.flash > 0) b.flash--;

    if (this.bosses.every(b => !b.alive)) { this.state = 'won'; this.winTimer = 0; }
    this._updateHUD();
  }

  // ---------- HUD ----------

  _updateHUD() {
    const drawBar = (el, boss) => {
      const pct = Math.max(0, boss.hp / boss.maxHp);
      const n = Math.round(pct * 50);
      el.textContent = '█'.repeat(n) + '░'.repeat(50 - n);
      el.classList.remove('danger', 'dead');
      if (!boss.alive) el.classList.add('dead');
      else if (pct <= 0.3) el.classList.add('danger');
    };
    drawBar(document.getElementById('hp-bar-you'), this.bosses[0]);
    drawBar(document.getElementById('hp-bar-lv'),  this.bosses[1]);
  }

  // ---------- 绘制 ----------

  draw() {
    const ctx = this.ctx;
    let sx = 0, sy = 0;
    if (this.screenShake > 0) { sx = (Math.random()-0.5)*6; sy = (Math.random()-0.5)*6; }
    ctx.save();
    ctx.translate(sx, sy);

    ctx.fillStyle = '#000a00';
    ctx.fillRect(-10, -10, 660, 380);

    ctx.fillStyle = 'rgba(0, 255, 65, 0.025)';
    ctx.fillRect(GRID_X0, GRID_Y0, PLAYER_COL_W, GRID_ROWS * CELL_H);
    ctx.fillStyle = 'rgba(255, 0, 50, 0.02)';
    ctx.fillRect(colX(8), GRID_Y0, BOSS_COL_W * 2, GRID_ROWS * CELL_H);

    // --- BOSS 精灵（压迫感大尺寸 140×160，带光晕）---
    for (const boss of this.bosses) {
      if (!boss.alive) continue;
      const bx = colX(8), bw = BOSS_COL_W * 2;
      const by = rowY(boss.rowStart), bh = (boss.rowEnd - boss.rowStart + 1) * CELL_H;
      const cx = bx + bw/2, cy = by + bh/2;

      const auraAlpha = 0.06 + 0.02 * Math.sin(this.frame * 0.04);
      const auraGrad = ctx.createRadialGradient(cx, cy, bw*0.3, cx, cy, bw*0.9);
      auraGrad.addColorStop(0, 'rgba(255,0,60,' + (auraAlpha*2) + ')');
      auraGrad.addColorStop(1, 'rgba(255,0,60,0)');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(bx - 40, by - 40, bw + 80, bh + 80);

      const spriteW = 140, spriteH = 160;
      const drawX = cx - spriteW/2, drawY = cy - spriteH/2;
      if (boss.sprite && boss.sprite.complete && boss.sprite.naturalWidth > 0) {
        if (boss.flash > 0 && boss.flash % 2 === 0) { ctx.globalAlpha = 0.5; }
        ctx.drawImage(boss.sprite, drawX, drawY, spriteW, spriteH);
        ctx.globalAlpha = 1;
      } else {
        ctx.strokeStyle = 'rgba(255,100,100,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([4,3]);
        ctx.strokeRect(drawX, drawY, spriteW, spriteH); ctx.setLineDash([]);
        ctx.fillStyle = '#fff'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
        ctx.fillText(boss.name, cx, cy);
      }

      const hpW = 120, hpH = 8;
      const hpX = cx - hpW/2, hpY = drawY + spriteH + 6;
      ctx.fillStyle = '#220000'; ctx.fillRect(hpX, hpY, hpW, hpH);
      const ratio = boss.hp / boss.maxHp;
      ctx.fillStyle = ratio > 0.3 ? '#ee3333' : '#990000';
      ctx.fillRect(hpX, hpY, hpW * ratio, hpH);
      ctx.strokeStyle = 'rgba(255,100,100,0.5)'; ctx.lineWidth = 1;
      ctx.strokeRect(hpX, hpY, hpW, hpH);
    }

    // --- 小怪精灵（36×44，带光晕在黑底上显眼）---
    for (const m of this.minions) {
      const mw = 36, mh = 44;
      const dx = m.x - mw/2, dy = m.y - mh/2;

      // 光晕：橙红色径向渐变，让深色小怪在黑底上可见
      const glow = ctx.createRadialGradient(m.x, m.y, mw*0.2, m.x, m.y, mw*0.9);
      glow.addColorStop(0, 'rgba(255,120,40,0.35)');
      glow.addColorStop(0.5, 'rgba(255,60,20,0.12)');
      glow.addColorStop(1, 'rgba(255,60,20,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(dx - 10, dy - 10, mw + 20, mh + 20);

      if (SPRITES.minion && SPRITES.minion.complete && SPRITES.minion.naturalWidth > 0) {
        ctx.drawImage(SPRITES.minion, dx, dy, mw, mh);
      } else {
        ctx.strokeStyle = 'rgba(255,80,30,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
        ctx.strokeRect(dx, dy, mw, mh); ctx.setLineDash([]);
      }
      // HP=1 无需血条，只画一个小红点标记
      ctx.fillStyle = '#ff4422';
      ctx.fillRect(m.x - 2, dy - 6, 4, 3);
    }

    // --- 玩家精灵（40×50）---
    if (this.invincible === 0 || Math.floor(this.invincible / 6) % 2 === 0) {
      const px = colX(0) + PLAYER_COL_W/2, py = this.playerY;
      const pw = 40, ph = 50;
      const pdx = px - pw/2, pdy = py - ph/2;
      if (SPRITES.player && SPRITES.player.complete && SPRITES.player.naturalWidth > 0) {
        ctx.drawImage(SPRITES.player, pdx, pdy, pw, ph);
      } else {
        ctx.strokeStyle = 'rgba(0,255,65,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([4,3]);
        ctx.strokeRect(pdx, pdy, pw, ph); ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(0,255,65,0.4)'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('玩家', px, pdy - 6);
      }
    }

    // --- 白色光点子弹 ---
    for (const b of this.bullets) {
      const grad = ctx.createRadialGradient(b.x, b.y, b.r*0.3, b.x, b.y, b.r*2);
      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(0.4, 'rgba(255,255,200,0.5)');
      grad.addColorStop(1, 'rgba(255,255,200,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r*2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
    }

    // --- 粒子 ---
    for (const p of this.particles) {
      const a = p.life / p.maxLife;
      ctx.fillStyle = hexToRgba(p.color, a);
      const s = 2 + a * 2;
      ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
    }

    ctx.restore();

    // --- 生命 ---
    ctx.fillStyle = 'rgba(0,255,65,0.6)';
    ctx.font = '10px "Courier New", monospace'; ctx.textAlign = 'left';
    ctx.fillText('生命 ' + '♥'.repeat(Math.max(0, this.lives)), GRID_X0, GRID_Y0 + GRID_ROWS * CELL_H + 16);

    // --- 胜利 ---
    if (this.state === 'won') {
      const a = Math.min(1, this.winTimer / 50);
      ctx.fillStyle = 'rgba(0,0,0,' + (a*0.8) + ')';
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = 'rgba(0,255,65,' + a + ')';
      ctx.font = 'bold 28px "Courier New", monospace'; ctx.textAlign = 'center';
      ctx.fillText('讨 伐 完 成', 320, 170);
      ctx.fillStyle = 'rgba(0,255,255,' + a + ')';
      ctx.font = '13px "Courier New", monospace';
      ctx.fillText('「忧」与「虑」已被清除', 320, 200);
    }
  }

  // ---------- 循环 ----------

  gameLoop() {
    if (!this._running) return;
    this.update();
    this.draw();
    if (this.state === 'won' && this.winTimer > 100) {
      this.stop();
      if (this._onClear) this._onClear();
      return;
    }
    requestAnimationFrame(() => this.gameLoop());
  }

  start(onClear) { this._onClear = onClear; this._running = true; this.gameLoop(); }
  stop() { this._running = false; this._unbindInput(); }
}

function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

// ----- 入口 -----

let gameInstance = null;

function switchToGame() {
  const wo = document.getElementById('warning-overlay');
  if (wo) { wo.classList.remove('visible'); wo.classList.add('hidden'); }

  scenes.switchTo(3).then(async () => {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    document.getElementById('hp-bar-you').textContent = '█'.repeat(50);
    document.getElementById('hp-bar-you').classList.remove('danger','dead');
    document.getElementById('hp-bar-lv').textContent  = '█'.repeat(50);
    document.getElementById('hp-bar-lv').classList.remove('danger','dead');

    await preloadSprites();

    canvas.focus();
    gameInstance = new ShootingGame(canvas);
    gameInstance.start(() => setTimeout(gameClear, 600));
  });
}

function gameClear() {
  gameInstance = null;
  scenes.switchTo(4).then(() => runScene4());
}

// ============================================================
// 场景四：白光转场与中考寄语
// ============================================================

async function runScene4() {
  const flash = document.getElementById('white-flash');
  const msgBox = document.getElementById('message-box');

  // 白光乍现
  flash.classList.add('blast');

  // 1.2 秒后浮现文字
  await wait(1300);
  msgBox.classList.add('show');

  // 停留 5 秒
  await wait(5000);

  // 切换到场景五
  await scenes.switchTo(5);
  runScene5();
}

// ============================================================
// 场景五：关灯点蜡烛 + 烟花 + 弹幕祝福
// ============================================================

async function runScene5() {
  const darkRoom = document.getElementById('dark-room');
  const cakeArea = document.getElementById('cake-area');
  const cakeName = document.querySelector('.cake-name');
  const lighter = document.getElementById('lighter');
  const danmakuStage = document.getElementById('danmaku-stage');
  const fwCanvas = document.getElementById('firework-canvas');

  // 重置
  darkRoom.classList.remove('lit');
  cakeArea.classList.remove('show');
  cakeName.classList.remove('show');
  lighter.classList.remove('active', 'near-candle');
  danmakuStage.innerHTML = '';
  fwCanvas.width = window.innerWidth;
  fwCanvas.height = window.innerHeight;

  let candlesLit = false;

  // 蛋糕渐显
  await wait(400);
  cakeArea.classList.add('show');

  // 激活打火机
  lighter.classList.add('active');
  document.body.style.cursor = 'none';

  // ----- 打火机跟随鼠标 -----
  const onMouseMove = (e) => {
    lighter.style.left = e.clientX + 'px';
    lighter.style.top = e.clientY + 'px';

    // 检测是否靠近蜡烛区（蛋糕顶部）
    if (!candlesLit) {
      const cakeRect = cakeArea.getBoundingClientRect();
      const candleY = cakeRect.top + 40;
      const nearX = Math.abs(e.clientX - (cakeRect.left + cakeRect.width/2)) < 60;
      const nearY = Math.abs(e.clientY - candleY) < 50;
      if (nearX && nearY) {
        lighter.classList.add('near-candle');
      } else {
        lighter.classList.remove('near-candle');
      }
    }
  };

  // ----- 点击蜡烛点火 -----
  const onCandleClick = (e) => {
    if (candlesLit) return;
    const cakeRect = cakeArea.getBoundingClientRect();
    const candleY = cakeRect.top + 40;
    const nearX = Math.abs(e.clientX - (cakeRect.left + cakeRect.width/2)) < 70;
    const nearY = Math.abs(e.clientY - candleY) < 60;

    if (nearX && nearY) {
      candlesLit = true;
      lightCandles();
    }
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('click', onCandleClick);
  // 移动端触摸
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    lighter.style.left = t.clientX + 'px';
    lighter.style.top = t.clientY + 'px';
  });
  window.addEventListener('touchend', (e) => {
    if (candlesLit) return;
    const t = e.changedTouches[0];
    const cakeRect = cakeArea.getBoundingClientRect();
    const candleY = cakeRect.top + 40;
    if (Math.abs(t.clientX - (cakeRect.left + cakeRect.width/2)) < 80 &&
        Math.abs(t.clientY - candleY) < 70) {
      candlesLit = true;
      lightCandles();
    }
  });

  // ----- 点火后的庆祝 -----
  async function lightCandles() {
    // 隐藏打火机
    lighter.classList.remove('active', 'near-candle');
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('click', onCandleClick);

    // 掌声 + 完成音效
    sound.init();
    sound.playComplete();
    await wait(200);
    sound.playComplete();

    // 亮灯
    darkRoom.classList.add('lit');

    // 名字弹出
    await wait(300);
    cakeName.classList.add('show');

    // 烟花
    startFireworks(fwCanvas);

    // 弹幕启动
    startDanmaku(danmakuStage);

    // 5 秒后可以切换到终局（或者就这样一直放着）
  }
}

// ----- 烟花引擎 -----

function startFireworks(canvas) {
  const ctx = canvas.getContext('2d');
  const particles = [];
  const W = canvas.width;
  const H = canvas.height;

  function burst(cx, cy, color) {
    const count = 40 + Math.floor(Math.random() * 30);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      particles.push({
        x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 40 + Math.random() * 40, maxLife: 80, color,
        gravity: 0.03 + Math.random() * 0.04,
      });
    }
  }

  // 定时在随机位置放烟花
  const burstInterval = setInterval(() => {
    const cx = W * 0.2 + Math.random() * W * 0.6;
    const cy = H * 0.1 + Math.random() * H * 0.4;
    const colors = ['#ff4444','#ff8844','#ffcc00','#44ff44','#44ccff','#ff44ff','#ffaa00','#ffffff'];
    burst(cx, cy, colors[Math.floor(Math.random() * colors.length)]);
  }, 800);

  // 首次立即放两朵
  burst(W*0.3, H*0.15, '#ffcc00');
  burst(W*0.7, H*0.2, '#ff44ff');

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; // 拖尾
    ctx.fillRect(0, 0, W, H);

    for (let i = particles.length-1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += p.gravity;
      p.life--;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color.replace(')', ', ' + alpha + ')').replace('rgb', 'rgba');
      if (p.color.startsWith('#')) {
        const r = parseInt(p.color.slice(1,3),16), g = parseInt(p.color.slice(3,5),16), b = parseInt(p.color.slice(5,7),16);
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.5 * alpha + 1, 0, Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();

  // 存一下以便停止（不需要，一直放）
  canvas._fireworkInterval = burstInterval;
}

// ----- 弹幕引擎 -----

function startDanmaku(stage) {
  const blessings = [
    '中考必胜！',
    '全服第一大帅哥生日快乐！',
    '邓均泽永远无忧无虑！',
    '未来可期，前程似锦！',
    '15岁生日快乐！',
    '天天开心，事事顺利！',
    '你是最棒的！',
    '考上理想高中！',
    '兄弟永远挺你！',
    '无忧无虑，自由自在！',
  ];

  // 弹幕行高
  const rowH = 36;
  const maxRows = Math.floor(stage.clientHeight / rowH);
  let rowTimers = new Array(maxRows).fill(0);

  function spawnOne() {
    const row = Math.floor(Math.random() * maxRows);
    const now = Date.now();
    // 每行至少间隔 1.5 秒
    if (now - rowTimers[row] < 1500) return;
    rowTimers[row] = now;

    const text = blessings[Math.floor(Math.random() * blessings.length)];
    const el = document.createElement('div');
    el.className = 'danmaku-item';
    el.textContent = text;
    el.style.top = (row * rowH + 8) + 'px';
    el.style.left = '100vw';

    // 随机颜色
    const colors = ['#ffcc00','#ff6644','#44ccff','#88ff44','#ff44aa','#ffffff','#ffaa00'];
    el.style.color = colors[Math.floor(Math.random() * colors.length)];

    // 飞行时间 6~10 秒
    const dur = 6 + Math.random() * 4;
    el.style.animationDuration = dur + 's';

    stage.appendChild(el);

    // 动画结束后移除
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, dur * 1000 + 200);
  }

  // 每 600ms 尝试发射一条
  const spawnInterval = setInterval(spawnOne, 600);
  spawnOne();
  spawnOne();

  stage._danmakuInterval = spawnInterval;
}

// ============================================================
// 应用初始化入口
// ============================================================

async function init() {
  new ParticleBackground();
  new OrientationLock();

  const initAudio = () => {
    sound.init();
    document.removeEventListener('click', initAudio);
    document.removeEventListener('touchend', initAudio);
  };
  document.addEventListener('click', initAudio);
  document.addEventListener('touchend', initAudio);

  await wait(500);
  runScene0();
}

document.addEventListener('DOMContentLoaded', init);
