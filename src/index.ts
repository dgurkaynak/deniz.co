import './style.css';
import { isWebGLSupported } from './utils';
import { disableBodyScroll } from 'body-scroll-lock';


// Disable body scroll
disableBodyScroll(document.body);

// Add javascript-enabled class
document.body.classList.add('javascript-enabled');

// Get some element references
const mainElement = document.getElementById('main');
const headingTextElement = document.getElementById('heading-text');

// Add about button
const aboutButtonElement = document.createElement('span');
aboutButtonElement.id = 'about-button';
aboutButtonElement.textContent = 'About';
mainElement.insertBefore(aboutButtonElement, headingTextElement.nextSibling);

// About button click
aboutButtonElement.addEventListener('click', () => {
  const isOpened = mainElement.classList.contains('opened');
  if (isOpened) {
    mainElement.classList.remove('opened');
  } else {
    mainElement.classList.add('opened');
  }
}, false);


async function main() {
  // If webgl is not supported, open about text
  if (!isWebGLSupported) {
    mainElement.classList.add('opened');
  } else {
    // TODO: Minimal loading effect maybe?
    await import(/* webpackChunkName: "scene" */ './scene');
  }
}


window.onload = main;
