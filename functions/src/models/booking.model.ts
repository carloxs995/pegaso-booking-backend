export interface Booking {
    id?: string;
    name: string;
    date: string;
    time?: string;
    serviceType?: string; // tipo di servizio (ristorante, hotel, ecc.)
}
