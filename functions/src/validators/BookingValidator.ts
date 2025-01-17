import { z } from 'zod';
import { IBookingBase, IBookingDetails } from '../models/booking.model';

export class BookingValidator {
    static readonly PaymentMethodSchema = z.enum(['credit_card', 'paypal', 'cash']);

    static readonly RoomTypeSchema = z.enum(['Standard', 'Deluxe', 'Suite', 'Luxury', 'Penthouse']);

    static readonly BookingBaseSchema = {
        customerName: z.string().min(1, 'Il nome del cliente è obbligatorio'),
        customerEmail: z.string().email('Email non valida'),
        customerPhone: z.string().min(1).max(13),
        serviceName: BookingValidator.RoomTypeSchema,
        quantity: z.number().int().positive('La quantità deve essere positiva'),
        checkInDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Data di check-in non valida',
        }),
        checkOutDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Data di check-out non valida',
        }),
        paymentMethod: BookingValidator.PaymentMethodSchema,
        notes: z.string().optional(),
    };

    static parseCreation(request: IBookingBase) {
        const bookingCreationSchema = z.object(BookingValidator.BookingBaseSchema);
        return bookingCreationSchema.parse(request);
    }

    static parseUpdate(request: IBookingDetails) {
        // const bookingUpdateSchema = z.object({
        //     ...BookingValidator.BookingBaseSchema,
        //         isPaid: z;
        //         status: BookingStatus;
        //         createdAt: string;           // Data di creazione della prenotazione (ISO Date)
        //         updatedAt: string;          // Data di ultimo aggiornamento (ISO Date)
        //         servicePrice: number;
        //         totalAmount: number;
        // })
    }
}
