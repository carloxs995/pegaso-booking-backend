import "reflect-metadata";
import { container, instanceCachingFactory } from "tsyringe";
import { RoomsService } from './services/RoomsService';
import { RoomValidator } from "./validators/RoomValidator";
import { BookingValidator } from "./validators/BookingValidator";
import { BookingsCollection } from "./database/collections/BookingsCollection";
import { RoomsCollection } from "./database/collections/RoomsCollection";

export const DITokens = {
    roomsService: "ROOMS_SERVICE",
    roomValidator: "ROOM_VALIDATOR",
    bookingValidator: "BOOKING_VALIDATOR",
    bookingCollection: "BOOKING_COLLECTION",
    roomsCollection: "ROOMS_COLLECTION",
};

// Registrazione delle dipendenze nel container DI
container.register(
    DITokens.roomsService,
    {
        useFactory: instanceCachingFactory(c => new RoomsService(
            c.resolve(DITokens.bookingCollection),
            c.resolve(DITokens.roomsCollection)
        ))
    }
);

container.register(
    DITokens.roomValidator,
    { useFactory: instanceCachingFactory(() => new RoomValidator()) }
);

container.register(
    DITokens.bookingValidator,
    { useFactory: instanceCachingFactory(() => new BookingValidator()) }
);

container.register(
    DITokens.bookingCollection,
    { useFactory: instanceCachingFactory(() => new BookingsCollection()) }
);

container.register(
    DITokens.roomsCollection,
    { useFactory: instanceCachingFactory(() => new RoomsCollection()) }
);
