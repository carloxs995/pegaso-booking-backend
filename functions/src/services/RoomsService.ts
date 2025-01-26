import 'reflect-metadata';

import { inject, injectable } from "tsyringe";
import { IBookingBase } from "../models/booking.model";
import { IRoomType } from "../models/room.model";
import { BookingsCollection } from "../database/collections/BookingsCollection";
import { RoomsCollection } from "../database/collections/RoomsCollection";
import { DITokens } from '../di-tokens';

@injectable()
export class RoomsService {
    constructor(
        @inject(DITokens.bookingsCollection) private readonly _bookingsCollection: BookingsCollection,
        @inject(DITokens.roomsCollection) private readonly _roomsCollection: RoomsCollection
    ) { }

    async isRoomAvailable(
        id: string,
        booking: Pick<IBookingBase, 'checkInDate' | 'checkOutDate' | 'quantityGuests'>
    ): Promise<{ roomsMaxQuantity: number; freeRooms: number; isAvailable: boolean; totalPrice: number }> {

        const roomDoc = await this._roomsCollection.getItemById(id);

        if (!roomDoc) {
            throw Error('isRoomAvailable: item not found');
        }

        const maxQuantity = roomDoc.totalRooms;

        const bookings = await this._bookingsCollection.getAllItems({
            serviceType: roomDoc.type,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate
        });

        const isAvailable = !!(maxQuantity - bookings.totalCount);

        const totalPrice = await this.calculateRoomPrice(roomDoc.type, booking.checkInDate, booking.checkOutDate, booking.quantityGuests)


        return {
            roomsMaxQuantity: maxQuantity,
            freeRooms: maxQuantity - bookings.totalCount,
            isAvailable,
            totalPrice
        };
    }

    async calculateRoomPrice(roomType: IRoomType, checkInDate: string, checkOutDate: string, guests: number): Promise<number> {
        const roomDetails = await this._roomsCollection.getItemByType(roomType);
        if (!roomDetails) {
            throw new Error(`Room type not found: ${roomType}`);
        }

        // Convert ISO string to Date object
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        // Calculate the number of nights (difference in milliseconds)
        const timeDifference = checkOut.getTime() - checkIn.getTime();
        const nights = timeDifference / (1000 * 60 * 60 * 24);

        if (nights <= 0) {
            throw new Error("checkInDate and checkOutDate date is not valid");
        }

        const basePrice = roomDetails.pricePerNight * nights;

        const extraCostPerGuest = 0.10; //10%
        const extraGuestCharge = guests > 1 ? basePrice * extraCostPerGuest * (guests - 1) : 0;

        // Prezzo finale
        const totalPrice = basePrice + extraGuestCharge;
        const priceFixed = Math.round(totalPrice * 100) / 100;
        return priceFixed;
    }
}
