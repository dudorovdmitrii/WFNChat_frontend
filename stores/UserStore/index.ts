import { isEqual } from 'lodash'
import { makeObservable, observable, action, computed, runInAction } from 'mobx'

import { confirmEmailProps, filterUsersInterface, loginProps, registerProps, UserStoreProps } from './UserStoreProps'
import {
    BaseTokenOptions, confirmEmailURL, CredentialsOptions, getAllUsersURL, getUserDataURL, JWTAccessOptions, JWTGetURL,
    JWTRefreshURL, loginURL, logoutURL, registerURL, updateUserDataURL
} from './UserStoreSettings'
import { deleteCookie, getCookie, setCookie } from '../../helpers'
import { MessageInterface, NotificationsInterface, PluralUserProps, Themes, UserProps } from './../../globalTypes'
import RoomStore from '../RoomStore'
import { ServiceWS } from '../../WebSocket'
import { APIDomainWS } from '../../globalSettings'
import { UpdateServiceWSInterface } from '../../WebSocket/WebSocketInterface'

class UserStore implements UserStoreProps {
    filteredUsers: PluralUserProps[] = []
    notifications: NotificationsInterface = null
    roomStore: typeof RoomStore = null
    serviceWS: ServiceWS = null
    theme: Themes = 'white'
    user: UserProps = null
    users: PluralUserProps[] = []

    // Making a set of usernames to check uniqueness
    get AllUsersSet(): Set<string> {
        const usernamesSet: Set<string> = new Set()
        if (!this.users) return new Set()
        this.users.forEach(user => usernamesSet.add(user.username))
        return usernamesSet
    }

    get fullName() {
        return this.user?.first_name + ' ' + this.user?.last_name
    }

    get ObjectOfUsers(): Record<number, PluralUserProps> {
        const object: Record<number, PluralUserProps> = {}
        this?.users?.forEach(user => object[user.id] = user)
        return object
    }

    get UsersFriends(): PluralUserProps[] {
        return this.user?.friends?.map(friend_id => this.ObjectOfUsers[friend_id])
    }

    get UsersFriendRequests(): PluralUserProps[] {
        return this.user?.friend_requests?.map(friend_id => this.ObjectOfUsers[friend_id])
    }

    get UsersDesiredFriends(): PluralUserProps[] {
        return this.user?.desired_friends?.map(friend_id => this.ObjectOfUsers[friend_id])
    }

    get UsersBlockedUsers(): PluralUserProps[] {
        return this.user?.blocked_users?.map(friend_id => this.ObjectOfUsers[friend_id])
    }

    changeTheme(color: Themes) {
        this.theme = color
    }

    // Confirming the email
    async confirmEmail(confirmData: confirmEmailProps) {
        const ok = await fetch(confirmEmailURL,
            {
                method: 'POST',
                body: JSON.stringify(confirmData),
                headers:
                {
                    "Content-Type": "application/json",
                }
            })
            .then(() => 'ok')
            .catch(() => undefined)
        if (!ok) return false
        return true
    }

    // Checking and refreshing JWTs if needed
    async checkJWT(): Promise<boolean> {
        // Check if JWT access has expired
        if (!getCookie('JWTAccess')) {
            if (this.checkJWTRefresh()) {
                const JWTAccess = await this.refreshJWTAccess()
                if (!JWTAccess) {
                    await this.clear()
                    return false
                }
                setCookie({ name: 'JWTAccess', value: JWTAccess, options: JWTAccessOptions })
                return true
            }
            else {
                this.clear()
                return false
            }
        }
        return true
    }

    // Checking if the user has authorized before
    checkJWTRefresh() {
        if (!localStorage.getItem('JWTRefresh')) {
            return false
        }
        return true
    }

    async connectToWS() {
        if (this.serviceWS) {
            this.serviceWS.disconnect()
        }
        if (!await this.checkJWT()) return false
        this.serviceWS = new ServiceWS(
            this?.roomStore?.currentRoom?.id,
            this.roomStore.ObjectOfRooms,
            `${APIDomainWS}/service` + `/${this.user.id}/` + `?username=${this.user.username}&token=${getCookie('BaseToken')}`,
            this.user,
            this.roomStore.unreadMessagesAmount,
            (username: string) => this.getUserData(username),
            (user_id: number, updatedData: Partial<UserProps>) => this.updateUserDataInStore(user_id, updatedData),
            (notifications: NotificationsInterface) => this.updateNotifications(notifications),
            (room_id: number, messages_amount: number, message: MessageInterface) =>
                this?.roomStore.commonRoomUpdate(room_id, messages_amount, message))
        return true
    }

    async clear() {
        const toggledOnline = await this.toggleOnline()
        if (!toggledOnline) return false
        deleteCookie('BaseToken')
        deleteCookie('JWTAccess')
        deleteCookie('username')
        deleteCookie('password')
        delete localStorage['JWTRefresh']
        runInAction(() => {
            this.user = null
            this.roomStore.currentRoom = null
            this.roomStore = null
        })
        return true
    }

