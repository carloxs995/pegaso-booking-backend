import { z } from 'zod';
import { IBookingBase } from '../models/booking.model';
import { RoomsCollection } from '../database/collections/roomsCollection';
import { BookingCollection } from '../database/collections/bookingsCollection';
import { IRoomBase } from '../models/room.model';

export class RoomValidator {
    static readonly RoomTypeEnum = z.enum( //TODO: pensare se dare la possibilità di creare più stanze custom
        ['Standard', 'Deluxe', 'Suite', 'Luxury', 'Penthouse'],
        {
            message: 'RoomTypeSchema not valid'
        }
    );

    static readonly BaseSchema = z.object({
        type: this.RoomTypeEnum,
        name: z.string().min(1, "At least 5 chars must be provided"),
        description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
        capacity: z.number().int().positive("Capacity must be a positive integer"),
        pricePerNight: z.number().positive("Price per night must be a positive number"),
        amenities: z.array(z.string()).min(1, "At least one amenity must be provided"),
        available: z.boolean().optional().default(true),
        images: z.array(z.instanceof(Blob)).optional(), // Validazione per Blob array
    });

    static parseCreation(request: IRoomBase) {
        return this.BaseSchema.strict().strip().parse(request);
    }

    static async isRoomAvailable(booking: IBookingBase): Promise<boolean> {
        const roomDoc = await RoomsCollection.getItemPerType(booking.serviceName);

        if (!roomDoc) {
            return false;
        }

        const maxQuantity = roomDoc.capacity;
        const bookingsSnapshot = await BookingCollection.getAllItems({
            serviceType: booking.serviceName,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate
        });

            return !!(maxQuantity - bookingsSnapshot.totalCount);
    }
}
