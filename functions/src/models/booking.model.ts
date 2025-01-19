import { z } from "zod";
import { BookingValidator } from "../validators/BookingValidator";

export type BookingStatus = z.infer<typeof BookingValidator.StatusSchema>;

export type PaymentMethod = z.infer<typeof BookingValidator.PaymentMethodSchema>;

export type RoomType = z.infer<typeof BookingValidator.RoomTypeSchema>

export type IBookingBase = z.infer<typeof BookingValidator.BaseSchema>

export interface IBookingDetails extends z.infer<typeof BookingValidator.UpdateSchema> {
    id: string;
}