    filterUsersArray({ filter_word, array }: filterUsersInterface) {
        if (filter_word === '') {
            this.filteredUsers = array
        }
        if (filter_word) {
            this.filteredUsers = array.filter(user => (user.first_name + ' ' + user.last_name).includes(filter_word))
        }
    }

    // Getting all users available, saving in the store
    async getAllUsers() {
        const data = await fetch(getAllUsersURL,
            {
                method: 'GET',
            })
            .then(resp => resp.ok ? resp.json() : undefined)
            .catch(() => undefined)

        if (!data) return false
        runInAction(() => {
            this.users = data
            this.filteredUsers = data
        })
        return true
    }

    // Getting user data
    async getUserData(username: string) {
        if (!await this.checkJWT().then(isValid => isValid)) return

        // Getting user data, authorizing with JWT access
        const data = await fetch(getUserDataURL + username + '/',
            {
                headers:
                {
                    'Authorization': 'Bearer ' + getCookie('JWTAccess')
                }
            })
            .then(resp => resp.ok ? resp.json() : undefined)
            .catch(() => undefined)

        if (!data) return false
        runInAction(async () => {
            this.user = data
            this.roomStore = RoomStore
            this.updateNotifications(JSON.parse(this.user.notifications))
            this.roomStore.initRoomsArray(this.user.rooms, JSON.parse(this.user.notifications))
            this.roomStore.userStore = this
        })
        return true
    }

    async getJWT(userData: loginProps) {
        const JWTData = await fetch(JWTGetURL,
            {
                method: 'POST',
                body: JSON.stringify(userData),
                headers:
                {
                    "Content-Type": "application/json",
                },
            })
            .then(resp => resp.ok ? resp.json() : undefined)
            .catch(() => undefined)

        if (!JWTData?.access || !JWTData?.refresh) return null
        try {
            setCookie({ name: 'JWTAccess', value: JWTData.access, options: JWTAccessOptions })
            localStorage.setItem('JWTRefresh', JWTData.refresh)
        }
        catch {
            return JWTData
        }
        return JWTData
    }

    // Logging in
    async login(userData: loginProps) {
        setCookie({ name: 'username', value: userData.username, options: CredentialsOptions })
        setCookie({ name: 'password', value: userData.password, options: CredentialsOptions })
        runInAction(() => {
            this.theme = localStorage.getItem('black-theme') === 'on' ? 'black' : 'white'
        })
        // Logging the user, sending password and username
        const BaseTokenData = await fetch(loginURL,
            {
                method: 'POST',
                body: JSON.stringify(userData),
                headers:
                {
                    "Content-Type": "application/json",
                },
            })
            .then(resp => resp.ok ? resp.json() : undefined)
            .catch(() => undefined)
        if (!BaseTokenData?.auth_token) return false
        try {
            setCookie({ name: 'BaseToken', value: BaseTokenData.auth_token, options: BaseTokenOptions })
        }
        catch {
            return false
        }

        // Getting JWTs, authorizing with base token, saving JWT access to cookies, JWT refresh to localStorage
        const JWTData = await this.getJWT(userData)
        if (!JWTData) return false

        const gotUsersData = await Promise.all([this.getUserData(userData.username), this.getAllUsers()])
        if (!gotUsersData) {
            return false
        }

        const toggledOnline = await this.toggleOnline()
        if (!toggledOnline) return false

        const connectedToWs = await this.connectToWS()
        if (!connectedToWs) return false
        return true
    }

    // Logging out 
    async logout() {
        const isValid = await this.checkJWT().then(isValid => isValid)
        if (!isValid) return

        //Logging out, sending JWT access 
        const response = await fetch(logoutURL,
            {
                method: 'POST',
                headers:
                {
                    'Authorization': 'Bearer ' + getCookie('JWTAccess'),
                }
            })
            .then(res => res.status, () => undefined)

        if (!response) return false

        const toggledOnline = await this.toggleOnline()
        if (!toggledOnline) return false

        const cleared = await this.clear()
        if (!cleared) return false
        return true
    }

    // Sending a request to register
    async register(userData: registerProps) {
        const ok = await fetch(registerURL,
            {
                method: 'POST',
                body: JSON.stringify(userData),
                headers:
                {
                    "Content-Type": "application/json",
                },
            })
            .then(() => 'ok')
            .catch(() => undefined)

        if (!ok) return false
        return true
    }

