"use strict";
(() => {
var exports = {};
exports.id = 888;
exports.ids = [888];
exports.modules = {

/***/ 8863:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ _app)
});

// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(6689);
;// CONCATENATED MODULE: external "next/head"
const head_namespaceObject = require("next/head");
var head_default = /*#__PURE__*/__webpack_require__.n(head_namespaceObject);
// EXTERNAL MODULE: ./node_modules/next/dynamic.js
var dynamic = __webpack_require__(5152);
;// CONCATENATED MODULE: external "mobx"
const external_mobx_namespaceObject = require("mobx");
// EXTERNAL MODULE: ./helpers/index.ts + 1 modules
var helpers = __webpack_require__(2175);
// EXTERNAL MODULE: ./globalSettings.ts
var globalSettings = __webpack_require__(2076);
;// CONCATENATED MODULE: ./stores/RoomStore/RoomStoreSettings.ts

const createRoomURL = `${globalSettings/* APIDomainHTTP */.oi}/rooms/`;
const getMoreMessagesURL = `${globalSettings/* APIDomainHTTP */.oi}/messages/`;
const updateRoomURL = `${globalSettings/* APIDomainHTTP */.oi}/rooms/`;

;// CONCATENATED MODULE: ./stores/RoomStore/index.tsx



class RoomStore {
    // Making an object id:room for convenience
    get ObjectOfRooms() {
        const RoomsObject = {};
        this.RoomsArray?.forEach((room)=>RoomsObject[room.id] = room
        );
        return RoomsObject;
    }
    addMessageToRoom(room_id, message) {
        this.ObjectOfRooms[room_id].messages.push(message);
        this.updateLastMessage(room_id, message);
    }
    changeCurrentRoom(room) {
        (0,external_mobx_namespaceObject.runInAction)(()=>{
            if (this.currentRoom) {
                this.currentRoom.messages = [];
            }
            this.currentRoom = room;
            this.receivedMessagesAmount = 0;
            this.requestedMessagesAmount = 0;
        });
    }
    async createRoom(roomData) {
        const room = await fetch(createRoomURL, {
            method: 'POST',
            body: JSON.stringify(roomData),
            headers: {
                'Authorization': 'Bearer ' + (0,helpers/* getCookie */.ej)('JWTAccess'),
                'Content-Type': 'application/json'
            }
        }).then((res)=>res.json()
        ).catch(()=>undefined
        );
        if (!room) return false;
        (0,external_mobx_namespaceObject.runInAction)(()=>{
            this.RoomsArray.unshift(room);
            this.unreadMessagesAmount[room.id] = 0;
            this.filteredRoomsArray = this.RoomsArray;
        });
        return true;
    }
    filterRoomsArray({ first_room_id , filter_word , user_id  }) {
        if (first_room_id) {
            if (first_room_id === this.RoomsArray[0].id) return;
            this.filteredRoomsArray = [
                this.ObjectOfRooms[first_room_id]
            ];
            this.RoomsArray.forEach((room)=>{
                if (room.id != first_room_id) {
                    this.filteredRoomsArray.push(room);
                }
            });
            return;
        }
        if (filter_word === '') {
            this.filteredRoomsArray = this.RoomsArray;
        }
        if (filter_word) {
            this.filteredRoomsArray = this.RoomsArray.filter((room)=>{
                if (room.name) return room.name.includes(filter_word);
                const anotherUser = this.userStore.ObjectOfUsers[(0,helpers/* getAnotherUser */.N8)(room.users, user_id)];
                const fullname = anotherUser.first_name + ' ' + anotherUser.last_name;
                return fullname.includes(filter_word);
            });
        }
    }
    // Fetching messages if needed more
    async getMoreMessages({ room_id , count , past , last_id  }) {
        if (this.receivedMessagesAmount != this.requestedMessagesAmount) return;
        (0,external_mobx_namespaceObject.runInAction)(()=>{
            this.requestedMessagesAmount += count;
        });
        // Building the query string according to the received params
        let query_string = `?room_id=${room_id}&count=${count}`;
        query_string += last_id ? `&last_id=${last_id}` : '';
        query_string += past ? `&past=${past}` : '';
        const messages = await fetch(getMoreMessagesURL + query_string, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + (0,helpers/* getCookie */.ej)('JWTAccess')
            }
        }).then((res)=>res.json()
        , ()=>undefined
        );
        (0,external_mobx_namespaceObject.runInAction)(()=>{
            if (!messages || messages.length === 0) return false;
            const room = this.ObjectOfRooms[String(room_id)];
            messages?.forEach((message)=>{
                room.messages.unshift(message);
            });
            this.receivedMessagesAmount += messages.length;
        });
        return messages;
    }
    initRoomsArray(roomsArray, notifications) {
        for (const room of roomsArray){
            room['messages'] = [];
        }
        this.RoomsArray = roomsArray.sort((room1, room2)=>{
            let time1 = 0;
            let time2 = 0;
            if (room2.last_message) {
                time2 = JSON.parse(room2.last_message).timestamp_created;
            }
            if (room1.last_message) {
                time1 = JSON.parse(room1.last_message).timestamp_created;
            }
            return time1 && time2 ? time2 - time1 : time1 ? 1 : 0;
        });
        for (const room1 of this.RoomsArray){
            try {
                this.unreadMessagesAmount[room1.id] = notifications.messages[room1.id][0];
            } catch  {
                this.unreadMessagesAmount[room1.id] = 0;
            }
        }
        this.filteredRoomsArray = this.RoomsArray;
    }
    async updateRoom(roomData, room_id, user) {
        const updatedRoom = await fetch(updateRoomURL + `${room_id}/`, {
            method: 'PATCH',
            body: JSON.stringify(roomData),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (0,helpers/* getCookie */.ej)('JWTAccess')
            }
        }).then((res)=>res.json()
        ).catch(()=>undefined
        );
        if (!updatedRoom) return false;
        (0,external_mobx_namespaceObject.runInAction)(()=>{
            if (updatedRoom.users.filter((memberId)=>memberId === user.id
            ).length === 0) {
                this.RoomsArray.splice(this.RoomsArray.findIndex((room)=>room.id === updatedRoom.id
                ), 1);
                this.filteredRoomsArray = this.RoomsArray;
                return true;
            }
            for(const key in updatedRoom){
                if (key in roomData) {
                    this.ObjectOfRooms[room_id][key] = updatedRoom[key];
                }
            }
            if (Object.keys(roomData).includes('added_users')) {
                const roomUsers = this.ObjectOfRooms[room_id].users;
                const addedUsers = roomData['added_users'];
                this.ObjectOfRooms[room_id].users = [
                    ...roomUsers,
                    ...addedUsers
                ];
            }
            if (Object.keys(roomData).includes('removed_users')) {
                const roomUsers = this.ObjectOfRooms[room_id].users;
                const removedUsers = roomData['removed_users'];
                const newUsersArray = roomUsers.filter((userId)=>!removedUsers.includes(userId)
                );
                this.ObjectOfRooms[room_id].users = newUsersArray;
            }
        });
        return true;
    }
    updateUnreadMessages(room_id, messages_amount) {
        this.unreadMessagesAmount[room_id] = messages_amount;
    }
    updateLastMessage(room_id, message) {
        this.ObjectOfRooms[room_id].last_message = JSON.stringify(message);
    }
    commonRoomUpdate(room_id, messages_amount, message) {
        this.updateLastMessage(room_id, message);
        this.updateUnreadMessages(room_id, messages_amount);
        this.filterRoomsArray({
            first_room_id: room_id
        });
    }
    updateRooms(rooms) {
        this.RoomsArray = rooms;
        this.filteredRoomsArray = this.RoomsArray;
    }
    constructor(){
        this.currentRoom = null;
        this.filteredRoomsArray = null;
        this.RoomsArray = null;
        this.receivedMessagesAmount = 0;
        this.requestedMessagesAmount = 0;
        this.unreadMessagesAmount = {};
        this.userStore = null;
        (0,external_mobx_namespaceObject.makeObservable)(this, {
            currentRoom: external_mobx_namespaceObject.observable,
            filteredRoomsArray: external_mobx_namespaceObject.observable,
            RoomsArray: external_mobx_namespaceObject.observable,
            receivedMessagesAmount: external_mobx_namespaceObject.observable,
            requestedMessagesAmount: external_mobx_namespaceObject.observable,
            unreadMessagesAmount: external_mobx_namespaceObject.observable,
            userStore: external_mobx_namespaceObject.observable,
            ObjectOfRooms: external_mobx_namespaceObject.computed,
            addMessageToRoom: external_mobx_namespaceObject.action.bound,
            createRoom: external_mobx_namespaceObject.action.bound,
            changeCurrentRoom: external_mobx_namespaceObject.action.bound,
            commonRoomUpdate: external_mobx_namespaceObject.action.bound,
            filterRoomsArray: external_mobx_namespaceObject.action.bound,
            getMoreMessages: external_mobx_namespaceObject.action.bound,
            initRoomsArray: external_mobx_namespaceObject.action.bound,
            updateRooms: external_mobx_namespaceObject.action.bound,
            updateRoom: external_mobx_namespaceObject.action.bound,
            updateLastMessage: external_mobx_namespaceObject.action.bound,
            updateUnreadMessages: external_mobx_namespaceObject.action.bound
        });
    }
}
/* harmony default export */ const stores_RoomStore = (new RoomStore);

