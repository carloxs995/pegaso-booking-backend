import { IRoomBase, IRoomDetails, IRoomType } from "../../models/room.model";
import { dbFirestore } from "../firestore";

export class RoomsCollection {
    static readonly collection = dbFirestore.collection('rooms');

    static async addItem(item: IRoomBase): Promise<string> {
        try {
            const res = await this.collection.add(item);
            return res.id;
        } catch (e: any) {
            throw new Error(`this. addItem error:'${e?.message}`)
        }
    }

    static async getItemPerType(type: IRoomType): Promise<IRoomDetails> {
        try {
            const res = await this.collection
                .where('type', '==', type)
                .get();
            return res.docs[0].data() as IRoomDetails;
        } catch (e: any) {
            throw new Error(`this. addItem error:'${e?.message}`)
        }
    }

    static async updateItem(id: string, item: Partial<IRoomBase>): Promise<string> {
        try {
            await this.collection.doc(id).update(item as { [key: string]: any });
            return id;
        } catch (e: any) {
            throw new Error(`this. updateItem error:'${e?.message}`)
        }
    }

    static async deleteItem(id: string): Promise<void> {
        try {
            await this.collection.doc(id).delete();
        } catch (e: any) {
            throw new Error(`this. deleteItem error:'${e?.message}`)
        }
    }

    static async getAllItems(): Promise<IRoomDetails[]> {
        try {
            const data = await this.collection.get();
            const bookings: any = [];
            data.forEach((doc) => {
                bookings.push({ id: doc.id, ...doc.data() });
            });

            return bookings as IRoomDetails[];
        } catch (e: any) {
            throw new Error(`this. getAllItems error:'${e?.message}`)
        }
    }

    static async getItemById(id: string): Promise<IRoomDetails | undefined> {
        try {
            const item = await this.collection.doc(id).get();
            if (!item.exists) {
                return undefined;
            }
            return {
                id: item.id,
                ...item.data()
            } as IRoomDetails;
        } catch (e: any) {
            throw new Error(`this. getItemById error:'${e?.message}`)
        }
    }


}

