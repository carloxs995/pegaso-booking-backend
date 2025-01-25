import 'reflect-metadata';

import { z } from 'zod';
import { IBookingBase, IBookingDetails, IBookingsFiltersListSchema } from '../models/booking.model';
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
        checkInDate: z.string().refine(date => !date || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(date), {
            message: "Check-in date must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)."
        })
            .optional(),
        checkOutDate:z.string().refine(date => !date || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(date), {
            message: "Check-out date must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)."
        })
            .optional(),
        notes: z.string().optional(),
        paymentMethod: BookingValidator.PaymentMethodSchema.default(BookingValidator.PaymentMethodSchema.Enum.cash).optional(), //only accepted Cash method
    });

    static readonly BookingsFiltersListSchema = z.object({
        serviceType: RoomValidator.RoomTypeEnum.optional(),
        checkInDate: z.string().refine(date => !date || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(date), {
            message: "Check-in date must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)."
        })
            .optional(),
        checkOutDate: z.string()
            .refine(date => !date || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(date), {
                message: "Check-out date must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)."
            })
            .optional(),
        pagination: z.object({
            continuation: z.string().nullable(),
            pageSize: z.number().int().positive().default(15),
        }).optional(),
        serviceName: RoomValidator.RoomTypeEnum.optional(),
        isPaid: z.boolean().optional()
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

    async mapItemWithDefaultValue(item: IBookingBase, userUid: string): Promise<IBookingDetails> {
        const RoomsService = container.resolve<RoomsService>(DITokens.roomsService);

        return {
            ...item,
            id: '',
            createdAt: new Date().toISOString(),
            isPaid: false,
            status: BookingValidator.StatusSchema.Enum.pending,
            paymentMethod: BookingValidator.PaymentMethodSchema.Enum.cash,
            updatedAt: new Date().toISOString(),
            servicePrice: await RoomsService.calculateRoomPrice(item.serviceName, item.checkInDate, item.checkOutDate, item.quantityGuests),
            createdBy: userUid
        }
    }

    parseFilters(filters: IBookingsFiltersListSchema) {
        return BookingValidator.BookingsFiltersListSchema.strict().strip().parse(filters);
    }
}
