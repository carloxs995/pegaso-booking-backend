import { z } from "zod";
import { RoomValidator } from "../validators/RoomValidator";

export type IRoomType = z.infer<typeof RoomValidator.RoomTypeEnum>;
export type IRoomBase = z.infer<typeof RoomValidator.BaseSchema>;
export type IRoomDetails = IRoomBase & {
    id: string;
};
