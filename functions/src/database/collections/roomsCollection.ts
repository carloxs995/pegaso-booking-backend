import 'reflect-metadata';

import { injectable } from "tsyringe";
import { IRoomBase, IRoomDetails, IRoomType } from "../../models/room.model";
import { dbFirestore } from "../firestore";

@injectable()
export class RoomsCollection {
    readonly collection = dbFirestore.collection('rooms');

    async addItem(item: IRoomBase): Promise<string> {
        try {
            const res = await this.collection.add(item);
            return res.id;
        } catch (e: any) {
            throw new Error(`RoomsCollection addItem error:'${e?.message}`)
        }
    }

    async getItemByType(type: IRoomType): Promise<IRoomDetails | undefined> {
        try {
            const res = await this.collection
                .where('type', '==', type)
                .get();

            if (res.empty) {
                return undefined;
            }

            return res.docs[0].data() as IRoomDetails;
        } catch (e: any) {
            throw new Error(`RoomsCollection addItem error:'${e?.message}`)
        }
    }

    async updateItem(id: string, item: Partial<IRoomBase>): Promise<string> {
        try {
            await this.collection.doc(id).update(item as { [key: string]: any });
            return id;
        } catch (e: any) {
            throw new Error(`RoomsCollection updateItem error:'${e?.message}`)
        }
    }

    async deleteItem(id: string): Promise<void> {
        try {
            await this.collection.doc(id).delete();
        } catch (e: any) {
            throw new Error(`RoomsCollection deleteItem error:'${e?.message}`)
        }
    }

    async getAllItems(): Promise<IRoomDetails[]> {
        try {
            const data = await this.collection.get();
            const bookings: any = [];
            data.forEach((doc) => {
                bookings.push({ id: doc.id, ...doc.data() });
            });

            return bookings as IRoomDetails[];
        } catch (e: any) {
            throw new Error(`RoomsCollection getAllItems error:'${e?.message}`)
        }
    }

    async getItemById(id: string): Promise<IRoomDetails | undefined> {
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
            throw new Error(`RoomsCollection getItemById error:'${e?.message}`)
        }
    }
}

