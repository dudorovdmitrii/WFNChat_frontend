import { makeObservable, observable, action, runInAction, computed } from 'mobx'

import { getAnotherUser, getCookie } from '../../helpers'
import UserStore from '../UserStore'
import { MessageInterface, NotificationsInterface, RoomInterface, UserProps } from './../../globalTypes'
import { getMoreMessagesProps, MutableRoomProps, RoomStoreProps, UpdateRoomsArrayOrderInterface } from './RoomStoreProps'
import { createRoomURL, getMoreMessagesURL, updateRoomURL } from './RoomStoreSettings'

class RoomStore implements RoomStoreProps {
    currentRoom: RoomInterface = null
    filteredRoomsArray: RoomInterface[] = null
    RoomsArray: RoomInterface[] = null
    receivedMessagesAmount = 0
    requestedMessagesAmount = 0
    unreadMessagesAmount: Record<string, number> = {}
    userStore: typeof UserStore = null

    // Making an object id:room for convenience
    get ObjectOfRooms(): Record<number, RoomInterface> {
        const RoomsObject: Record<number, RoomInterface> = {}
        this.RoomsArray?.forEach(room => RoomsObject[room.id] = room)
        return RoomsObject
    }

    addMessageToRoom(room_id: number, message: MessageInterface) {
        this.ObjectOfRooms[room_id].messages.push(message)
        this.updateLastMessage(room_id, message)
    }

    changeCurrentRoom(room: RoomInterface) {
        runInAction(() => {
            if (this.currentRoom) {
                this.currentRoom.messages = []
            }
            this.currentRoom = room
            this.receivedMessagesAmount = 0
            this.requestedMessagesAmount = 0
        })
    }

