import baffle from 'baffle';
import times from 'lodash/times';


const defaultText = 'Deniz Gürkaynak';
const headingTextEl = document.getElementById('heading-text');
const b = baffle(headingTextEl);
let isLocked = false;
let nonLockedText = '';


/**
 * Main methods
 */
export function lock() {
  if (isLocked) {
    return;
  }

  isLocked = true;
  stopAllAnimations();
  b.text(() => defaultText);
  b.reveal(500);
}


export function unlock() {
  if (!isLocked) {
    return;
  }

  stopAllAnimations();
  b.text(() => nonLockedText);
  b.reveal(500);
  isLocked = false;
}


export function stopAllAnimations() {
  stopThreeDotLoading();
  stopBaffling();
}


/**
 * Baffle stuff
 */
export function startBaffling(text?: string) {
  if (isLocked) {
    if (text) nonLockedText = text;
    return;
  }

  if (text) {
    nonLockedText = text;
    b.text(() => nonLockedText);
  }
  b.start();
}


export function stopBaffling() {
  b.stop();
}


export function baffleReveal(text: string, duration: number) {
  if (isLocked) {
    if (text) nonLockedText = text;
    return;
  }

  if (text) {
    nonLockedText = text;
    b.text(() => nonLockedText);
  }
  b.reveal(duration);
}


/**
 * Three dot loading.
 */
const threeDotUpdateIntervalDuration = 500;
let threeDotUpdateInterval: any;
let threeDotUpdateCount = 0;

export function startThreeDotLoading() {
  if (isLocked) {
    return;
  }

  threeDotUpdateCount = 0
  nonLockedText = defaultText;
  headingTextEl.textContent = nonLockedText;
  threeDotUpdateInterval = setTimeout(onThreeDotLoadingTick, threeDotUpdateIntervalDuration);
}


function onThreeDotLoadingTick() {
  threeDotUpdateCount = (threeDotUpdateCount % 3) + 1;
  const dotStr = times(threeDotUpdateCount, () => `.`).join('');
  nonLockedText = defaultText + dotStr;
  headingTextEl.textContent = nonLockedText;
  threeDotUpdateInterval = setTimeout(onThreeDotLoadingTick, threeDotUpdateIntervalDuration);
}


export function stopThreeDotLoading() {
  clearTimeout(threeDotUpdateInterval);
}
