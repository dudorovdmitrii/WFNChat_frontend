import { NotificationsInterface, PluralUserProps, RoomInterface, UserProps } from '../../globalTypes';
import { ServiceWS } from '../../WebSocket';
import { UpdateServiceWSInterface } from '../../WebSocket/WebSocketInterface';
import RoomStore from '../RoomStore';

export interface UserStoreProps {
    AllUsersSet: Set<string>,
    filteredUsers: PluralUserProps[],
    fullName: string,
    ObjectOfUsers: Record<number, PluralUserProps>,
    roomStore: typeof RoomStore,
    notifications: NotificationsInterface,
    serviceWS: ServiceWS,
    theme: 'black' | 'white',
    user: UserProps
    users: PluralUserProps[],
    UsersFriends: PluralUserProps[],
    UsersFriendRequests: PluralUserProps[],
    UsersDesiredFriends: PluralUserProps[],
    UsersBlockedUsers: PluralUserProps[],
    confirmEmail: (confirmData: confirmEmailProps) => Promise<unknown>,
    checkJWT: () => Promise<boolean>,
    checkJWTRefresh: () => boolean,
    connectToWS: () => void,
    changeTheme: (color: 'black' | 'white') => void,
    filterUsersArray: ({ filter_word, array }: filterUsersInterface) => void,
    getUserData: (username: string) => Promise<unknown>,
    getAllUsers: () => Promise<unknown>,
    getJWT: (userData: loginProps) => Promise<JWTResponse>,
    login: (userData: loginProps) => Promise<boolean>,
    logout: () => Promise<unknown>,
    register: (userData: registerProps) => Promise<unknown>,
    refreshJWTAccess: () => Promise<unknown>,
    tryRelogin: () => Promise<unknown>,
    toggleOnline: () => Promise<unknown>,
    updateUserDataInStore: (user_id: number, updatedData: Partial<UserProps>) => void,
    updateUserDataInDB: (username: string, updatedData: Partial<UserProps>) => Promise<unknown>,
    updateServiceWS: ({ currentRoom }: UpdateServiceWSInterface) => void,
    updateFilteredUsers: (filterChoice: string) => void,
    updateNotifications: (notifications: NotificationsInterface) => void
}

export interface confirmEmailProps {
    uid: string,
    token: string
}

export interface filterUsersInterface {
    filter_word: string,
    array: PluralUserProps[]
}

export interface JWTResponse {
    access: string,
    refresh: string
}

export interface MutableUserProps {
    username?: string,
    first_name?: string,
    last_name?: string,
    photo?: string,
    description?: string,
    birthday?: string,
    blocked_users?: number[],
    desired_friends?: number[],
    friend_requests?: number[],
    rooms?: RoomInterface[],
    notifications?: string,
    isOnline?: boolean
}

export interface loginProps {
    username: string,
    password: string
}

export interface registerProps {
    username: string,
    password: string
    email: string,
    first_name?: string,
    last_name?: string,
    birthday?: string
}