    async createRoom(roomData: Partial<RoomInterface>) {
        const room = await fetch(createRoomURL,
            {
                method: 'POST',
                body: JSON.stringify(roomData),
                headers:
                {
                    'Authorization': 'Bearer ' + getCookie('JWTAccess'),
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .catch(() => undefined)
        if (!room) return false
        runInAction(() => {
            this.RoomsArray.unshift(room)
            this.unreadMessagesAmount[room.id] = 0
            this.filteredRoomsArray = this.RoomsArray
        })
        return true
    }

    filterRoomsArray({ first_room_id, filter_word, user_id }: UpdateRoomsArrayOrderInterface) {
        if (first_room_id) {
            if (first_room_id === this.RoomsArray[0].id) return
            this.filteredRoomsArray = [this.ObjectOfRooms[first_room_id]]
            this.RoomsArray.forEach(room => {
                if (room.id != first_room_id) {
                    this.filteredRoomsArray.push(room)
                }
            })
            return
        }
        if (filter_word === '') {
            this.filteredRoomsArray = this.RoomsArray
        }
        if (filter_word) {
            this.filteredRoomsArray = this.RoomsArray.filter(room => {
                if (room.name) return room.name.includes(filter_word)
                const anotherUser = this.userStore.ObjectOfUsers[getAnotherUser(room.users, user_id)]
                const fullname = anotherUser.first_name + ' ' + anotherUser.last_name
                return fullname.includes(filter_word)
            })
        }
    }

    // Fetching messages if needed more
    async getMoreMessages({ room_id, count, past, last_id }: getMoreMessagesProps) {
        if (this.receivedMessagesAmount != this.requestedMessagesAmount) return
        runInAction(() => {
            this.requestedMessagesAmount += count
        })
        // Building the query string according to the received params
        let query_string = `?room_id=${room_id}&count=${count}`;
        query_string += last_id ? `&last_id=${last_id}` : '';
        query_string += past ? `&past=${past}` : '';
        const messages: MessageInterface[] = await fetch(getMoreMessagesURL + query_string,
            {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + getCookie('JWTAccess')
                }
            })
            .then(res => res.json(), () => undefined)
        runInAction(() => {
            if (!messages || messages.length === 0) return false
            const room: RoomInterface = this.ObjectOfRooms[String(room_id)]
            messages?.forEach(message => {
                room.messages.unshift(message)
            })
            this.receivedMessagesAmount += messages.length
        })
        return messages
    }

    initRoomsArray(roomsArray: RoomInterface[], notifications: NotificationsInterface) {
        for (const room of roomsArray) {
            room['messages'] = []
        }
        this.RoomsArray = roomsArray.sort((room1, room2) => {
            let time1 = 0
            let time2 = 0
            if (room2.last_message) {
                time2 = JSON.parse(room2.last_message).timestamp_created
            }
            if (room1.last_message) {
                time1 = JSON.parse(room1.last_message).timestamp_created
            }
            return time1 && time2 ? time2 - time1 : time1 ? 1 : 0
        })
        for (const room of this.RoomsArray) {
            try {
                this.unreadMessagesAmount[room.id] = notifications.messages[room.id][0]
            }
            catch {
                this.unreadMessagesAmount[room.id] = 0
            }
        }
        this.filteredRoomsArray = this.RoomsArray
    }

    async updateRoom(roomData: MutableRoomProps, room_id: number, user: UserProps) {
        const updatedRoom: RoomInterface = await fetch(updateRoomURL + `${room_id}/`,
            {
                method: 'PATCH',
                body: JSON.stringify(roomData),
                headers:
                {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getCookie('JWTAccess')
                }
            })
            .then(res => res.json())
            .catch(() => undefined)

        if (!updatedRoom) return false
        runInAction(() => {
            if (updatedRoom.users.filter(memberId => memberId === user.id).length === 0) {
                this.RoomsArray.splice(this.RoomsArray.findIndex(room => room.id === updatedRoom.id), 1)
                this.filteredRoomsArray = this.RoomsArray
                return true
            }
            for (const key in updatedRoom) {
                if (key in roomData) {
                    this.ObjectOfRooms[room_id][key] = updatedRoom[key]
                }
            }
            if (Object.keys(roomData).includes('added_users')) {
                const roomUsers = this.ObjectOfRooms[room_id].users
                const addedUsers: number[] = roomData['added_users']
                this.ObjectOfRooms[room_id].users = [...roomUsers, ...addedUsers]
            }
            if (Object.keys(roomData).includes('removed_users')) {
                const roomUsers = this.ObjectOfRooms[room_id].users
                const removedUsers: number[] = roomData['removed_users']
                const newUsersArray: number[] = roomUsers.filter(userId => !removedUsers.includes(userId))
                this.ObjectOfRooms[room_id].users = newUsersArray
            }
        })
        return true
    }

    updateUnreadMessages(room_id: number, messages_amount: number) {
        this.unreadMessagesAmount[room_id] = messages_amount
    }

    updateLastMessage(room_id: number, message: MessageInterface) {
        this.ObjectOfRooms[room_id].last_message = JSON.stringify(message)
    }

    commonRoomUpdate(room_id: number, messages_amount: number, message: MessageInterface) {
        this.updateLastMessage(room_id, message)
        this.updateUnreadMessages(room_id, messages_amount)
        this.filterRoomsArray({ first_room_id: room_id })
    }

    updateRooms(rooms: RoomInterface[]) {
        this.RoomsArray = rooms
        this.filteredRoomsArray = this.RoomsArray
    }

    constructor() {
        makeObservable(this,
            {
                currentRoom: observable,
                filteredRoomsArray: observable,
                RoomsArray: observable,
                receivedMessagesAmount: observable,
                requestedMessagesAmount: observable,
                unreadMessagesAmount: observable,
                userStore: observable,
                ObjectOfRooms: computed,
                addMessageToRoom: action.bound,
                createRoom: action.bound,
                changeCurrentRoom: action.bound,
                commonRoomUpdate: action.bound,
                filterRoomsArray: action.bound,
                getMoreMessages: action.bound,
                initRoomsArray: action.bound,
                updateRooms: action.bound,
                updateRoom: action.bound,
                updateLastMessage: action.bound,
                updateUnreadMessages: action.bound,
            })
    }
}
export default new RoomStore