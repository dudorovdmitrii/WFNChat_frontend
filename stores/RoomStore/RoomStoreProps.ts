import { MessageInterface, NotificationsInterface, RoomInterface, UserProps } from "../../globalTypes";
import UserStore from "../UserStore";

export interface getMoreMessagesProps {
    room_id: number,
    count: number,
    past?: number,
    last_id?: number
}

export interface MutableRoomProps {
    name?: string,
    photo?: string,
    removed_users?: number[],
    added_users?: number[]
}

export interface RoomStoreProps {
    currentRoom: RoomInterface,
    filteredRoomsArray: RoomInterface[],
    ObjectOfRooms: Record<number, RoomInterface>,
    RoomsArray: RoomInterface[],
    receivedMessagesAmount: number,
    requestedMessagesAmount: number,
    unreadMessagesAmount: Record<string, number>,
    userStore: typeof UserStore,
    addMessageToRoom: (room_id: number, message: MessageInterface) => void
    changeCurrentRoom: (room: RoomInterface) => void,
    createRoom: (roomData: Partial<RoomInterface>) => Promise<boolean>,
    commonRoomUpdate: (room_id: number, messages_amount: number, message: MessageInterface) => void,
    filterRoomsArray: ({ first_room_id, filter_word, user_id }: UpdateRoomsArrayOrderInterface) => void,
    getMoreMessages: ({ room_id, count, past, last_id }: getMoreMessagesProps) => Promise<MessageInterface[]>,
    initRoomsArray: (roomsArray: RoomInterface[], notifications: NotificationsInterface) => void,
    updateRooms: (rooms: RoomInterface[]) => void,
    updateRoom: (roomData: MutableRoomProps, room_id: number, user: UserProps) => Promise<unknown>,
    updateUnreadMessages: (room_id: number, messages_amount: number) => void,
    updateLastMessage: (room_id: number, message: MessageInterface) => void,
}

export interface UpdateRoomsArrayOrderInterface {
    first_room_id?: number,
    filter_word?: string,
    user_id?: number
}