import { IBookingBase, IBookingDetails } from "../../models/booking.model";
import { dbFirestore } from "../firestore";

export class BookingCollection {
    static readonly collection = dbFirestore.collection('bookings');

    static async addItem(item: IBookingBase): Promise<string> {
        try {
            const res = await BookingCollection.collection.add(item);
            return res.id;
        } catch (e: any) {
            throw new Error(`BookingCollection addItem error:'${e?.message}`)
        }
    }

    static async updateItem(id: string, item: IBookingDetails): Promise<string> {
        try {
            await BookingCollection.collection.doc(id).update(item as { [key: string]: any });
            return id;
        } catch (e: any) {
            throw new Error(`BookingCollection addItem error:'${e?.message}`)
        }
    }

    static async deleteItem(id: string): Promise<void> {
        try {
            await BookingCollection.collection.doc(id).delete();
        } catch (e: any) {
            throw new Error(`BookingCollection deleteItem error:'${e?.message}`)
        }
    }

    static async getAllItems(): Promise<IBookingDetails[]> {
        try {
            const data = await BookingCollection.collection.get();
            const bookings: any = [];
            data.forEach((doc) => {
                bookings.push({ id: doc.id, ...doc.data() });
            });

            return bookings as IBookingDetails[];
        } catch (e: any) {
            throw new Error(`BookingCollection getAll error:'${e?.message}`)
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
            throw new Error(`BookingCollection deleteItem error:'${e?.message}`)
        }
    }


}

