import 'normalize.css';
import './style.css';


async function main() {
  console.log('Hello world');
  const SHOULD_LOAD_LAZY_SCRIPT = true;

  if (SHOULD_LOAD_LAZY_SCRIPT) {
    const lazyModule: any = await import(/* webpackChunkName: "lazy-script" */ './lazy-script');
    console.log(lazyModule.default(1, 5));
  }
}

main();
