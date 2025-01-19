export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type PaymentMethod = 'credit_card' | 'paypal' | 'cash';

export type RoomType =
| 'Standard'
| 'Deluxe'
| 'Suite'
| 'Luxury'
| 'Penthouse';

export interface IBookingBase {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    serviceName: RoomType;
    quantity: number;            // Quantità prenotata (es: numero di notti o posti)
    checkInDate: string;         // Data di inizio prenotazione (ISO Date)
    checkOutDate: string;        // Data di fine prenotazione (ISO Date)
    paymentMethod: PaymentMethod;
    notes?: string;              // Note aggiuntive (opzionale)
}

export interface IBookingDetails extends IBookingBase {
    id: string;
    isPaid: boolean;
    status: BookingStatus;
    createdAt: string;           // Data di creazione della prenotazione (ISO Date)
    updatedAt: string;          // Data di ultimo aggiornamento (ISO Date)
    servicePrice: number;
    totalAmount: number;
}
