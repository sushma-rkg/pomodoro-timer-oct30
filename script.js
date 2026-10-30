const DURATION = 30 * 1000; // temporary test length, normal is 25 * 60 * 1000

const art = document.querySelector('.art');
const timerEl = document.querySelector('.timer');
const mainBtn = document.getElementById('main-btn');
const resetBtn = document.getElementById('reset-btn');
const screen = document.querySelector('.screen');
const panel = document.querySelector('.panel');

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

document.addEventListener('visibilitychange', () => {
  if (state === 'running') tick();
});

show();
