// Stato della prenotazione
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// Metodo di pagamento
export type PaymentMethod = 'credit_card' | 'paypal' | 'cash';

export type RoomType =
| 'Standard'   // Camera standard, economica
| 'Deluxe'     // Camera più spaziosa e confortevole
| 'Suite'      // Suite con area soggiorno separata
| 'Luxury'     // Camera di lusso con servizi premium
| 'Penthouse'; // Attico esclusivo con vista panoramica

// Dettagli della prenotazione
export interface IBookingBase {
    customerName: string;        // Nome completo del cliente
    customerEmail: string;       // Email del cliente
    customerPhone: string;      // Telefono del cliente (opzionale)
    serviceName: RoomType;         // Nome del servizio (es: Camera Standard)
    quantity: number;            // Quantità prenotata (es: numero di notti o posti)
    checkInDate: string;         // Data di inizio prenotazione (ISO Date)
    checkOutDate: string;        // Data di fine prenotazione (ISO Date)
    paymentMethod: PaymentMethod;// Metodo di pagamento scelto
    totalAmount: number;         // Totale prenotazione (servizio * quantità)
    notes: string;              // Note aggiuntive (opzionale)
}

export interface IBookingDetails extends IBookingBase {
    id: string;           // ID univoco della prenotazione
    isPaid: boolean;             // Indica se la prenotazione è stata pagata
    status: BookingStatus;       // Stato della prenotazione
    createdAt: string;           // Data di creazione della prenotazione (ISO Date)
    updatedAt: string;          // Data di ultimo aggiornamento (ISO Date)
    servicePrice: number;        // Prezzo unitario del servizio
}