    // Refreshing the JWT access
    async refreshJWTAccess() {
        const JWTAccess = await fetch(JWTRefreshURL,
            {
                method: 'POST',
                body: JSON.stringify({ refresh: localStorage.getItem('JWTRefresh') }),
                headers:
                {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(data => data?.access)
            .catch(() => undefined)
        console.log('got token')
        if (!JWTAccess) return null
        return JWTAccess
    }

    async toggleOnline() {
        if (!this.user.isOnline) {
            window.addEventListener('beforeunload', () => {
                this.updateUserDataInDB(this.user.username, { isOnline: false })
            })
        }
        const updated = await this.updateUserDataInDB(this.user.username, { isOnline: this.user.isOnline ? false : true })
        if (!updated) return false
        return true
    }

    async tryRelogin() {
        const username = getCookie('username')
        const password = getCookie('password')
        if (!username || !password) return
        const success = await this.login({ username: username, password: password })
        if (!success) return false
        return true
    }

    // Updating user data
    async updateUserDataInDB(username: string, updatedData: Partial<UserProps>) {
        if (!await this.checkJWT()) return false

        const response = await fetch(updateUserDataURL + username + '/',
            {
                method: 'PATCH',
                body: JSON.stringify(updatedData),
                headers:
                {
                    "Content-Type": "application/json",
                }
            })
            .then(res => res.status, () => undefined)

        if (!response || !this.user) return false
        if (this.user.username != username) return true
        runInAction(() => {
            for (const field in updatedData) {
                this.user[field] = updatedData[field]
            }
            if ('rooms' in updatedData) {
                this.roomStore.updateRooms(updatedData.rooms)
            }
            if ('notifications' in updatedData) {
                this.updateNotifications(JSON.parse(this.user.notifications))
            }
        })
        return true
    }

    updateUserDataInStore(userId: number, updatedData: Partial<UserProps>) {
        const update = (user: UserProps | PluralUserProps) => {
            if (!user) return
            for (const key in updatedData) {
                if (!isEqual(user[key], updatedData[key])) {
                    user[key] = updatedData[key]
                }
            }
        }
        if (userId === this.user?.id) {
            update(this.user)
            return
        }
        update(this.ObjectOfUsers[userId])
    }

    updateFilteredUsers(filterChoice: string) {
        switch (filterChoice) {
            case 'друзья': {
                this.filteredUsers = this.UsersFriends
                break
            }
            case 'заявки в друзья': {
                this.filteredUsers = this.UsersFriendRequests
                break
            }
            case 'отправленные заявки': {
                this.filteredUsers = this.UsersDesiredFriends
                break
            }
            case 'заблокированные': {
                this.filteredUsers = this.UsersBlockedUsers
                break
            }
        }
    }

    updateServiceWS({ currentRoom = this.serviceWS.currentRoom }: UpdateServiceWSInterface) {
        this.serviceWS.currentRoom = currentRoom
    }

    updateNotifications(notifications: NotificationsInterface) {
        runInAction(() => {
            if (!this.notifications) {
                this.notifications = notifications
                return
            }

            for (const key in notifications) {
                if (!isEqual(notifications[key], this.notifications[key])) {
                    this.notifications[key] = notifications[key]
                }
            }

            notifications.friend_acceptions.forEach(id => {
                const newDesiredFriends = this.user.desired_friends.filter(req_id => req_id != id)
                if (!isEqual(this.user.desired_friends, newDesiredFriends)) {
                    this.user.desired_friends = newDesiredFriends
                }
                if (!this.user.friends.includes(id)) this.user.friends.push(id)
            })
            notifications.friend_requests.forEach(id => {
                if (!this.user.friend_requests.includes(id)) this.user.friend_requests.push(id)
            })
            notifications.friend_deletions.forEach(id => {
                this.user.friends = this.user.friends.filter(req => req != id)
                this.user.friend_requests = this.user.friend_requests.filter(req => req != id)
                this.user.desired_friends = this.user.desired_friends.filter(req => req != id)
            })
            notifications.blocked_by.forEach(id => {
                this.updateUserDataInStore(id, { blocked_users: [...this.ObjectOfUsers[id].blocked_users, this.user.id] })
            })
        })
    }

    constructor() {
        makeObservable(this,
            {
                AllUsersSet: computed,
                fullName: computed,
                ObjectOfUsers: computed,
                UsersFriends: computed,
                UsersFriendRequests: computed,
                UsersDesiredFriends: computed,
                UsersBlockedUsers: computed,
                filteredUsers: observable,
                notifications: observable,
                serviceWS: observable,
                theme: observable,
                user: observable,
                users: observable,
                confirmEmail: action.bound,
                checkJWT: action.bound,
                checkJWTRefresh: action.bound,
                connectToWS: action.bound,
                changeTheme: action.bound,
                filterUsersArray: action.bound,
                getUserData: action.bound,
                getAllUsers: action.bound,
                getJWT: action.bound,
                login: action.bound,
                logout: action.bound,
                roomStore: observable,
                register: action.bound,
                refreshJWTAccess: action.bound,
                tryRelogin: action.bound,
                toggleOnline: action.bound,
                updateUserDataInDB: action.bound,
                updateUserDataInStore: action.bound,
                updateServiceWS: action.bound,
                updateFilteredUsers: action.bound,
                updateNotifications: action.bound
            })
    }
}
export default new UserStore