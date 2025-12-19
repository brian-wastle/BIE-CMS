// Usage:
// npm run prod:ssr                # start API and SSR
// npm run prod:ssr --back-only    # API only
// npm run prod:ssr --ssr-only     # SSR only
// npm run prod:ssr --skip-back    # no backend
// npm run prod:ssr --skip-ssr     # no SSR


const runAll = require('npm-run-all');

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);

let runBack = !has('--ssr-only') && !has('--skip-back') && !has('--skip-api');
let runSsr = !has('--back-only') && !has('--skip-ssr');

if (has('--back-only')) {
  runBack = true;
  runSsr = false;
}
if (has('--ssr-only')) {
  runSsr = true;
  runBack = false;
}

const tasks = [];
if (runBack) tasks.push('start:back');
if (runSsr) tasks.push('start:ssr');

if (!tasks.length) {
  console.error('Nothing to run. Remove skip flags or choose a target.');
  process.exit(1);
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

runAll(tasks, {
  parallel: true,
  stdout: process.stdout,
  stderr: process.stderr,
  stdin: process.stdin,
})
  .then(() => process.exit(0))
  .catch((error) => {
    if (error && typeof error.message === 'string') {
      console.error(error.message);
    }
    if (error && typeof error.code === 'number') {
      process.exit(error.code);
    }
    process.exit(1);
  });
