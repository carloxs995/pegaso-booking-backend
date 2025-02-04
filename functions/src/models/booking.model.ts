import { z } from "zod";
import { BookingValidator } from "../validators/BookingValidator";

export type BookingStatus = z.infer<typeof BookingValidator.StatusSchema>;

export type PaymentMethod = z.infer<typeof BookingValidator.PaymentMethodSchema>;

export type IBookingBase = z.infer<typeof BookingValidator.BaseSchema>

export type IBookingsFiltersListSchema = z.infer<typeof BookingValidator.BookingsFiltersListSchema>;

export interface IBookingDetails extends IBookingBase {
    id: string;
    isPaid: boolean,
    status: BookingStatus,
    servicePrice: number;
    createdAt: string;
    updatedAt: string;
    paymentMethod: PaymentMethod;
    createdBy: string;
}

export interface IBookingList {
    items: IBookingDetails[],
    continuation: string | null,
    isLastPage: boolean,
    totalCount: number
}
