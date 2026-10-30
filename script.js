const DURATION = 30 * 1000; // temporary test length, normal is 25 * 60 * 1000

const art = document.querySelector('.art');
const timerEl = document.querySelector('.timer');
const mainBtn = document.getElementById('main-btn');
const resetBtn = document.getElementById('reset-btn');

let state = 'idle'; // idle, running, paused, done
let remaining = DURATION;
let endTime = 0;
let interval = null;

function show() {
  const secs = Math.ceil(remaining / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  timerEl.textContent = mm + ':' + ss;
  const blur = 16 * remaining / DURATION;
  art.style.setProperty('--blur', blur + 'px');
  art.style.setProperty('--scale', 1 + blur / 80);
}

function tick() {
  remaining = Math.max(0, endTime - Date.now());
  if (remaining === 0) {
    state = 'done';
    clearInterval(interval);
    mainBtn.disabled = true;
  }
  show();
}

function start() {
  endTime = Date.now() + remaining;
  state = 'running';
  mainBtn.textContent = 'Pause';
  interval = setInterval(tick, 100);
  tick();
}

function pause() {
  clearInterval(interval);
  remaining = Math.max(0, endTime - Date.now());
  state = 'paused';
  mainBtn.textContent = 'Resume';
  show();
}

function reset() {
  clearInterval(interval);
  state = 'idle';
  remaining = DURATION;
  mainBtn.textContent = 'Start';
  mainBtn.disabled = false;
  show();
}

mainBtn.addEventListener('click', () => {
  if (state === 'running') pause();
  else start();
});
resetBtn.addEventListener('click', reset);

document.addEventListener('visibilitychange', () => {
  if (state === 'running') tick();
});

show();
