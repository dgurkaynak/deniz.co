import './style.css';


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
  // TODO: Maybe check webgl support and fallback?
  // TODO: Minimal loading effect maybe?
  await import(/* webpackChunkName: "scene" */ './scene');
}


window.onload = main;
