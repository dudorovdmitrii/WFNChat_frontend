import { MessageInterface, messageTypeOptions, RoomInterface, UserProps } from "../globalTypes";

export interface ServiceWSMessageInterface {
    currentRoom: number,
    objectOfRooms: Record<number, RoomInterface>,
    socket: WebSocket,
    reconnectTries: number,
    URL: string,
    user: UserProps,
    unreadMessagesAmount: Record<string, number>,
    connect: () => void,
    disconnect: () => void,
    send: () => boolean,
}

export interface UpdateServiceWSInterface {
    currentRoom: number
}

export interface WebSocketInterface {
    room_id: number,
    socket: WebSocket,
    reconnectTries: number,
    URL: string,
    addMessageToRoom: (room_id: number, message: MessageInterface) => void
    connect: () => void,
    disconnect: () => void,
    send: (message: WebSocketMessageInterface) => void,
}

export interface WebSocketMessageInterface {
    text: string,
    photo: string,
    audio: string,
    video: string,
    author: number,
    room: number,
    types?: messageTypeOptions[], // Нет поля в модели
    timestamp_created: number,
}