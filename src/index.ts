import './style.css';
import * as Heading from './heading';



// Add javascript-enabled class
document.body.classList.add('javascript-enabled');


async function main() {
  // If webgl is supported, load scene
  if (isWebGLSupported) {
    Heading.startThreeDotLoading();
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