// EXTERNAL MODULE: external "lodash"
var external_lodash_ = __webpack_require__(6517);
;// CONCATENATED MODULE: ./stores/UserStore/UserStoreSettings.ts

const confirmEmailURL = `${globalSettings/* APIDomainHTTP */.oi}/auth/users/activation/`;
const getUserDataURL = `${globalSettings/* APIDomainHTTP */.oi}/user/`;
const getAllUsersURL = `${globalSettings/* APIDomainHTTP */.oi}/users/`;
const getOnlyRoomsUserURL = `${globalSettings/* APIDomainHTTP */.oi}/only_rooms_user/`;
const JWTGetURL = `${globalSettings/* APIDomainHTTP */.oi}/api/token/`;
const JWTRefreshURL = `${globalSettings/* APIDomainHTTP */.oi}/api/token/refresh/`;
const loginURL = `${globalSettings/* APIDomainHTTP */.oi}/auth/token/login/`;
const logoutURL = `${globalSettings/* APIDomainHTTP */.oi}/auth/token/logout/`;
const registerURL = `${globalSettings/* APIDomainHTTP */.oi}/auth/users/`;
const updateUserDataURL = `${globalSettings/* APIDomainHTTP */.oi}/user/`;
const month = 60 ** 2 * 24 * 30;
const minute = 60;
const BaseTokenOptions = {
    'max-age': String(month),
    'samesite': 'strict'
};
const CredentialsOptions = {
    'max-age': String(month),
    'samesite': 'strict'
};
const JWTAccessOptions = {
    'max-age': String(minute * 3),
    'samesite': 'strict'
};

