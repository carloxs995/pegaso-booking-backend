import { z } from 'zod';
import { IBookingBase } from '../models/booking.model';

export class BookingValidator {
    static parseCreation(request: IBookingBase) {
        const PaymentMethodSchema = z.enum(['credit_card', 'paypal', 'cash']);

        const RoomTypeSchema = z.enum(['Standard', 'Deluxe', 'Suite', 'Luxury', 'Penthouse']);

        const BookingBaseSchema = z.object({
            customerName: z.string().min(1, 'Il nome del cliente è obbligatorio'),
            customerEmail: z.string().email('Email non valida'),
            customerPhone: z.string().optional(),
            serviceName: RoomTypeSchema,
            quantity: z.number().int().positive('La quantità deve essere positiva'),
            checkInDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
                message: 'Data di check-in non valida',
            }),
            checkOutDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
                message: 'Data di check-out non valida',
            }),
            paymentMethod: PaymentMethodSchema,
            totalAmount: z.number().positive('Il totale deve essere positivo'),
            notes: z.string().optional(),
        });

        return BookingBaseSchema.parse(request);
    }
}
