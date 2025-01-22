import { z } from "zod";
import { UserValidator } from "../validators/UserValidator";

export enum UserRole {
    GUEST = 1,
    USER = 2,
    ADMIN = 3,
}

export type UserBase = z.infer<typeof UserValidator.BaseSchema>;
