import express from 'express';
import cookieParser from 'cookie-parser';
import auth from './auth.js';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/auth', auth);

/* existing API alive route */
app.get('/', (_, res) => res.send('API alive'));

app.listen(4000, () => console.log('API on :4000'));