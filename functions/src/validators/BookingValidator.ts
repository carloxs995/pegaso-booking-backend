import { z } from 'zod';
import { IBookingBase, IBookingDetails } from '../models/booking.model';

export class BookingValidator {
    static readonly PaymentMethodSchema = z.enum(
        ['credit_card', 'paypal', 'cash'],
        {
            message: 'PaymentMethodSchema not valid'
        }
    );

    static readonly RoomTypeSchema = z.enum(
        ['Standard', 'Deluxe', 'Suite', 'Luxury', 'Penthouse'],
        {
            message: 'RoomTypeSchema not valid'
        }
    );

    static readonly StatusSchema = z.enum(
        ['pending', 'confirmed', 'cancelled', 'completed'],
        {
            message: 'StatusSchema not valid'
        }
    )

    static readonly BaseSchema = z.object({
        customerFirstName: z.string().min(1, 'customerFirstName is mandatory'),
        customerLastName: z.string().min(1, 'customerLastName is mandatory'),
        customerEmail: z.string().email('customerEmail not valid'),
        customerPhone: z.string().min(1, 'customerPhone not valid').max(13, 'customerPhone not valid'),
        serviceName: this.RoomTypeSchema,
        quantity: z.number().int().positive('quantity not valid'),
        checkInDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'checkInDate not valid',
        }),
        checkOutDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'checkOutDate not valid',
        }),
        paymentMethod: this.PaymentMethodSchema,
        notes: z.string().optional(),
    });

    static readonly UpdateSchema = this.BaseSchema.extend({
        isPaid: z.boolean({
            required_error: "Payment status (isPaid) is required.",
            invalid_type_error: "Payment status (isPaid) must be a boolean value."
        }),
        status: this.StatusSchema,
        createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid createdAt date format. Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).",
        }),
        updatedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid updatedAt date format. Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).",
        }),
        servicePrice: z.number().positive("Service price must be a positive number."),
        totalAmount: z.number().positive("Total amount must be a positive number."),
    })

    static parseCreation(request: IBookingBase) {
        return this.BaseSchema.parse(request);
    }

    static parseUpdate(request: IBookingDetails) {
        return this.UpdateSchema.parse(request);
    }
}
