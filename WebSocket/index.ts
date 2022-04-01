import { MessageInterface, NotificationsInterface, RoomInterface, UserProps } from "../globalTypes"
import { changeTitle, getCookie } from "../helpers"
import { ServiceWSMessageInterface, WebSocketInterface, WebSocketMessageInterface } from "./WebSocketInterface"
import { ReconnectTriesAmount } from "./WebSocketSettings"

export class ServiceWS implements ServiceWSMessageInterface {
    interval = null
    reconnectTries = 0
    socket: WebSocket = null

    // Прерываем соединение с сервером
    disconnect() {
        clearInterval(this.interval)
        if (this.socket.readyState === 3 || this.socket.readyState === 2) {
            this.socket = null
            return
        }
        this.socket.close()
    }

    // Подключаемся по WebSocket к серверу, вешаем обработчики
    // При ошибке переподключаемся
    connect() {
        this.socket = new WebSocket(this.URL)
        this.hangEventListeners()
    }

    async hangEventListeners() {
        // Получаем сообщение по WebSocket с сервера
        this.socket.onmessage = async (event) => {
            const notifications: NotificationsInterface = JSON.parse(event.data)
            if (notifications.got_new_room) {
                const gotData = await this.getUserData(this.user.username)
                if (!gotData) {
                    alert('Что-то пошло не так')
                    return
                }
            }
            for (const room_id in notifications.messages) {
                const id = parseInt(room_id)
                // let lastMessageTimeStamp = null
                // if (this.objectOfRooms[id]?.last_message) {
                //     lastMessageTimeStamp = JSON.parse(this.objectOfRooms[id]?.last_message)?.timestamp_created
                // }
                // const new_message = notifications?.messages[id][1]
                // if (new_message && new_message.timestamp_created != lastMessageTimeStamp) {
                //     console.log(new_message)
                //     if (id != this.currentRoom) {
                //         this.commonRoomUpdate(id, notifications?.messages[id][0], new_message)
                //     }
                //     changeTitle('new message')
                // }
            }
            // Обновляем в сети/не в сети статусы друзей
            this.user.friends.forEach(friend_id => this.updateUserDataInStore(friend_id, { isOnline: notifications.friends_statuses[friend_id] }))
            //Обновляем уведомления
            this.updateNotifications(notifications)
        }

        // Переподключаемся при возникновении ошибки
        this.socket.onerror = async () => {
            if (this.reconnectTries > ReconnectTriesAmount) {
                alert('Что-то пошло не так')
                this.disconnect()
                return
            }
            if (!getCookie('BaseToken')) {
                alert('Что-то пошло не так')
                return
            }
            ++this.reconnectTries
            this.socket = new WebSocket(this.URL)
            this.hangEventListeners()
        }

        this.socket.onopen = () => {
            this.reconnectTries = 0
        }

        window.addEventListener('beforeunload', () => {
            if (!this.currentRoom || !this.socket) return
            this.socket.send(JSON.stringify({ currentRoom: this.currentRoom }))
        })
    }

    // Отправляем сообщение по WebSocket на сервер
    send() {
        if (!(this.socket.readyState === 1)) return false
        this.socket.send(JSON.stringify({ check: true, currentRoom: this.currentRoom }))
        return true
    }

    constructor(
        public currentRoom: number,
        public objectOfRooms: Record<number, RoomInterface>,
        public URL: string,
        public user: UserProps,
        public unreadMessagesAmount: Record<string, number>,
        public getUserData: (username: string) => Promise<unknown>,
        public updateUserDataInStore: (user_id: number, updatedData: Partial<UserProps>) => void,
        public updateNotifications: (notifications: NotificationsInterface) => void,
        public commonRoomUpdate: (room_id: number, messages_amount: number, message: MessageInterface) => void) {
        this.connect()
        this.interval = setInterval(() => this.send(), 3000)
    }
}

export class WS implements WebSocketInterface {
    reconnectTries = 0
    socket: WebSocket = null
    connect() {
        this.socket = new WebSocket(this.URL)
        this.hangEventListeners()
    }

    hangEventListeners() {
        // Получаем сообщение по WebSocket с сервера
        this.socket.onmessage = (event) => {
            const message: MessageInterface = { ...JSON.parse(event.data) }
            console.log(message)
            this.addMessageToRoom(this.room_id, message)
        }
        // Переподключаемся при возникновении ошибки
        this.socket.onerror = () => {
            if (this.reconnectTries > ReconnectTriesAmount) {
                this.disconnect()
                alert('Что-то пошло не так')
                return
            }
            if (!getCookie('BaseToken')) {
                alert('Что-то пошло не так')
                return
            }
            ++this.reconnectTries
            this.socket = new WebSocket(this.URL)
            this.hangEventListeners()
        }
        this.socket.onopen = () => {
            this.reconnectTries = 0
        }
    }

    // Отправляем сообщение по WebSocket на сервер
    send(message: WebSocketMessageInterface) {
        this.socket.send(JSON.stringify(message))
    }

    // Прерываем соединение с сервером
    disconnect() {
        if (this.socket.readyState === 3 || this.socket.readyState === 2) {
            this.socket = null
            return
        }
        this.socket.close()
    }

    constructor(public URL: string, public addMessageToRoom: (room_id: number, message: MessageInterface) => void,
        public room_id: number) {
        this.connect()
    }
}