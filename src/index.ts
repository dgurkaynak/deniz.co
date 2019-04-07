import './style.css';


async function main() {
  const SHOULD_LOAD_LAZY_SCRIPT = true;

  if (SHOULD_LOAD_LAZY_SCRIPT) {
    await import(/* webpackChunkName: "lazy-script" */ './lazy-script');
    console.log('executed');
  }
}

main();
