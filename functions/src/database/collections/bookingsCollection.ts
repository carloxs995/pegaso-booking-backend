import 'reflect-metadata';

import { inject, injectable } from "tsyringe";
import { IBookingDetails } from "../../models/booking.model";
import { IRoomType } from "../../models/room.model";
import { dbFirestore } from "../firestore";
import { DITokens } from '../../di-tokens';
import { UsersService } from '../../services/UsersService';
import { UserRole } from '../../models/user.model';

export interface BookingFilters {
    serviceType?: IRoomType;
    checkInDate?: string;
    checkOutDate?: string;
}

@injectable()
export class BookingsCollection {
    readonly collection = dbFirestore.collection('bookings');

    constructor(
        @inject(DITokens.userService) private readonly _userService: UsersService
    ) {
    }

    async addItem(item: IBookingDetails): Promise<string> {
        try {
            const res = await this.collection.add(item);
            return res.id;
        } catch (e: any) {
            throw new Error(`BookingCollection addItem error:'${e?.message}`)
        }
    }

    async updateItem(id: string, item: Partial<IBookingDetails>, currentUserUid: string): Promise<string> {
        try {
            await this.getItemById(id, currentUserUid);
            await this.collection.doc(id).update(item as { [key: string]: any });
            return id;
        } catch (e: any) {
            throw new Error(`BookingCollection updateItem error:'${e?.message}`)
        }
    }

    async deleteItem(id: string): Promise<void> {
        try {
            await this.collection.doc(id).delete();
        } catch (e: any) {
            throw new Error(`BookingCollection deleteItem error:'${e?.message}`)
        }
    }

    async getAllItems(filters?: BookingFilters): Promise<{ items: IBookingDetails[], totalCount: number }> {
        try {
            let queryBase: FirebaseFirestore.Query = this.collection;
            if (filters?.serviceType) {
                queryBase = queryBase.where('serviceName', '==', filters.serviceType);
            }
            if (filters?.checkInDate) {
                queryBase = queryBase.where('checkInDate', '<', filters.checkOutDate);
            }
            if (filters?.checkOutDate) {
                queryBase = queryBase.where('checkOutDate', '>', filters.checkInDate);
            }

            const data = await queryBase.get();
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

    async getItemById(id: string, currentUserUid: string): Promise<IBookingDetails | undefined> {
        try {
            const userData = await this._userService.getUser(currentUserUid);
            const item = await this.collection
                .doc(id)
                .get();

            if (!item.exists) {
                return undefined;
            }
            const bookingDetails = {
                id: item.id,
                ...item.data()
            } as IBookingDetails;

            if (userData.role !== UserRole.ADMIN && bookingDetails.createdBy !== userData.uid) {
                throw new Error('Item not accessible');
            }

            return bookingDetails;
        } catch (e: any) {
            throw new Error(`BookingCollection getItemById error:'${e?.message}`)
        }
    }


}

