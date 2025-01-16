import * as express from 'express';
import * as cors from 'cors';
import bookingRouter from './routes/booking.routes';

const app = express();

app.use(cors({origin: true}));
app.use(express.json());

// Routes
app.use('/bookings', bookingRouter);

export default app;
