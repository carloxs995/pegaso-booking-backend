import 'reflect-metadata';

import { inject, injectable } from "tsyringe";
import { IRoomBase, IRoomDetails, IRoomType, RoomFilter } from "../../models/room.model";
import { dbFirestore } from "../firestore";
import { DITokens } from '../../di-tokens';
import { BookingsCollection } from './BookingsCollection';
import { IBookingsFiltersListSchema } from '../../models/booking.model';

@injectable()
export class RoomsCollection {
    readonly collection = dbFirestore.collection('rooms');

    constructor(
        @inject(DITokens.bookingsCollection) private readonly _bookingsCollection: BookingsCollection
    ) {

    }

    async addItem(item: IRoomBase): Promise<string> {
        const itemCreated = await this.collection.add(item);
        await itemCreated.update({ id: itemCreated.id });
        return itemCreated.id;
    }

    async getItemByType(type: IRoomType): Promise<IRoomDetails | undefined> {
        const res = await this.collection
            .where('type', '==', type)
            .get();

        if (res.empty) {
            return undefined;
        }

        return res.docs[0].data() as IRoomDetails;
    }

    async updateItem(id: string, item: Partial<IRoomBase>): Promise<string> {
        await this.collection.doc(id).update(item as { [key: string]: any });
        return id;
    }

    async deleteItem(id: string): Promise<void> {
        await this.collection.doc(id).delete();
    }

    async getAllItems(filters?: RoomFilter): Promise<IRoomDetails[]> {
        let queryBase: FirebaseFirestore.Query = this.collection;

        if (filters?.serviceType) {
            queryBase = queryBase.where('type', '==', filters.serviceType);
        }

        const roomsRetrieve = await queryBase.get();

        let availableRooms: IRoomDetails[] = [];

        roomsRetrieve.forEach((doc) => {
            availableRooms.push({ id: doc.id, ...doc.data() } as IRoomDetails);
        });

        if (filters?.checkInDate && filters?.checkOutDate) {
            const bookingFilters: IBookingsFiltersListSchema = {
                serviceType: filters?.serviceType,
                checkInDate: filters?.checkInDate,
                checkOutDate: filters?.checkOutDate //TODO: al momento stiamo ignorando il numero di ospiti
            };

            const bookedRoomsData = await this._bookingsCollection.getAllItems(bookingFilters);

            availableRooms = availableRooms.filter((room) => {
                const bookedCount = bookedRoomsData.items
                    .filter((booking) => booking.serviceName === room.type)
                    .length;
                return room.totalRooms - bookedCount > 0;
            }).map((room) => ({
                ...room,
                availableQuantity: room.totalRooms - bookedRoomsData.items
                    .filter((booking) => booking.serviceName === room.type)
                    .length
            }));
        }

        return availableRooms;
    }

    async getItemById(id: string): Promise<IRoomDetails | undefined> {
        const item = await this.collection.doc(id).get();
        if (!item.exists) {
            return undefined;
        }

        return item.data() as IRoomDetails;
    }
}

