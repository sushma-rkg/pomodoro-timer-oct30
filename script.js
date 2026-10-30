const DEFAULT = 25 * 60 * 1000;
const MIN = 30 * 1000;
const MAX = 120 * 60 * 1000;

// Department 11 is European Paintings, so almost every result is a real painting with an image.
const SEARCH_URL = 'https://collectionapi.metmuseum.org/public/collection/v1.1/search?departmentId=11&hasImages=true&medium=Paintings';
const PAGE = 500;
const OBJECT_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

const art = document.querySelector('.art');
const artImg = document.getElementById('art-img');
const artMsg = document.getElementById('art-msg');
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

const TIMEOUT = 10000; // how long the Met gets to answer, per request
const MAX_TRIES = 5; // how many different paintings to try
const LOADING_TEXT = 'Loading painting…';
const FAILED_TEXT = "We couldn't load a painting right now. You can still use the timer. Refresh the page to try again.";

function setArtMessage(text, calm) {
  artMsg.textContent = text;
  artMsg.classList.toggle('calm', Boolean(calm));
}

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
  if (!response.ok) throw new Error('The Met answered with an error');
  return response.json();
}

// Resolves with the loaded image, or rejects if it fails or takes too long.
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => reject(new Error('Image took too long')), TIMEOUT);
    img.onload = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); reject(new Error('Image did not load')); };
    img.src = url;
  });
}

// Picks a random public domain painting that has an image that loads.
// A record that does not qualify is quietly skipped, up to MAX_TRIES paintings. Returns null if none work.
// If the Met does not answer or returns an error, this throws.
async function pickPainting() {
  const { total } = await fetchJson(SEARCH_URL + '&limit=1');
  const offset = Math.floor(Math.random() * Math.max(1, total - PAGE + 1));
  const { objectIDs } = await fetchJson(SEARCH_URL + '&limit=' + PAGE + '&offset=' + offset);
  const ids = (objectIDs || []).slice();

  for (let tries = 0; tries < MAX_TRIES && ids.length > 0; tries++) {
    const id = ids.splice(Math.floor(Math.random() * ids.length), 1)[0];
    const record = await fetchJson(OBJECT_URL + id);
    const isPainting = String(record.classification || '').includes('Painting');
    if (!record.isPublicDomain || !isPainting || !record.primaryImageSmall) continue;
    try {
      const img = await loadImage(record.primaryImageSmall);
      return {
        image: record.primaryImageSmall,
        ratio: img.naturalWidth / img.naturalHeight,
        title: record.title,
        artist: record.artistDisplayName || 'Unknown',
        year: record.objectDate || 'Unknown',
        url: record.objectURL,
      };
    } catch (error) {
      continue; // the image did not load, so try another painting
    }
  }
  return null;
}

async function loadPainting() {
  const thisLoad = ++loadId;
  painting = null;
  artImg.hidden = true;
  artImg.removeAttribute('src');
  setArtMessage(LOADING_TEXT);

  let next = null;
  try {
    next = await pickPainting();
  } catch (error) {
    next = null; // the Met is not responding
  }
  if (thisLoad !== loadId) return;

  if (!next) {
    setArtMessage(FAILED_TEXT, true);
    return;
  }
  painting = next;
  art.style.setProperty('--ratio', next.ratio);
  artImg.onload = () => {
    setArtMessage('');
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
