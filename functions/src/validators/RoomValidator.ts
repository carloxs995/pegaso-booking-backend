import 'reflect-metadata';

import { z } from 'zod';
import { IRoomBase, RoomFilter } from '../models/room.model';
import { injectable } from 'tsyringe';

@injectable()
export class RoomValidator {
    static readonly RoomTypeEnum = z.enum( //TODO: pensare se dare la possibilità di creare più stanze custom
        ['Standard', 'Deluxe', 'Suite', 'Luxury', 'Penthouse'],
        {
            message: 'RoomTypeSchema not valid'
        }
    );

    static readonly BaseSchema = z.object({
        type: RoomValidator.RoomTypeEnum,
        name: z.string().min(1, "At least 5 chars must be provided"),
        description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
        capacity: z.number().int().positive("Capacity must be a positive integer"),
        totalRooms: z.number().int().positive("totalRooms must be a positive integer"),
        pricePerNight: z.number().positive("Price per night must be a positive number"),
        amenities: z.array(z.string()).min(1, "At least one amenity must be provided"),
        available: z.boolean().optional().default(true),
        images: z.array(z.string()).min(1, "At least one image must be provided"),
    });

    static readonly RoomsFilterBaseSchema = z.object({
        serviceType: RoomValidator.RoomTypeEnum.optional(),
        guests: z.preprocess((val) => {
            if (typeof val === "string") {
                return parseInt(val, 10);
            }
            return val;
        }, z.number()
            .int("The number of guests must be an integer.")
            .min(1, "At least one guest is required.")
            .optional()),
        checkInDate: z.string()
            .refine(date => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(date), {
                message: "Check-in date must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)."
            })
            .optional(),
        checkOutDate: z.string()
            .refine(date => !date || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(date), {
                message: "Check-out date must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)."
            })
            .optional(),
    })
        .strict()
        .strip()
        .refine(data => !data.checkOutDate || !data.checkInDate || new Date(data.checkOutDate) > new Date(data.checkInDate), {
            message: "Check-out date must be after the check-in date.",
            path: ["checkOutDate"]
        });

    parseCreation(request: IRoomBase) {
        return RoomValidator.BaseSchema.strict().strip().parse(request);
    }

    parseUpdate(request: IRoomBase) {
        return RoomValidator.BaseSchema
            .omit({
                type: true
            })
            .strict()
            .strip()
            .parse(request);
    }

    parseFilters(filters: RoomFilter) {
        return RoomValidator.RoomsFilterBaseSchema.parse(filters);
    }
}
