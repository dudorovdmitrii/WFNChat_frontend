import { createContext } from "react";
import { WarningInterface } from "../globalTypes";
import { RoomStoreProps } from "../stores/RoomStore/RoomStoreProps";
import { UserStoreProps } from "../stores/UserStore/UserStoreProps";

export const GlobalContext = createContext<Partial<
    {
        UserStore: UserStoreProps,
        RoomStore: RoomStoreProps,
        showWarning: ({ type, text }: WarningInterface) => void
    }>>({})