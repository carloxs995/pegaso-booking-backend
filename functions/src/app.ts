import * as express from 'express';
import * as cors from 'cors';
import './di-container';
import bookingsRouter from './routes/bookings.routes';
import usersRouter from './routes/users.routes';
import roomsRouter from './routes/rooms.routes';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use('/bookings', bookingsRouter);
app.use('/rooms', roomsRouter);
app.use('/users', usersRouter);

export default app;
