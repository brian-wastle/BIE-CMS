const runAll = require('npm-run-all');

const args = process.argv.slice(2);
const wantsSsr = args.some((arg) => arg === '--ssr' || arg === '-ssr') || process.env.SSR === '1';

const tasks = wantsSsr ? ['serve:ssr', 'dev:back'] : ['dev:front', 'dev:back'];

runAll(tasks, {
  parallel: true,
  stdout: process.stdout,
  stderr: process.stderr,
  stdin: process.stdin,
})
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    if (error && typeof error.message === 'string') {
      console.error(error.message);
    }
    if (error && typeof error.code === 'number') {
      process.exit(error.code);
    }
    process.exit(1);
  });
