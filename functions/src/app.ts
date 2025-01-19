import * as express from 'express';
import * as cors from 'cors';
import bookingsRouter from './routes/bookings.routes';
import { roomsRouter } from './routes/rooms.routes';

const app = express();

app.use(cors({origin: true}));
app.use(express.json());

// Routes
app.use('/bookings', bookingsRouter);
app.use('/rooms', roomsRouter);

export default app;
