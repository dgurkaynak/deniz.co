import times from 'lodash/times';


const defaultTitle = 'Deniz Gürkaynak';
const headingEl = document.getElementById('heading');
const headingTitleEl = document.getElementById('heading-title');
let b: any;
let isShowingDefaultText = false;
let title = '';
let link = '';

const headingLinkEl = document.createElement('a');
headingLinkEl.id = 'heading-link';
headingLinkEl.textContent = '[?]';
headingLinkEl.setAttribute('target', '_blank');

const mainElement = document.getElementById('main');
const lineHeight = 21;
const correctMaxLineHeightInterval = setInterval(correctMaxLineHeight, 500);


/**
 * When about text is opened, show the default text w/ baffle animation.
 */
export function showDefaultTitle() {
  if (isShowingDefaultText) {
    return;
  }

  isShowingDefaultText = true;
  stopAllAnimations();
  b && b.text(() => defaultTitle);
  b && b.reveal(500);

  headingLinkEl.parentElement?.removeChild(headingLinkEl);
}


/**
 * When about text is collapsed, show the current image's text.
 */
export function returnToLastState() {
  if (!isShowingDefaultText) {
    return;
  }

  stopAllAnimations();
  b && b.text(() => title);
  b && b.reveal(500);
  isShowingDefaultText = false;

  if (link) {
    headingEl.appendChild(headingLinkEl);
  } else {
    headingLinkEl.parentElement?.removeChild(headingLinkEl);
  }
}


/**
 * Stops all the animations.
 */
export function stopAllAnimations() {
  stopThreeDotLoading();
  stopBaffleAnimation();
}


/**
 * Checks heading element's offset height and estimate the line count.
 * Set it as an attribute, so css can adjust it's max-height (check style.css).
 */
export function correctMaxLineHeight() {
  const lineCount = Math.floor(headingEl.offsetHeight / lineHeight);
  mainElement.setAttribute('data-line-count', `${lineCount}`);
}


/**
 * Gracefully imports baffle library and initalizes it.
 * So, if it's already initalized, NOOP.
 */
export async function init() {
  if (!b) {
    const { default: baffle } = await import(/* webpackChunkName: "baffle" */ 'baffle');
    b = baffle(headingTitleEl);
  }
}

/**
 * Starts baffle animation.
 */
export async function startBaffleAnimation() {
  await init();

  if (isShowingDefaultText) {
    return;
  }

  b.start();
}


/**
 * Stops baffle animation.
 */
async function stopBaffleAnimation() {
  await init();
  b.stop();
}


/**
 * Updates the title w/ baffle animation, and [?] link.
 */
export async function update(options: {
  title: string,
  link?: string,
  baffleAnimationDuration: number
}) {
  await init();

  title = options.title;
  link = options.link;
  headingLinkEl.href = options.link || '';

  if (isShowingDefaultText) {
    return;
  }

  b.text(() => title);
  b.reveal(options.baffleAnimationDuration);

  if (link) {
    headingEl.appendChild(headingLinkEl);
  } else {
    headingLinkEl.parentElement?.removeChild(headingLinkEl);
  }
}


/**
 * Three dot loading animation stuff.
 */
const threeDotUpdateIntervalDuration = 500;
let threeDotUpdateInterval: any;
let threeDotUpdateCount = 0;

export function startThreeDotLoading() {
  if (isShowingDefaultText) {
    return;
  }

  threeDotUpdateCount = 0
  headingTitleEl.textContent = defaultTitle;
  clearTimeout(threeDotUpdateInterval);
  threeDotUpdateInterval = setTimeout(onThreeDotLoadingTick, threeDotUpdateIntervalDuration);
}


function onThreeDotLoadingTick() {
  threeDotUpdateCount = (threeDotUpdateCount % 3) + 1;
  const dotStr = times(threeDotUpdateCount, () => `.`).join('');
  headingTitleEl.textContent = defaultTitle + dotStr;
  threeDotUpdateInterval = setTimeout(onThreeDotLoadingTick, threeDotUpdateIntervalDuration);
}


export function stopThreeDotLoading() {
  clearTimeout(threeDotUpdateInterval);
}
