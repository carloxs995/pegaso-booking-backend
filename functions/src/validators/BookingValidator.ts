import { z } from 'zod';
import { IBookingBase, IBookingDetails } from '../models/booking.model';

export class BookingValidator {
    static readonly PaymentMethodSchema = z.enum(
        ['cash'],
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
        quantityGuests: z.number().int().positive('quantityGuests not valid'),
        checkInDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'checkInDate not valid',
        }),
        checkOutDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'checkOutDate not valid',
        }),
        notes: z.string().optional(),
        paymentMethod: this.PaymentMethodSchema.default(this.PaymentMethodSchema.Enum.cash).optional(), //only accepted Cash method
    });

    static parseCreation(request: IBookingBase) {
        return this.BaseSchema.strict().strip().parse(request);
    }

    static parseUpdate(request: IBookingBase) {
        return this.BaseSchema
        .pick({
            customerFirstName: true,
            customerLastName: true,
            customerEmail: true,
            customerPhone: true,
            notes: true
        })
        .strict()
        .strip()
        .parse(request);
    }

    static mapItemWithDefaultValue(item: IBookingBase): IBookingDetails {
        return {
            ...item,
            createdAt: new Date().toISOString(),
            isPaid: false,
            status: BookingValidator.StatusSchema.Enum.pending,
            paymentMethod: BookingValidator.PaymentMethodSchema.Enum.cash,
            updatedAt: new Date().toISOString(),
            servicePrice: 0      //TODO: set servicePrice param: price according to roomType selected and guests selected
        }
    }
}
