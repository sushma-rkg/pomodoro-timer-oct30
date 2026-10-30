const DEFAULT = 30 * 1000; // temporary test length, normal is 25 * 60 * 1000
const MIN = 30 * 1000;
const MAX = 120 * 60 * 1000;

const art = document.querySelector('.art');
const timerEl = document.querySelector('.timer');
const mainBtn = document.getElementById('main-btn');
const resetBtn = document.getElementById('reset-btn');
const screen = document.querySelector('.screen');
const panel = document.querySelector('.panel');
const timerBtn = document.getElementById('timer-btn');
const timerInput = document.getElementById('timer-input');
const msg = document.getElementById('msg');

let state = 'idle'; // idle, running, paused, done
let duration = DEFAULT;
let remaining = DEFAULT;
let endTime = 0;
let interval = null;
let editing = false;

function show() {
  const secs = Math.ceil(remaining / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  timerEl.textContent = mm + ':' + ss;
  const blur = 16 * remaining / duration;
  art.style.setProperty('--blur', blur + 'px');
  art.style.setProperty('--scale', 1 + blur / 80);
}

function format(ms) {
  const total = Math.ceil(ms / 1000);
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

function lockTimer(locked) {
  timerBtn.disabled = locked;
}

function readLength(text) {
  const match = /^(\d+):(\d+)$/.exec(text.trim());
  if (!match) {
    msg.textContent = 'Please type the time like 10:00.';
    return;
  }
  const ms = (Number(match[1]) * 60 + Number(match[2])) * 1000;
  if (ms < MIN || ms > MAX) {
    msg.textContent = 'Please pick a time from 00:30 to 120:00.';
    return;
  }
  msg.textContent = '';
  duration = ms;
}

function startEditing() {
  if (state !== 'idle') return;
  editing = true;
  timerInput.value = format(duration);
  timerBtn.hidden = true;
  timerInput.hidden = false;
  timerInput.focus();
  timerInput.select();
}

function stopEditing() {
  editing = false;
  timerInput.hidden = true;
  timerBtn.hidden = false;
}

function commitEdit() {
  if (!editing) return;
  const text = timerInput.value;
  stopEditing();
  readLength(text);
  remaining = duration;
  show();
}

// Placeholder details for now. Real ones from the Met come in a later step.
function showDetails() {
  const box = document.createElement('div');
  box.className = 'label';
  box.id = 'details';

  const title = document.createElement('strong');
  title.textContent = 'Painting name';
  const artist = document.createElement('span');
  artist.textContent = 'Artist name';
  const year = document.createElement('span');
  year.textContent = 'Year';
  const link = document.createElement('a');
  link.href = 'https://www.metmuseum.org/';
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = 'Read about this painting';

  box.append(title, artist, year, link);
  panel.append(box);
}

function finish() {
  clearInterval(interval);
  state = 'done';
  screen.classList.add('done');
  mainBtn.textContent = 'Restart session';
  resetBtn.hidden = true;
  showDetails();
}

function tick() {
  remaining = Math.max(0, endTime - Date.now());
  show();
  if (remaining === 0) finish();
}

function start() {
  commitEdit();
  lockTimer(true);
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
  duration = DEFAULT;
  remaining = DEFAULT;
  msg.textContent = '';
  lockTimer(false);
  mainBtn.textContent = 'Start';
  resetBtn.hidden = false;
  screen.classList.remove('done');
  const details = document.getElementById('details');
  if (details) details.remove();
  show();
}

mainBtn.addEventListener('click', () => {
  if (state === 'running') pause();
  else if (state === 'done') reset();
  else start();
});
resetBtn.addEventListener('click', reset);
timerBtn.addEventListener('click', startEditing);
timerInput.addEventListener('blur', commitEdit);
timerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') commitEdit();
  if (e.key === 'Escape') stopEditing();
});

document.addEventListener('visibilitychange', () => {
  if (state === 'running') tick();
});

show();
