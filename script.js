const DEFAULT = 25 * 60 * 1000;
const MIN = 30 * 1000;
const MAX = 120 * 60 * 1000;

const SEARCH_URL = 'https://collectionapi.metmuseum.org/public/collection/v1.1/search';
const OBJECT_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

const art = document.querySelector('.art');
const artImg = document.getElementById('art-img');
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
let painting = null; // kept in memory only, shown once the timer finishes
let loadId = 0;

function show() {
  const secs = Math.ceil(remaining / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  timerEl.textContent = mm + ':' + ss;
  art.style.setProperty('--left', remaining / duration);
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

async function fetchJson(url) {
  const response = await fetch(url);
  return response.json();
}

// Picks a random public domain painting that has an image. If one does not qualify, quietly tries another.
async function pickPainting() {
  const offset = Math.floor(Math.random() * 9500);
  const search = await fetchJson(SEARCH_URL + '?hasImages=true&medium=Paintings&limit=500&offset=' + offset);
  while (true) {
    const id = search.objectIDs[Math.floor(Math.random() * search.objectIDs.length)];
    const record = await fetchJson(OBJECT_URL + id);
    if (record.isPublicDomain && record.primaryImageSmall && record.classification.includes('Painting')) {
      return {
        image: record.primaryImageSmall,
        title: record.title,
        artist: record.artistDisplayName || 'Unknown',
        year: record.objectDate || 'Unknown',
        url: record.objectURL,
      };
    }
  }
}

async function loadPainting() {
  const thisLoad = ++loadId;
  painting = null;
  artImg.hidden = true;
  artImg.removeAttribute('src');
  const next = await pickPainting();
  if (thisLoad !== loadId) return;
  painting = next;
  artImg.onload = () => {
    art.style.setProperty('--ratio', artImg.naturalWidth / artImg.naturalHeight);
    artImg.hidden = false;
  };
  artImg.src = next.image;
}

function showDetails() {
  if (!painting) return;
  const box = document.createElement('div');
  box.className = 'label';
  box.id = 'details';

  const title = document.createElement('strong');
  title.textContent = painting.title;
  const artist = document.createElement('span');
  artist.textContent = painting.artist;
  const year = document.createElement('span');
  year.textContent = painting.year;
  const link = document.createElement('a');
  link.href = painting.url;
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
  else if (state === 'done') { reset(); loadPainting(); }
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
loadPainting();
