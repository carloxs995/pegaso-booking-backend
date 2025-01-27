# PW Traccia 1.4 - Backend

Questo progetto è il backend per BookingApp, sviluppato con **Node.js**, **Express**, e **Firebase**.

# API Hosting
Il backend è esposto tramite **Firebase Cloud Functions**, utilizzando Express.js come framework backend.

Le API del progetto sono accessibili al seguente endpoint:
**`https://us-central1-pegaso-booking.cloudfunctions.net/api`**

## Tecnologie Utilizzate

- **Express.js** - Framework backend per Node.js
- **Firebase** - Cloud Function, FireStore Database ed Authentication
- **Zod** - Validazione degli schemi
- **Tsyringe** - Dependency injection per TypeScript

## Endpoint API

### Stanze (Rooms)

| Metodo | Endpoint                          | Descrizione                      | Autenticazione minima |
|--------|-----------------------------------|----------------------------------|----------------|
| GET    | `/rooms/check-availability/:id`   | Controlla la disponibilità       | Guest           |
| GET    | `/rooms/:id/details`              | Ottieni dettagli stanza          | Guest           |
| POST   | `/rooms`                           | Crea una stanza                  | Admin           |
| GET    | `/rooms`                           | Ottieni tutte le stanze           | Guest           |
| PUT    | `/rooms/:id`                       | Aggiorna dettagli stanza         | Admin           |

### Prenotazioni (Bookings)

| Metodo | Endpoint                          | Descrizione                      | Autenticazione minima |
|--------|-----------------------------------|----------------------------------|----------------|
| GET    | `/bookings`                        | Ottieni tutte le prenotazioni    | User            |
| GET    | `/bookings/:id`                     | Ottieni dettagli prenotazione    | User            |
| POST   | `/bookings`                         | Crea una prenotazione            | User            |
| PUT    | `/bookings/:id`                     | Modifica prenotazione            | User            |
| PUT    | `/bookings/:id/confirm`             | Conferma pagamento               | Admin           |
| DELETE | `/bookings/:id`                     | Imposta "annullata" la prenotazione             | User            |

### Utenti (Users)

| Metodo | Endpoint                          | Descrizione                      | Autenticazione minima |
|--------|-----------------------------------|----------------------------------|----------------|
| GET    | `/users`                           | Ottieni tutti gli utenti         | Admin           |
| POST   | `/users`                           | Crea un nuovo utente             | Guest           |
| GET    | `/users/me`                        | Ottieni informazioni utente      | User            |

## Modelli di Dati

### Booking (Firebase Firestore)

```typescript
{
    id: string;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhone: string;
    serviceName: "Standard" | "Deluxe" | "Suite" | "Luxury" | "Penthouse";
    quantityGuests: number;
    checkInDate: string;
    checkOutDate: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    isPaid: boolean;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    paymentMethod: 'cash'; //TBD online payment method
    servicePrice: number;
    createdBy: string;
    serviceId: string; //It's refered to the Room's ID reserved
}
```

### Room (Firebase Firestore)

```typescript
{
    id: string;
    type: "Standard" | "Deluxe" | "Suite" | "Luxury" | "Penthouse";
    name: string;
    capacity: number;
    totalRooms: number;
    pricePerNight: number;
    amenities: string[];
    available: boolean;
    description?: string;
    images: string[];
}
```

### User (Firebase Authentication)

```typescript
{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole; // 1 -> Guest, 2 -> User, 3 -> Admin
    disabled: boolean;
    emailVerified: boolean;
}
```

## Ruoli Utente

Il sistema supporta tre ruoli di utente:

- **Admin** - Accesso completo a tutte le risorse
- **User** - Accesso alle proprie prenotazioni
- **Guest** - Registrazione e accesso limitato

