import "reflect-metadata";

import { container, instanceCachingFactory } from "tsyringe";
import { RoomsService } from './services/RoomsService';
import { RoomValidator } from "./validators/RoomValidator";
import { BookingValidator } from "./validators/BookingValidator";
import { BookingsCollection } from "./database/collections/BookingsCollection";
import { RoomsCollection } from "./database/collections/RoomsCollection";
import { DITokens } from "./di-tokens";
import { UsersService } from "./services/UsersService";
import { UserValidator } from "./validators/UserValidator";

// Registrazione delle dipendenze nel container DI
container.register(
    DITokens.roomValidator,
    { useFactory: instanceCachingFactory(() => new RoomValidator()) }
);

container.register(
    DITokens.bookingValidator,
    { useFactory: instanceCachingFactory(() => new BookingValidator()) }
);

container.register(
    DITokens.bookingsCollection,
    {
        useFactory: instanceCachingFactory(
            c => new BookingsCollection()
        )
    }
);

container.register(
    DITokens.roomsCollection,
    {
        useFactory: instanceCachingFactory(
            c => new RoomsCollection(
                c.resolve(DITokens.bookingsCollection
                )
            )
        )
    }
);

container.register(
    DITokens.roomsService,
    {
        useFactory: instanceCachingFactory(
            c => new RoomsService(
                c.resolve(DITokens.bookingsCollection),
                c.resolve(DITokens.roomsCollection)
            )
        )
    }
);

container.register(
    DITokens.userService,
    {
        useFactory: instanceCachingFactory(
            () => new UsersService()
        )
    }
);

container.register(
    DITokens.userValidator,
    {
        useFactory: instanceCachingFactory(
            () => new UserValidator()
        )
    }
);
