export interface MessageInterface {
    id: number,
    text: string,
    photo: string | null,
    audio: string | null,
    video: string | null,
    room: number,
    author: number,
    timestamp_created: number
}

export interface RoomInterface {
    id: number,
    name: string,
    messages: MessageInterface[],
    users: number[],
    photo: string,
    last_message: string,
    isGroup: boolean
}

export interface NotificationsInterface {
    messages: Record<string, [number, MessageInterface | null]>,
    friend_requests: number[],
    friend_acceptions: number[],
    friend_deletions: number[],
    friends_statuses: Record<number, boolean>,
    blocked_by: number[],
    got_new_room: boolean,
    removed_from_room: boolean
}

export interface UserProps {
    id: number,
    username: string,
    first_name: string,
    last_name: string,
    date_joined: string,
    photo: string,
    description: string,
    birthday: string,
    friends: number[],
    blocked_users: number[],
    desired_friends: number[],
    friend_requests: number[],
    rooms: RoomInterface[],
    notifications: string,
    isOnline: boolean
}

export interface PluralUserProps {
    id: number,
    username: string,
    first_name: string,
    last_name: string,
    date_joined: string,
    photo: string,
    description: string,
    birthday: string,
    friends: number[],
    blocked_users: number[],
    desired_friends: number[],
    friend_requests: number[],
    rooms: number[],
    notifications: string,
    isOnline: boolean
}

export interface WarningInterface {
    type?: WarningTypes,
    text?: string,
    icon?: Icons
}
export type WarningTypes = 'danger' | 'success'
export type Icons = 'exclamation' | 'mail' | 'ok'

export const checkExtensionRegex = /.(?<extension>\w+)$/

export type messageTypeOptions = 'Text' | 'Photo' | 'Audio' | 'Video'
export const PhotoExtentions = ['png', 'jpeg', 'webp', 'jpg', 'jfif', 'bmp', 'gif', 'tiff']
export const VideoExtentions = ['mp4', 'avi', 'mov', 'flv', 'vob', 'mkv', 'wmv']

export type Themes = 'black' | 'white'