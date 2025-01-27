import 'reflect-metadata';

import { injectable } from "tsyringe";
import { IBookingDetails, IBookingList, IBookingsFiltersListSchema } from "../../models/booking.model";
import { dbFirestore } from "../firestore";
import { UserRole } from '../../models/user.model';
import { BookingValidator } from '../../validators/BookingValidator';

@injectable()
export class BookingsCollection {
    // Riferimento alla collezione 'bookings' nel database Firestore
    readonly collection = dbFirestore.collection('bookings');

    /**
     * Aggiunge un nuovo elemento alla collezione 'bookings'.
     * @param {IBookingDetails} item - I dettagli della prenotazione.
     * @returns {Promise<string>} - L'ID dell'elemento creato.
     */
    async addItem(item: IBookingDetails): Promise<string> {
        const itemCreated = await this.collection.add(item);
        await itemCreated.update({ id: itemCreated.id });
        return itemCreated.id;
    }

    /**
     * Aggiorna un elemento esistente nella collezione 'bookings'.
     * @param {string} id - L'ID dell'elemento da aggiornare.
     * @param {Partial<IBookingDetails>} item - I dettagli della prenotazione da aggiornare.
     * @param {string} currentUserUid - L'UID dell'utente corrente.
     * @param {UserRole} userRole - Il ruolo dell'utente corrente.
     * @returns {Promise<string>} - L'ID dell'elemento aggiornato.
     * @throws {Error} - Se la prenotazione ha lo stato 'cancelled'.
     */
    async updateItem(id: string, item: Partial<IBookingDetails>, currentUserUid: string, userRole: UserRole): Promise<string> {
        if ((await this.getItemById(id, currentUserUid, userRole))?.status === 'cancelled') {
            throw new Error('A booking with canceled status cannot be updated');
        }
        await this.collection.doc(id).update(item as { [key: string]: any });
        return id;
    }

    /**
     * Elimina un elemento dalla collezione 'bookings'.
     * @param {string} id - L'ID dell'elemento da eliminare.
     * @param {string} currentUserUid - L'UID dell'utente corrente.
     * @param {UserRole} userRole - Il ruolo dell'utente corrente.
     * @param {boolean} [hardDelete=false] - Se true, l'elemento viene rimosso definitivamente dal database.
     * @returns {Promise<void>}
     */
    async deleteItem(id: string, currentUserUid: string, userRole: UserRole, hardDelete: boolean = false): Promise<void> {
        await this.getItemById(id, currentUserUid, userRole);

        // Se l'utente è un amministratore e il parametro hardDelete è true, rimuove l'elemento dal database
        if (userRole === UserRole.ADMIN && hardDelete) {
            await this.collection.doc(id).delete();
            return;
        }

        // Altrimenti, aggiorna lo stato della prenotazione a 'cancelled'
        await this.collection.doc(id).update({
            isPaid: true,
            status: BookingValidator.StatusSchema.enum.cancelled
        });
    }

    /**
     * Ottiene tutti gli elementi dalla collezione 'bookings' in base ai filtri specificati.
     * @param {IBookingsFiltersListSchema} [filters={}] - I filtri per la ricerca.
     * @param {string} [currentUserUid] - L'UID dell'utente corrente.
     * @param {UserRole} [userRole] - Il ruolo dell'utente corrente.
     * @returns {Promise<IBookingList>} - La lista delle prenotazioni.
     */
    async getAllItems(filters: IBookingsFiltersListSchema = {}, currentUserUid?: string, userRole?: UserRole): Promise<IBookingList> {
        let queryBase: FirebaseFirestore.Query = this.collection;

        // Applica i filtri alla query
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

        // Ordina i risultati per ID
        queryBase = queryBase.orderBy('id');

        // Applica la paginazione
        if (filters?.pagination?.continuation) {
            queryBase = queryBase.startAfter(filters?.pagination.continuation);
        }
        if (filters?.pagination?.pageSize) {
            queryBase = queryBase.limit(filters?.pagination?.pageSize);
        }

        // Se l'API è chiamata da un utente, restituisce solo le prenotazioni create dall'utente
        if (userRole === UserRole.USER || (userRole === UserRole.ADMIN && !filters.isFromAdminArea)) {
            queryBase = queryBase.where('createdBy', '==', currentUserUid);
        }

        // Esegue la query e mappa i risultati
        const data = await queryBase.get();
        const bookings: IBookingDetails[] = data.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IBookingDetails));
        const newLastVisible = bookings.length > 0 ? bookings[bookings.length - 1].id : null;
        const isLastPage = filters?.pagination?.pageSize ? bookings.length < filters?.pagination?.pageSize : false; //TODO: check if it's a bug

        return {
            items: bookings,
            continuation: newLastVisible,
            isLastPage,
            totalCount: data.size
        };
    }

    /**
     * Ottiene un elemento dalla collezione 'bookings' per ID.
     * @param {string} id - L'ID dell'elemento da ottenere.
     * @param {string} currentUserUid - L'UID dell'utente corrente.
     * @param {UserRole} role - Il ruolo dell'utente corrente.
     * @returns {Promise<IBookingDetails | undefined>} - I dettagli della prenotazione.
     * @throws {Error} - Se l'elemento non è accessibile dall'utente corrente.
     */
    async getItemById(id: string, currentUserUid: string, role: UserRole): Promise<IBookingDetails | undefined> {
        const item = await this.collection.doc(id).get();

        if (!item.exists) {
            return undefined;
        }
        const bookingDetails = item.data() as IBookingDetails;

        // Se l'utente non è un amministratore e non ha creato la prenotazione, lancia un errore
        if (role !== UserRole.ADMIN && bookingDetails.createdBy !== currentUserUid) {
            throw new Error('Item not accessible');
        }

        return bookingDetails;
    }
}