// EXTERNAL MODULE: ./WebSocket/index.ts
var WebSocket = __webpack_require__(6942);
;// CONCATENATED MODULE: ./stores/UserStore/index.ts







class UserStore {
    // Making a set of usernames to check uniqueness
    get AllUsersSet() {
        const usernamesSet = new Set();
        if (!this.users) return new Set();
        this.users.forEach((user)=>usernamesSet.add(user.username)
        );
        return usernamesSet;
    }
    get fullName() {
        return this.user?.first_name + ' ' + this.user?.last_name;
    }
    get ObjectOfUsers() {
        const object = {};
        this?.users?.forEach((user)=>object[user.id] = user
        );
        return object;
    }
    get UsersFriends() {
        return this.user?.friends?.map((friend_id)=>this.ObjectOfUsers[friend_id]
        );
    }
    get UsersFriendRequests() {
        return this.user?.friend_requests?.map((friend_id)=>this.ObjectOfUsers[friend_id]
        );
    }
    get UsersDesiredFriends() {
        return this.user?.desired_friends?.map((friend_id)=>this.ObjectOfUsers[friend_id]
        );
    }
    get UsersBlockedUsers() {
        return this.user?.blocked_users?.map((friend_id)=>this.ObjectOfUsers[friend_id]
        );
    }
    changeTheme(color) {
        this.theme = color;
    }
    // Confirming the email
    async confirmEmail(confirmData) {
        const ok = await fetch(confirmEmailURL, {
            method: 'POST',
            body: JSON.stringify(confirmData),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(()=>'ok'
        ).catch(()=>undefined
        );
        if (!ok) return false;
        return true;
    }
    // Checking and refreshing JWTs if needed
    async checkJWT() {
        // Check if JWT access has expired
        if (!(0,helpers/* getCookie */.ej)('JWTAccess')) {
            if (this.checkJWTRefresh()) {
                const JWTAccess = await this.refreshJWTAccess();
                if (!JWTAccess) {
                    await this.clear();
                    return false;
                }
                (0,helpers/* setCookie */.d8)({
                    name: 'JWTAccess',
                    value: JWTAccess,
                    options: JWTAccessOptions
                });
                return true;
            } else {
                this.clear();
                return false;
            }
        }
        return true;
    }
    // Checking if the user has authorized before
    checkJWTRefresh() {
        if (!localStorage.getItem('JWTRefresh')) {
            return false;
        }
        return true;
    }
    async connectToWS() {
        if (this.serviceWS) {
            this.serviceWS.disconnect();
        }
        if (!await this.checkJWT()) return false;
        this.serviceWS = new WebSocket/* ServiceWS */.T(this?.roomStore?.currentRoom?.id, this.roomStore.ObjectOfRooms, `${globalSettings/* APIDomainWS */.ei}/service` + `/${this.user.id}/` + `?username=${this.user.username}&token=${(0,helpers/* getCookie */.ej)('BaseToken')}`, this.user, this.roomStore.unreadMessagesAmount, (username)=>this.getUserData(username)
        , (user_id, updatedData)=>this.updateUserDataInStore(user_id, updatedData)
        , (notifications)=>this.updateNotifications(notifications)
        , (room_id, messages_amount, message)=>this?.roomStore.commonRoomUpdate(room_id, messages_amount, message)
        );
        return true;
    }
    async clear() {
        const toggledOnline = await this.toggleOnline();
        if (!toggledOnline) return false;
        (0,helpers/* deleteCookie */.kT)('BaseToken');
        (0,helpers/* deleteCookie */.kT)('JWTAccess');
        (0,helpers/* deleteCookie */.kT)('username');
        (0,helpers/* deleteCookie */.kT)('password');
        delete localStorage['JWTRefresh'];
        (0,external_mobx_namespaceObject.runInAction)(()=>{
            this.user = null;
            this.roomStore.currentRoom = null;
            this.roomStore = null;
        });
        return true;
    }
    filterUsersArray({ filter_word , array  }) {
        if (filter_word === '') {
            this.filteredUsers = array;
        }
        if (filter_word) {
            this.filteredUsers = array.filter((user)=>(user.first_name + ' ' + user.last_name).includes(filter_word)
            );
        }
    }
    // Getting all users available, saving in the store
    async getAllUsers() {
        const data = await fetch(getAllUsersURL, {
            method: 'GET'
        }).then((resp)=>resp.ok ? resp.json() : undefined
        ).catch(()=>undefined
        );
        if (!data) return false;
        (0,external_mobx_namespaceObject.runInAction)(()=>{
            this.users = data;
            this.filteredUsers = data;
        });
        return true;
    }
    // Getting user data
    async getUserData(username) {
        if (!await this.checkJWT().then((isValid)=>isValid
        )) return;
        // Getting user data, authorizing with JWT access
        const data = await fetch(getUserDataURL + username + '/', {
            headers: {
                'Authorization': 'Bearer ' + (0,helpers/* getCookie */.ej)('JWTAccess')
            }
        }).then((resp)=>resp.ok ? resp.json() : undefined
        ).catch(()=>undefined
        );
        if (!data) return false;
        (0,external_mobx_namespaceObject.runInAction)(async ()=>{
            this.user = data;
            this.roomStore = stores_RoomStore;
            this.updateNotifications(JSON.parse(this.user.notifications));
            this.roomStore.initRoomsArray(this.user.rooms, JSON.parse(this.user.notifications));
            this.roomStore.userStore = this;
        });
        return true;
    }
    async getJWT(userData) {
        const JWTData = await fetch(JWTGetURL, {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((resp)=>resp.ok ? resp.json() : undefined
        ).catch(()=>undefined
        );
        if (!JWTData?.access || !JWTData?.refresh) return null;
        try {
            (0,helpers/* setCookie */.d8)({
                name: 'JWTAccess',
                value: JWTData.access,
                options: JWTAccessOptions
            });
            localStorage.setItem('JWTRefresh', JWTData.refresh);
        } catch  {
            return JWTData;
        }
        return JWTData;
    }
    // Logging in
    async login(userData) {
        (0,helpers/* setCookie */.d8)({
            name: 'username',
            value: userData.username,
            options: CredentialsOptions
        });
        (0,helpers/* setCookie */.d8)({
            name: 'password',
            value: userData.password,
            options: CredentialsOptions
        });
        (0,external_mobx_namespaceObject.runInAction)(()=>{
            this.theme = localStorage.getItem('black-theme') === 'on' ? 'black' : 'white';
        });
        // Logging the user, sending password and username
        const BaseTokenData = await fetch(loginURL, {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((resp)=>resp.ok ? resp.json() : undefined
        ).catch(()=>undefined
        );
        if (!BaseTokenData?.auth_token) return false;
        try {
            (0,helpers/* setCookie */.d8)({
                name: 'BaseToken',
                value: BaseTokenData.auth_token,
                options: BaseTokenOptions
            });
        } catch  {
            return false;
        }
        // Getting JWTs, authorizing with base token, saving JWT access to cookies, JWT refresh to localStorage
        const JWTData = await this.getJWT(userData);
        if (!JWTData) return false;
        const gotUsersData = await Promise.all([
            this.getUserData(userData.username),
            this.getAllUsers()
        ]);
        if (!gotUsersData) {
            return false;
        }
        const toggledOnline = await this.toggleOnline();
        if (!toggledOnline) return false;
        const connectedToWs = await this.connectToWS();
        if (!connectedToWs) return false;
        return true;
    }
    // Logging out 
    async logout() {
        const isValid1 = await this.checkJWT().then((isValid)=>isValid
        );
        if (!isValid1) return;
        //Logging out, sending JWT access 
        const response = await fetch(logoutURL, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + (0,helpers/* getCookie */.ej)('JWTAccess')
            }
        }).then((res)=>res.status
        , ()=>undefined
        );
        if (!response) return false;
        const toggledOnline = await this.toggleOnline();
        if (!toggledOnline) return false;
        const cleared = await this.clear();
        if (!cleared) return false;
        return true;
    }
    // Sending a request to register
    async register(userData) {
        const ok = await fetch(registerURL, {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(()=>'ok'
        ).catch(()=>undefined
        );
        if (!ok) return false;
        return true;
    }
    // Refreshing the JWT access
    async refreshJWTAccess() {
        const JWTAccess = await fetch(JWTRefreshURL, {
            method: 'POST',
            body: JSON.stringify({
                refresh: localStorage.getItem('JWTRefresh')
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res)=>res.json()
        ).then((data)=>data?.access
        ).catch(()=>undefined
        );
        console.log('got token');
        if (!JWTAccess) return null;
        return JWTAccess;
    }
    async toggleOnline() {
        if (!this.user.isOnline) {
            window.addEventListener('beforeunload', ()=>{
                this.updateUserDataInDB(this.user.username, {
                    isOnline: false
                });
            });
        }
        const updated = await this.updateUserDataInDB(this.user.username, {
            isOnline: this.user.isOnline ? false : true
        });
        if (!updated) return false;
        return true;
    }
    async tryRelogin() {
        const username = (0,helpers/* getCookie */.ej)('username');
        const password = (0,helpers/* getCookie */.ej)('password');
        if (!username || !password) return;
        const success = await this.login({
            username: username,
            password: password
        });
        if (!success) return false;
        return true;
    }
    // Updating user data
    async updateUserDataInDB(username, updatedData) {
        if (!await this.checkJWT()) return false;
        const response = await fetch(updateUserDataURL + username + '/', {
            method: 'PATCH',
            body: JSON.stringify(updatedData),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res)=>res.status
        , ()=>undefined
        );
        if (!response || !this.user) return false;
        if (this.user.username != username) return true;
        (0,external_mobx_namespaceObject.runInAction)(()=>{
            for(const field in updatedData){
                this.user[field] = updatedData[field];
            }
            if ('rooms' in updatedData) {
                this.roomStore.updateRooms(updatedData.rooms);
            }
            if ('notifications' in updatedData) {
                this.updateNotifications(JSON.parse(this.user.notifications));
            }
        });
        return true;
    }
    updateUserDataInStore(userId, updatedData) {
        const update = (user)=>{
            if (!user) return;
            for(const key in updatedData){
                if (!(0,external_lodash_.isEqual)(user[key], updatedData[key])) {
                    user[key] = updatedData[key];
                }
            }
        };
        if (userId === this.user?.id) {
            update(this.user);
            return;
        }
        update(this.ObjectOfUsers[userId]);
    }
    updateFilteredUsers(filterChoice) {
        switch(filterChoice){
            case 'друзья':
                {
                    this.filteredUsers = this.UsersFriends;
                    break;
                }
            case 'заявки в друзья':
                {
                    this.filteredUsers = this.UsersFriendRequests;
                    break;
                }
            case 'отправленные заявки':
                {
                    this.filteredUsers = this.UsersDesiredFriends;
                    break;
                }
            case 'заблокированные':
                {
                    this.filteredUsers = this.UsersBlockedUsers;
                    break;
                }
        }
    }
    updateServiceWS({ currentRoom =this.serviceWS.currentRoom  }) {
        this.serviceWS.currentRoom = currentRoom;
    }
    updateNotifications(notifications) {
        (0,external_mobx_namespaceObject.runInAction)(()=>{
            if (!this.notifications) {
                this.notifications = notifications;
                return;
            }
            for(const key in notifications){
                if (!(0,external_lodash_.isEqual)(notifications[key], this.notifications[key])) {
                    this.notifications[key] = notifications[key];
                }
            }
            notifications.friend_acceptions.forEach((id)=>{
                const newDesiredFriends = this.user.desired_friends.filter((req_id)=>req_id != id
                );
                if (!(0,external_lodash_.isEqual)(this.user.desired_friends, newDesiredFriends)) {
                    this.user.desired_friends = newDesiredFriends;
                }
                if (!this.user.friends.includes(id)) this.user.friends.push(id);
            });
            notifications.friend_requests.forEach((id)=>{
                if (!this.user.friend_requests.includes(id)) this.user.friend_requests.push(id);
            });
            notifications.friend_deletions.forEach((id)=>{
                this.user.friends = this.user.friends.filter((req)=>req != id
                );
                this.user.friend_requests = this.user.friend_requests.filter((req)=>req != id
                );
                this.user.desired_friends = this.user.desired_friends.filter((req)=>req != id
                );
            });
            notifications.blocked_by.forEach((id)=>{
                this.updateUserDataInStore(id, {
                    blocked_users: [
                        ...this.ObjectOfUsers[id].blocked_users,
                        this.user.id
                    ]
                });
            });
        });
    }
    constructor(){
        this.filteredUsers = [];
        this.notifications = null;
        this.roomStore = null;
        this.serviceWS = null;
        this.theme = 'white';
        this.user = null;
        this.users = [];
        (0,external_mobx_namespaceObject.makeObservable)(this, {
            AllUsersSet: external_mobx_namespaceObject.computed,
            fullName: external_mobx_namespaceObject.computed,
            ObjectOfUsers: external_mobx_namespaceObject.computed,
            UsersFriends: external_mobx_namespaceObject.computed,
            UsersFriendRequests: external_mobx_namespaceObject.computed,
            UsersDesiredFriends: external_mobx_namespaceObject.computed,
            UsersBlockedUsers: external_mobx_namespaceObject.computed,
            filteredUsers: external_mobx_namespaceObject.observable,
            notifications: external_mobx_namespaceObject.observable,
            serviceWS: external_mobx_namespaceObject.observable,
            theme: external_mobx_namespaceObject.observable,
            user: external_mobx_namespaceObject.observable,
            users: external_mobx_namespaceObject.observable,
            confirmEmail: external_mobx_namespaceObject.action.bound,
            checkJWT: external_mobx_namespaceObject.action.bound,
            checkJWTRefresh: external_mobx_namespaceObject.action.bound,
            connectToWS: external_mobx_namespaceObject.action.bound,
            changeTheme: external_mobx_namespaceObject.action.bound,
            filterUsersArray: external_mobx_namespaceObject.action.bound,
            getUserData: external_mobx_namespaceObject.action.bound,
            getAllUsers: external_mobx_namespaceObject.action.bound,
            getJWT: external_mobx_namespaceObject.action.bound,
            login: external_mobx_namespaceObject.action.bound,
            logout: external_mobx_namespaceObject.action.bound,
            roomStore: external_mobx_namespaceObject.observable,
            register: external_mobx_namespaceObject.action.bound,
            refreshJWTAccess: external_mobx_namespaceObject.action.bound,
            tryRelogin: external_mobx_namespaceObject.action.bound,
            toggleOnline: external_mobx_namespaceObject.action.bound,
            updateUserDataInDB: external_mobx_namespaceObject.action.bound,
            updateUserDataInStore: external_mobx_namespaceObject.action.bound,
            updateServiceWS: external_mobx_namespaceObject.action.bound,
            updateFilteredUsers: external_mobx_namespaceObject.action.bound,
            updateNotifications: external_mobx_namespaceObject.action.bound
        });
    }
}
/* harmony default export */ const stores_UserStore = (new UserStore);

// EXTERNAL MODULE: ./context/index.ts
var context = __webpack_require__(4942);
;// CONCATENATED MODULE: ./pages/_app.tsx












const Warning = (0,dynamic["default"])(null, {
    loadableGenerated: {
        modules: [
            "_app.tsx -> " + "./../components/Warning"
        ]
    },
    ssr: false
});
const AppWrapper = ({ Component , pageProps  })=>{
    const { 0: type1 , 1: setType  } = (0,external_react_.useState)(null);
    const { 0: text1 , 1: setText  } = (0,external_react_.useState)('Некорректный тип файла');
    const { 0: icon1 , 1: setIcon  } = (0,external_react_.useState)(null);
    const showWarning = ({ type , text , icon  })=>{
        setType(type);
        setText(text);
        setIcon(icon);
        const warning = document?.getElementById('warning');
        warning?.classList.add('warningOpen');
        setTimeout(()=>warning?.classList.remove('warningOpen')
        , globalSettings/* ShowWarningDuration */.Ul);
    };
    const contextValue = {
        'UserStore': stores_UserStore,
        'RoomStore': stores_RoomStore,
        'showWarning': ({ type , text , icon  })=>showWarning({
                type,
                text,
                icon
            })
    };
    return(/*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
        children: [
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)((head_default()), {
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("title", {
                        children: globalSettings/* defaultTitle */.oc
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("meta", {
                        name: "viewport",
                        content: "width=device-width, initial-scale=1.0, shrink-to-fit=no"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("meta", {
                        name: "description",
                        content: "Онлайн чат для общения"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("meta", {
                        httpEquiv: "Content-Type",
                        content: "text/html; charset=utf-8"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("meta", {
                        name: "Keywords",
                        content: "Чат, чат, Chat, chat, Мессэнджер, мессэнджер, Messanger, messanger"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("link", {
                        rel: "shortcut icon",
                        href: "/static/favicon.ico"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("link", {
                        rel: "apple-touch-icon",
                        sizes: "180x180",
                        href: "/static/favicon.png"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("link", {
                        rel: "icon",
                        type: "image/png",
                        sizes: "32x32",
                        href: "/static/favicon.png"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("link", {
                        rel: "icon",
                        type: "image/png",
                        sizes: "16x16",
                        href: "/static/favicon.png"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("link", {
                        rel: "preconnect",
                        href: "https://fonts.googleapis.com/css2?family=Open+Sans+Condensed:ital,wght@0,300;0,700;1,300&family=Poppins:ital,wght@0,200;0,300;0,400;1,100;1,200;1,300;1,400&display=swap"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("link", {
                        rel: "preconnect",
                        as: "font",
                        href: globalSettings/* APIDomainHTTP */.oi
                    })
                ]
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)(context/* GlobalContext.Provider */.k.Provider, {
                value: contextValue,
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx(Warning, {
                        id: "warning",
                        className: "warning",
                        type: type1,
                        text: text1,
                        icon: icon1
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx(Component, {
                        ...pageProps
                    })
                ]
            })
        ]
    }));
};
/* harmony default export */ const _app = (AppWrapper);


/***/ }),

/***/ 6517:
/***/ ((module) => {

module.exports = require("lodash");

/***/ }),

/***/ 5832:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/loadable.js");

/***/ }),

/***/ 6689:
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ 997:
/***/ ((module) => {

module.exports = require("react/jsx-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [152,287], () => (__webpack_exec__(8863)));
module.exports = __webpack_exports__;

})();