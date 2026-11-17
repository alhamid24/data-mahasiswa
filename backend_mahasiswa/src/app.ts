
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mahasiswaRouter from './modules/mahasiswa/mahasiswa.route.js';
import { errorMiddleware } from './shared/middlewares/error.middleware.js';
import authRouter from './modules/auth/auth.route.js';
import { startTokenBlacklistCleanup } from './shared/jobs/token-blacklist-cleanup.job.js';
import usersRouter from './modules/users/users.route.js';

const app = express();

startTokenBlacklistCleanup();

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// Health check
app.get('/health', (req, res) => {

    res.status(200).json({

        success: true,
        message: 'API is running'

    });

});

app.use('/api/mahasiswa', mahasiswaRouter);

app.use(errorMiddleware);

app.use('/api/mahasiswa', mahasiswaRouter);

app.use('/api/auth', authRouter);

app.use(errorMiddleware);

app.use('/api/mahasiswa', mahasiswaRouter);

app.use('/api/users', usersRouter);

export default app;