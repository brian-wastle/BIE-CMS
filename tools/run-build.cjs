// Usage examples:
// npm run build:prod               # full build
// npm run build:prod --front-only  # lib and frontend
// npm run build:prod --back-only   # lib and backend
// npm run build:prod --skip-lib    # no lib rebuild

const runAll = require('npm-run-all');

const args = process.argv.slice(2);

const has = (flag) => args.includes(flag);

let buildFront = !has('--back-only') && !has('--skip-front') && !has('--skip-frontend');
let buildBack = !has('--front-only') && !has('--skip-back') && !has('--skip-backend');
const buildLib = !has('--skip-lib');

if (has('--front-only')) {
  buildFront = true;
  buildBack = false;
}
if (has('--back-only')) {
  buildBack = true;
  buildFront = false;
}

const tasks = [];
if (buildLib) tasks.push('lib:build');
if (buildBack) tasks.push('build:back');
if (buildFront) tasks.push('build:front');

if (!tasks.length) {
  console.error('Nothing to build. Remove the skip flags or choose a target.');
  process.exit(1);
}

runAll(tasks, {
  parallel: false,
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
