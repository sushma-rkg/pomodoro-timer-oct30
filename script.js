const DEFAULT = 30 * 1000; // temporary test length, normal is 25 * 60 * 1000
const MIN = 30 * 1000;
const MAX = 120 * 60 * 1000;

const art = document.querySelector('.art');
const timerEl = document.querySelector('.timer');
const mainBtn = document.getElementById('main-btn');
const resetBtn = document.getElementById('reset-btn');
const screen = document.querySelector('.screen');
const panel = document.querySelector('.panel');
const minInput = document.getElementById('min-input');
const secInput = document.getElementById('sec-input');
const msg = document.getElementById('msg');

let state = 'idle'; // idle, running, paused, done
let duration = DEFAULT;
let remaining = DEFAULT;
let endTime = 0;
let interval = null;

function show() {
  const secs = Math.ceil(remaining / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  timerEl.textContent = mm + ':' + ss;
  const blur = 16 * remaining / duration;
  art.style.setProperty('--blur', blur + 'px');
  art.style.setProperty('--scale', 1 + blur / 80);
}

function fillBoxes() {
  const total = duration / 1000;
  minInput.value = Math.floor(total / 60);
  secInput.value = String(total % 60).padStart(2, '0');
}

function lockBoxes(locked) {
  minInput.disabled = locked;
  secInput.disabled = locked;
}

function readLength() {
  const m = minInput.value.trim();
  const sec = secInput.value.trim();
  if (!/^\d+$/.test(m) || !/^\d+$/.test(sec)) {
    msg.textContent = 'Please use whole numbers, like 10 and 00.';
    return;
  }
  const ms = (Number(m) * 60 + Number(sec)) * 1000;
  if (ms < MIN || ms > MAX) {
    msg.textContent = 'Please pick a time from 00:30 to 120:00.';
    return;
  }
  msg.textContent = '';
  duration = ms;
}

function changeLength() {
  if (state !== 'idle') return;
  readLength();
  remaining = duration;
  fillBoxes();
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
  changeLength();
  lockBoxes(true);
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
  fillBoxes();
  lockBoxes(false);
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
// Check the length only once the person has left both boxes, so a half-edited time is not rejected.
document.querySelector('.setter').addEventListener('focusout', (e) => {
  if (!e.currentTarget.contains(e.relatedTarget)) changeLength();
});
document.querySelector('.setter').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') changeLength();
});

document.addEventListener('visibilitychange', () => {
  if (state === 'running') tick();
});

fillBoxes();
show();
