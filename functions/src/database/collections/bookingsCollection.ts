import 'reflect-metadata';

import { injectable } from "tsyringe";
import { IBookingDetails, IBookingList, IBookingsFiltersListSchema } from "../../models/booking.model";
import { dbFirestore } from "../firestore";
import { UserRole } from '../../models/user.model';
import { BookingValidator } from '../../validators/BookingValidator';

@injectable()
export class BookingsCollection {
    readonly collection = dbFirestore.collection('bookings');

    async addItem(item: IBookingDetails): Promise<string> {
        try {
            const itemCreated = await this.collection.add(item);
            await itemCreated.update({ id: itemCreated.id })
            return itemCreated.id;
        } catch (e: any) {
            throw new Error(`BookingCollection addItem error:'${e?.message}`)
        }
    }

    async updateItem(id: string, item: Partial<IBookingDetails>, currentUserUid: string, userRole: UserRole): Promise<string> {
        try {
            if ((await this.getItemById(id, currentUserUid, userRole))?.status === 'cancelled') {
                throw new Error('A booking with canceled status cannot be updated');
            }
            await this.collection.doc(id).update(item as { [key: string]: any });
            return id;
        } catch (e: any) {
            throw new Error(`BookingCollection updateItem error:'${e?.message}`)
        }
    }

    async deleteItem(id: string, currentUserUid: string, userRole: UserRole, hardDelete: boolean = false): Promise<void> {
        try {
            await this.getItemById(id, currentUserUid, userRole);

            //IF ADMIN CALL THE DELETE WITH hardDelete param REMOVES THE BOOKING FROM DB
            if (userRole === UserRole.ADMIN && hardDelete) {
                await this.collection.doc(id).delete();
                return;
            }

            await this.collection.doc(id).update({
                isPaid: true,
                status: BookingValidator.StatusSchema.enum.cancelled
            });
        } catch (e: any) {
            throw new Error(`BookingCollection deleteItem error:'${e?.message}`)
        }
    }

    async getAllItems(filters: IBookingsFiltersListSchema = {}, currentUserUid: string, userRole: UserRole): Promise<IBookingList> {
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
            if (filters?.isPaid) {
                queryBase = queryBase.where('isPaid', '==', filters.isPaid);
            }

            queryBase = queryBase.orderBy('id');

            if (filters?.pagination?.continuation) {
                queryBase = queryBase.startAfter(filters?.pagination.continuation);
            }

            if (filters?.pagination?.pageSize) {
                queryBase = queryBase.limit(filters?.pagination?.pageSize);
            }

            //if the API si called by the USER, it's retrieved only the bookings created by the user
            if (userRole === UserRole.USER) {
                queryBase = queryBase.where('createdBy', '==', currentUserUid);
            }

            const data = await queryBase
                .get();
            const bookings: IBookingDetails[] = data.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IBookingDetails));
            const newLastVisible = bookings.length > 0 ? bookings[bookings.length - 1].id : null;
            const isLastPage = filters?.pagination?.pageSize ? bookings.length < filters?.pagination?.pageSize : false; //TODO: check if it's a bug

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

    async getItemById(id: string, currentUserUid: string, role: UserRole): Promise<IBookingDetails | undefined> {
        try {
            const item = await this.collection
                .doc(id)
                .get();

            if (!item.exists) {
                return undefined;
            }
            const bookingDetails = item.data() as IBookingDetails;

            if (role !== UserRole.ADMIN && bookingDetails.createdBy !== currentUserUid) {
                throw new Error('Item not accessible');
            }

            return bookingDetails;
        } catch (e: any) {
            throw new Error(`BookingCollection getItemById error:'${e?.message}`)
        }
    }


}


