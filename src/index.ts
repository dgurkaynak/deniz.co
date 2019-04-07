import './style.css';


async function main() {
  // TODO: Maybe check webgl support and fallback?
  // TODO: Minimal loading effect maybe?
  await import(/* webpackChunkName: "scene" */ './scene');
}


window.onload = main;
