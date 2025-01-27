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

    /**
     * Verifica se una stanza è disponibile per le date e il numero di ospiti specificati.
     * @param {string} id - L'ID della stanza.
     * @param {Pick<IBookingBase, 'checkInDate' | 'checkOutDate' | 'quantityGuests'>} booking - I dettagli della prenotazione.
     * @returns {Promise<{ roomsMaxQuantity: number; freeRooms: number; isAvailable: boolean; totalPrice: number }>} - I dettagli della disponibilità della stanza.
     */
    async isRoomAvailable(
        id: string,
        booking: Pick<IBookingBase, 'checkInDate' | 'checkOutDate' | 'quantityGuests'>
    ): Promise<{ roomsMaxQuantity: number; freeRooms: number; isAvailable: boolean; totalPrice: number }> {

        // Ottiene i dettagli della stanza dal database utilizzando l'ID
        const roomDoc = await this._roomsCollection.getItemById(id);

        // Se la stanza non esiste, lancia un errore
        if (!roomDoc) {
            throw Error('isRoomAvailable: item not found');
        }

        // Ottiene il numero massimo di stanze disponibili
        const maxQuantity = roomDoc.totalRooms;

        // Ottiene tutte le prenotazioni per il tipo di stanza e le date specificate
        const bookings = await this._bookingsCollection.getAllItems({
            serviceType: roomDoc.type,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate
        });

        // Verifica se ci sono stanze disponibili
        const isAvailable = !!(maxQuantity - bookings.totalCount);

        // Calcola il prezzo totale della stanza per le date e il numero di ospiti specificati
        const totalPrice = await this.calculateRoomPrice(roomDoc.type, booking.checkInDate, booking.checkOutDate, booking.quantityGuests)

        // Restituisce i dettagli della disponibilità della stanza
        return {
            roomsMaxQuantity: maxQuantity,
            freeRooms: maxQuantity - bookings.totalCount,
            isAvailable,
            totalPrice
        };
    }

    /**
     * Calcola il prezzo totale della stanza per le date e il numero di ospiti specificati.
     * @param {IRoomType} roomType - Il tipo di stanza.
     * @param {string} checkInDate - La data di check-in.
     * @param {string} checkOutDate - La data di check-out.
     * @param {number} guests - Il numero di ospiti.
     * @returns {Promise<number>} - Il prezzo totale della stanza.
     * @throws {Error} - Se il tipo di stanza non esiste o se le date non sono valide.
     */
    async calculateRoomPrice(roomType: IRoomType, checkInDate: string, checkOutDate: string, guests: number): Promise<number> {
        // Ottiene i dettagli della stanza dal database utilizzando il tipo di stanza
        const roomDetails = await this._roomsCollection.getItemByType(roomType);
        if (!roomDetails) {
            throw new Error(`Room type not found: ${roomType}`);
        }

        // Converte le stringhe ISO in oggetti Date
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        // Calcola il numero di notti (differenza in millisecondi)
        const timeDifference = checkOut.getTime() - checkIn.getTime();
        const nights = timeDifference / (1000 * 60 * 60 * 24);

        // Se le date non sono valide, lancia un errore
        if (nights <= 0) {
            throw new Error("checkInDate and checkOutDate date is not valid");
        }

        // Calcola il prezzo base moltiplicando il prezzo per notte per il numero di notti
        const basePrice = roomDetails.pricePerNight * nights;

        // Calcola il costo extra per ospite (10% per ogni ospite aggiuntivo)
        const extraCostPerGuest = 0.10; // 10%
        const extraGuestCharge = guests > 1 ? basePrice * extraCostPerGuest * (guests - 1) : 0;

        // Calcola il prezzo totale
        const totalPrice = basePrice + extraGuestCharge;
        const priceFixed = Math.round(totalPrice * 100) / 100; // Arrotonda il prezzo a due decimali
        return priceFixed;
    }
}
