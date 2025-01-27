// Definisce i token per l'iniezione delle dipendenze utilizzando i Symbol
export const DITokens = {
    roomsService: Symbol("ROOMS_SERVICE"),
    roomValidator: Symbol("ROOM_VALIDATOR"),
    bookingValidator: Symbol("BOOKING_VALIDATOR"),
    bookingsCollection: Symbol("BOOKING_COLLECTION"),
    roomsCollection: Symbol("ROOMS_COLLECTION"),
    userValidator: Symbol("USER_VALIDATOR"),
    userService: Symbol("USER_SERVICE")
};
