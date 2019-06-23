import './style.css';
import { isWebGLSupported } from './utils';
import { disableBodyScroll } from 'body-scroll-lock';
import * as HeadingText from './heading-text';


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
    HeadingText.startThreeDotLoading();
    await import(/* webpackChunkName: "scene" */ './scene');
  }

  // Print github repo to console
  console.log(
    '%cHey there, if you\'re interested: source code of this website avaliable on https://github.com/dgurkaynak/deniz.co',
    'font-size: 16px; color: blue;'
  );
}


window.onload = main;
