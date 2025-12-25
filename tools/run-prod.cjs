// Usage:
// npm run prod:ssr                   # start API, SSR, CSR bundle servers
// npm run prod:ssr --back-only       # API only
// npm run prod:ssr --ssr-only        # SSR only
// npm run prod:ssr --csr-only        # CSR bundle only
// npm run prod:ssr --skip-back       # no backend
// npm run prod:ssr --skip-ssr        # no SSR
// npm run prod:ssr --skip-csr        # no CSR bundle server


const runAll = require('npm-run-all');

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);

let runBack = !has('--ssr-only') && !has('--skip-back') && !has('--skip-api');
let runSsr = !has('--back-only') && !has('--skip-ssr');
let runCsr = !has('--back-only') && !has('--ssr-only') && !has('--skip-csr') && !has('--skip-browser') && !has('--skip-front');

if (has('--back-only')) {
  runBack = true;
  runSsr = false;
  runCsr = false;
}
if (has('--ssr-only')) {
  runSsr = true;
  runBack = false;
  runCsr = false;
}
if (has('--csr-only') || has('--browser-only') || has('--front-only')) {
  runCsr = true;
  runBack = false;
  runSsr = false;
}

const tasks = [];
if (runBack) tasks.push('start:back');
if (runSsr) tasks.push('start:ssr');
if (runCsr) tasks.push('start:csr');

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
