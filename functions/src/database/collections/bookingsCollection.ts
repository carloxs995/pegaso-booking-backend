import 'reflect-metadata';

import { inject, injectable } from "tsyringe";
import { IBookingDetails, IBookingsFiltersListSchema } from "../../models/booking.model";
import { dbFirestore } from "../firestore";
import { DITokens } from '../../di-tokens';
import { UsersService } from '../../services/UsersService';
import { UserRole } from '../../models/user.model';

@injectable()
export class BookingsCollection {
    readonly collection = dbFirestore.collection('bookings');

    constructor(
        @inject(DITokens.userService) private readonly _userService: UsersService
    ) {
    }

    async addItem(item: IBookingDetails): Promise<string> {
        try {
            const itemCreated = await this.collection.add(item);
            await itemCreated.update({ id: itemCreated.id })
            return itemCreated.id;
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

    async getAllItems(filters?: IBookingsFiltersListSchema): Promise<{ items: IBookingDetails[], continuation: string | null, isLastPage: boolean, totalCount: number }> {
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

            queryBase = queryBase.orderBy('id');

            if (filters?.pagination?.continuation) {
                queryBase = queryBase.startAfter(filters?.pagination.continuation);
            }

            if (filters?.pagination?.pageSize) {
                queryBase = queryBase.limit(filters?.pagination?.pageSize );
            }

            const data = await queryBase.get();
            const bookings: IBookingDetails[] = data.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IBookingDetails));
            const newLastVisible = bookings.length > 0 ? bookings[bookings.length - 1].id : null;
            const isLastPage = filters?.pagination?.pageSize  ? bookings.length < filters?.pagination?.pageSize : false; //TODO: check if it's a bug

            return {
                items: bookings,
                continuation: newLastVisible,
                isLastPage,
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


