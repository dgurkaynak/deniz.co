import './style.css';
import * as HeadingText from './heading-text';



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
    aboutButtonElement.textContent = 'About';
  } else {
    mainElement.classList.add('opened');
    aboutButtonElement.textContent = 'Close';
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
}


function isWebGLSupported() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}


window.onload = main;
