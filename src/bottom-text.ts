import * as baffle from 'baffle';
import { sleep } from './utils';


enum State {
  IDLE,
  NOT_SUPPORTED_BROWSER,
  PROCESSING
};

const Text = {
  IDLE: 'Do not drag an image here',
  IDLE_HOVER: `Don't worry, it all happens in your browser`,
  NOT_SUPPORTED_BROWSER: 'This browser is too old, try latest Chrome',
  PROCESSING: 'Processing...'
};

const BAFFLE_DURATION = 500;


// Main container element
const element = document.createElement('div');
element.id = 'bottom-text';
document.body.appendChild(element);

// File input element
const fileInputElement = document.createElement('input');
fileInputElement.id = 'file-input';
fileInputElement.type = 'file';
fileInputElement.accept = 'image/*';
element.appendChild(fileInputElement);

// Text element
const textElement = document.createElement('span');
element.appendChild(textElement);


let state: State;
let onInputChange: (fileList: FileList) => void;
const b = baffle(textElement);


export function init(onInputChange_: (fileList: FileList) => void) {
  state = State.IDLE;
  setText(Text.IDLE);
  onInputChange = onInputChange_;
  showFileInput();
}


export function setStateIdle() {
  state = State.IDLE;
  baffleReveal(Text.IDLE, BAFFLE_DURATION);
  showFileInput();
}


export function setStateNotSupportedBrowser() {
  state = State.NOT_SUPPORTED_BROWSER;
  baffleReveal(Text.NOT_SUPPORTED_BROWSER, BAFFLE_DURATION);
  hideFileInput();
}


export function setStateProcessing() {
  state = State.PROCESSING;
  // Use `setText` instead of `baffleReveal` because main thread is probably
  // blocked by swap helper loading stuff.
  setText(Text.PROCESSING);
  hideFileInput();
}

export async function displayTemporaryMessage(text: string, duration: number) {
  baffleReveal(text, BAFFLE_DURATION);
  await sleep(duration);
}


function baffleReveal(text: string, duration: number) {
  b.text(() => text);
  b.reveal(duration);
}


function setText(text: string) {
  textElement.textContent = text;
}


function showFileInput() {
  element.classList.add('show-file-input');
}


function hideFileInput() {
  element.classList.remove('show-file-input');
}


fileInputElement.addEventListener('change', (e) => {
  onInputChange && onInputChange((e.target as any).files);
}, false);


fileInputElement.addEventListener('mouseenter', () => {
  if (state != State.IDLE) return;
  baffleReveal(Text.IDLE_HOVER, BAFFLE_DURATION);
}, false);


fileInputElement.addEventListener('mouseleave', () => {
  if (state != State.IDLE) return;
  baffleReveal(Text.IDLE, BAFFLE_DURATION);
}, false);
