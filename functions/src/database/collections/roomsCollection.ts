import 'reflect-metadata';

import { inject, injectable } from "tsyringe";
import { IRoomBase, IRoomDetails, IRoomType, RoomFilter } from "../../models/room.model";
import { dbFirestore } from "../firestore";
import { DITokens } from '../../di-tokens';
import { BookingsCollection } from './BookingsCollection';
import { IBookingsFiltersListSchema } from '../../models/booking.model';

@injectable()
export class RoomsCollection {
    // Riferimento alla collezione 'rooms' nel database Firestore
    readonly collection = dbFirestore.collection('rooms');

    constructor(
        @inject(DITokens.bookingsCollection) private readonly _bookingsCollection: BookingsCollection
    ) { }

    /**
     * Aggiunge un nuovo elemento alla collezione 'rooms'.
     * @param {IRoomBase} item - I dettagli della stanza.
     * @returns {Promise<string>} - L'ID dell'elemento creato.
     */
    async addItem(item: IRoomBase): Promise<string> {
        const itemCreated = await this.collection.add(item);
        await itemCreated.update({ id: itemCreated.id });
        return itemCreated.id;
    }

    /**
     * Ottiene un elemento dalla collezione 'rooms' per tipo.
     * @param {IRoomType} type - Il tipo di stanza.
     * @returns {Promise<IRoomDetails | undefined>} - I dettagli della stanza.
     */
    async getItemByType(type: IRoomType): Promise<IRoomDetails | undefined> {
        const res = await this.collection
            .where('type', '==', type)
            .get();

        if (res.empty) {
            return undefined;
        }

        return res.docs[0].data() as IRoomDetails;
    }

    /**
     * Aggiorna un elemento esistente nella collezione 'rooms'.
     * @param {string} id - L'ID dell'elemento da aggiornare.
     * @param {Partial<IRoomBase>} item - I dettagli della stanza da aggiornare.
     * @returns {Promise<string>} - L'ID dell'elemento aggiornato.
     */
    async updateItem(id: string, item: Partial<IRoomBase>): Promise<string> {
        await this.collection.doc(id).update(item as { [key: string]: any });
        return id;
    }

    /**
     * Elimina un elemento dalla collezione 'rooms'.
     * @param {string} id - L'ID dell'elemento da eliminare.
     * @returns {Promise<void>}
     */
    async deleteItem(id: string): Promise<void> {
        await this.collection.doc(id).delete();
    }

    /**
     * Ottiene tutti gli elementi dalla collezione 'rooms' in base ai filtri specificati.
     * @param {RoomFilter} [filters] - I filtri per la ricerca.
     * @returns {Promise<IRoomDetails[]>} - La lista delle stanze.
     */
    async getAllItems(filters?: RoomFilter): Promise<IRoomDetails[]> {
        let queryBase: FirebaseFirestore.Query = this.collection;

        // Applica i filtri alla query
        if (filters?.serviceType) {
            queryBase = queryBase.where('type', '==', filters.serviceType);
        }

        const roomsRetrieve = await queryBase.get();

        let availableRooms: IRoomDetails[] = [];

        // Mappa i risultati della query in un array di stanze disponibili
        roomsRetrieve.forEach((doc) => {
            availableRooms.push({ id: doc.id, ...doc.data() } as IRoomDetails);
        });

        // Se sono specificate le date di check-in e check-out, filtra le stanze disponibili
        if (filters?.checkInDate && filters?.checkOutDate) {
            const bookingFilters: IBookingsFiltersListSchema = {
                serviceType: filters?.serviceType,
                checkInDate: filters?.checkInDate,
                checkOutDate: filters?.checkOutDate //TODO: al momento stiamo ignorando il numero di ospiti
            };

            const bookedRoomsData = await this._bookingsCollection.getAllItems(bookingFilters);

            // Mappa le stanze disponibili per aggiungere la quantità disponibile e filtra quelle completamente prenotate
            availableRooms = availableRooms.map((room) => {
                // Conta il numero di prenotazioni per il tipo di stanza corrente
                const bookedCount = bookedRoomsData.items
                    .filter((booking) => booking.serviceName === room.type)
                    .length;

                // Restituisce un nuovo oggetto stanza con tutte le proprietà originali e la quantità disponibile
                return {
                    ...room,
                    availableQuantity: room.totalRooms - bookedCount
                };
            }).filter((room) => room.availableQuantity > 0);
        }

        return availableRooms;
    }

    /**
     * Ottiene un elemento dalla collezione 'rooms' per ID.
     * @param {string} id - L'ID dell'elemento da ottenere.
     * @returns {Promise<IRoomDetails | undefined>} - I dettagli della stanza.
     */
    async getItemById(id: string): Promise<IRoomDetails | undefined> {
        const item = await this.collection.doc(id).get();
        if (!item.exists) {
            return undefined;
        }

        return item.data() as IRoomDetails;
    }
}
