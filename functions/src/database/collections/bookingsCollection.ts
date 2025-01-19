import { IBookingDetails } from "../../models/booking.model";
import { IRoomType } from "../../models/room.model";
import { dbFirestore } from "../firestore";

export interface BookingFilters {
    serviceType?: IRoomType;
    checkInDate?: string;
    checkOutDate?: string;
}

export class BookingCollection {
    static readonly collection = dbFirestore.collection('bookings');

    static async addItem(item: IBookingDetails): Promise<string> {
        try {
            const res = await BookingCollection.collection.add(item);
            return res.id;
        } catch (e: any) {
            throw new Error(`BookingCollection addItem error:'${e?.message}`)
        }
    }

    static async updateItem(id: string, item: Partial<IBookingDetails>): Promise<string> {
        try {
            await BookingCollection.collection.doc(id).update(item as { [key: string]: any });
            return id;
        } catch (e: any) {
            throw new Error(`BookingCollection updateItem error:'${e?.message}`)
        }
    }

    static async deleteItem(id: string): Promise<void> {
        try {
            await BookingCollection.collection.doc(id).delete();
        } catch (e: any) {
            throw new Error(`BookingCollection deleteItem error:'${e?.message}`)
        }
    }

    static async getAllItems(filters?: BookingFilters): Promise<{ items: IBookingDetails[], totalCount: number }> {
        try {
            const queryBase = BookingCollection.collection;
            if (filters?.serviceType) {
                queryBase.where('serviceName', '==', filters.serviceType);
            }
            if (filters?.checkInDate) {
                queryBase.where('checkInDate', '<', filters.checkOutDate);
            }
            if (filters?.serviceType) {
                queryBase.where('checkOutDate', '>', filters.checkInDate);
            }

            const data = await BookingCollection.collection.get();
            const bookings: IBookingDetails[] = [];
            data.forEach((doc) => {
                bookings.push({ id: doc.id, ...doc.data() } as IBookingDetails);
            });

            return {
                items: bookings,
                totalCount: data.size
            };
        } catch (e: any) {
            throw new Error(`BookingCollection getAllItems error:'${e?.message}`)
        }
    }

    static async getItemById(id: string): Promise<IBookingDetails | undefined> {
        try {
            const item = await BookingCollection.collection.doc(id).get();
            if (!item.exists) {
                return undefined;
            }
            return {
                id: item.id,
                ...item.data()
            } as IBookingDetails;
        } catch (e: any) {
            throw new Error(`BookingCollection getItemById error:'${e?.message}`)
        }
    }


}

