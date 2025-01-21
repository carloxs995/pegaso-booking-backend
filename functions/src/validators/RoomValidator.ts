import { z } from 'zod';
import { IRoomBase } from '../models/room.model';
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
        images: z.array(z.instanceof(Blob)).optional(), // Validazione per Blob array
    });

    parseCreation(request: IRoomBase) {
        return RoomValidator.BaseSchema.strict().strip().parse(request);
    }
}
