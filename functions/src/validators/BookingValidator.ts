import 'reflect-metadata';

import { z } from 'zod';
import { IBookingBase, IBookingDetails } from '../models/booking.model';
import { RoomValidator } from './RoomValidator';
import { container, injectable } from 'tsyringe';
import { RoomsService } from '../services/RoomsService';
import { DITokens } from '../di-tokens';

@injectable()
export class BookingValidator {
    static readonly PaymentMethodSchema = z.enum(
        ['cash'],
        {
            message: 'PaymentMethodSchema not valid'
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
        serviceName: RoomValidator.RoomTypeEnum,
        quantityGuests: z.number().int().positive('quantityGuests not valid'),
        checkInDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'checkInDate not valid',
        }),
        checkOutDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'checkOutDate not valid',
        }),
        notes: z.string().optional(),
        paymentMethod: BookingValidator.PaymentMethodSchema.default(BookingValidator.PaymentMethodSchema.Enum.cash).optional(), //only accepted Cash method
    });

    parseCreation(request: IBookingBase) {
        return BookingValidator.BaseSchema.strict().strip().parse(request);
    }

    parseUpdate(request: IBookingBase) {
        return BookingValidator.BaseSchema
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

    async mapItemWithDefaultValue(item: IBookingBase): Promise<IBookingDetails> {
        const RoomsService = container.resolve<RoomsService>(DITokens.roomsCollection);

        return {
            ...item,
            createdAt: new Date().toISOString(),
            isPaid: false,
            status: BookingValidator.StatusSchema.Enum.pending,
            paymentMethod: BookingValidator.PaymentMethodSchema.Enum.cash,
            updatedAt: new Date().toISOString(),
            servicePrice: await RoomsService.calculateRoomPrice(item.serviceName, item.checkInDate, item.checkOutDate, item.quantityGuests)
        }
    }
}
