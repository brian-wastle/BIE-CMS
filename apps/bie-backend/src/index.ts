import express from 'express';

const app = express();

app.get('/', (_, res) => res.send('Backend is running!'));

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
