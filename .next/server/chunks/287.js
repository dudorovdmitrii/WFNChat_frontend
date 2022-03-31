"use strict";
exports.id = 287;
exports.ids = [287];
exports.modules = {

/***/ 8689:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Ue": () => (/* binding */ WebSocketChatURL),
/* harmony export */   "tf": () => (/* binding */ ReconnectTriesAmount)
/* harmony export */ });
/* unused harmony export WebSocketServiceURL */
/* harmony import */ var _globalSettings__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2076);

const WebSocketChatURL = `${_globalSettings__WEBPACK_IMPORTED_MODULE_0__/* .APIDomainWS */ .ei}/chat`;
const WebSocketServiceURL = `${_globalSettings__WEBPACK_IMPORTED_MODULE_0__/* .APIDomainWS */ .ei}/service`;
const ReconnectTriesAmount = 4;


/***/ }),

/***/ 6942:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "T": () => (/* binding */ ServiceWS),
/* harmony export */   "WS": () => (/* binding */ WS)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2175);
/* harmony import */ var _WebSocketSettings__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8689);


class ServiceWS {
    // Прерываем соединение с сервером
    disconnect() {
        clearInterval(this.interval);
        if (this.socket.readyState === 3 || this.socket.readyState === 2) {
            this.socket = null;
            return;
        }
        this.socket.close();
    }
    // Подключаемся по WebSocket к серверу, вешаем обработчики
    // При ошибке переподключаемся
    connect() {
        this.socket = new WebSocket(this.URL);
        this.hangEventListeners();
    }
    async hangEventListeners() {
        // Получаем сообщение по WebSocket с сервера
        this.socket.onmessage = async (event)=>{
            const notifications = JSON.parse(event.data);
            if (notifications.got_new_room) {
                const gotData = await this.getUserData(this.user.username);
                if (!gotData) {
                    alert('Что-то пошло не так');
                    return;
                }
            }
            for(const room_id in notifications.messages){
                const id = parseInt(room_id);
                let lastMessageTimeStamp = null;
                if (this.objectOfRooms[id]?.last_message) {
                    lastMessageTimeStamp = JSON.parse(this.objectOfRooms[id]?.last_message)?.timestamp_created;
                }
                const new_message = notifications?.messages[id][1];
                if (new_message && new_message.timestamp_created != lastMessageTimeStamp) {
                    console.log(new_message.text);
                    if (id != this.currentRoom) {
                        this.commonRoomUpdate(id, notifications?.messages[id][0], new_message);
                    }
                    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__/* .changeTitle */ .r1)('new message');
                }
            }
            // Обновляем в сети/не в сети статусы друзей
            this.user.friends.forEach((friend_id)=>this.updateUserDataInStore(friend_id, {
                    isOnline: notifications.friends_statuses[friend_id]
                })
            );
            //Обновляем уведомления
            this.updateNotifications(notifications);
        };
        // Переподключаемся при возникновении ошибки
        this.socket.onerror = async ()=>{
            if (this.reconnectTries > _WebSocketSettings__WEBPACK_IMPORTED_MODULE_1__/* .ReconnectTriesAmount */ .tf) {
                alert('Что-то пошло не так');
                this.disconnect();
                return;
            }
            if (!(0,_helpers__WEBPACK_IMPORTED_MODULE_0__/* .getCookie */ .ej)('BaseToken')) {
                alert('Что-то пошло не так');
                return;
            }
            ++this.reconnectTries;
            this.socket = new WebSocket(this.URL);
            this.hangEventListeners();
        };
        this.socket.onopen = ()=>{
            this.reconnectTries = 0;
        };
        window.addEventListener('beforeunload', ()=>{
            if (!this.currentRoom || !this.socket) return;
            this.socket.send(JSON.stringify({
                currentRoom: this.currentRoom
            }));
        });
    }
    // Отправляем сообщение по WebSocket на сервер
    send() {
        if (!(this.socket.readyState === 1)) return false;
        this.socket.send(JSON.stringify({
            check: true,
            currentRoom: this.currentRoom
        }));
        return true;
    }
    constructor(currentRoom, objectOfRooms, URL, user, unreadMessagesAmount, getUserData, updateUserDataInStore, updateNotifications, commonRoomUpdate){
        this.currentRoom = currentRoom;
        this.objectOfRooms = objectOfRooms;
        this.URL = URL;
        this.user = user;
        this.unreadMessagesAmount = unreadMessagesAmount;
        this.getUserData = getUserData;
        this.updateUserDataInStore = updateUserDataInStore;
        this.updateNotifications = updateNotifications;
        this.commonRoomUpdate = commonRoomUpdate;
        this.interval = null;
        this.reconnectTries = 0;
        this.socket = null;
        this.connect();
        this.interval = setInterval(()=>this.send()
        , 3000);
    }
}
class WS {
    connect() {
        this.socket = new WebSocket(this.URL);
        this.hangEventListeners();
    }
    hangEventListeners() {
        // Получаем сообщение по WebSocket с сервера
        this.socket.onmessage = (event)=>{
            const message = {
                ...JSON.parse(event.data)
            };
            this.addMessageToRoom(this.room_id, message);
        };
        // Переподключаемся при возникновении ошибки
        this.socket.onerror = ()=>{
            if (this.reconnectTries > _WebSocketSettings__WEBPACK_IMPORTED_MODULE_1__/* .ReconnectTriesAmount */ .tf) {
                this.disconnect();
                alert('Что-то пошло не так');
                return;
            }
            if (!(0,_helpers__WEBPACK_IMPORTED_MODULE_0__/* .getCookie */ .ej)('BaseToken')) {
                alert('Что-то пошло не так');
                return;
            }
            ++this.reconnectTries;
            this.socket = new WebSocket(this.URL);
            this.hangEventListeners();
        };
        this.socket.onopen = ()=>{
            this.reconnectTries = 0;
        };
    }
    // Отправляем сообщение по WebSocket на сервер
    send(message) {
        this.socket.send(JSON.stringify(message));
    }
    // Прерываем соединение с сервером
    disconnect() {
        if (this.socket.readyState === 3 || this.socket.readyState === 2) {
            this.socket = null;
            return;
        }
        this.socket.close();
    }
    constructor(URL, addMessageToRoom, room_id){
        this.URL = URL;
        this.addMessageToRoom = addMessageToRoom;
        this.room_id = room_id;
        this.reconnectTries = 0;
        this.socket = null;
        this.connect();
    }
}


/***/ }),

/***/ 4942:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "k": () => (/* binding */ GlobalContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const GlobalContext = (0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)({});


/***/ }),

/***/ 2076:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "oi": () => (/* binding */ APIDomainHTTP),
/* harmony export */   "ei": () => (/* binding */ APIDomainWS),
/* harmony export */   "dB": () => (/* binding */ AuthorizationErrorMessage),
/* harmony export */   "T6": () => (/* binding */ IncorrectFileErrorMessage),
/* harmony export */   "oc": () => (/* binding */ defaultTitle),
/* harmony export */   "Gh": () => (/* binding */ newMessageTitle),
/* harmony export */   "Ul": () => (/* binding */ ShowWarningDuration)
/* harmony export */ });
// URLs
const APIDomain = 'wfnchat.store';
const APIDomainHTTP = `http://${APIDomain}`;
const APIDomainWS = `ws://${APIDomain}/ws`;
// Ошибки
const AuthorizationErrorMessage = 'Что-то пошло не так';
const IncorrectFileErrorMessage = 'Некорректный тип файла';
// titles
const defaultTitle = 'WFNChat';
const newMessageTitle = 'Новое сообщение';
const ShowWarningDuration = 5000;


/***/ }),

/***/ 2175:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "r1": () => (/* binding */ changeTitle),
  "uf": () => (/* binding */ convertFromSpecialSymbols),
  "T4": () => (/* binding */ convertToSpecialSymbols),
  "w0": () => (/* binding */ createBase64),
  "Ak": () => (/* binding */ declOfNum),
  "kT": () => (/* binding */ deleteCookie),
  "X4": () => (/* binding */ fileExtentionCorrect),
  "N8": () => (/* binding */ getAnotherUser),
  "ej": () => (/* binding */ getCookie),
  "kS": () => (/* binding */ getDateRegistered),
  "Pp": () => (/* binding */ getFullName),
  "go": () => (/* binding */ getTimeCreated),
  "Fu": () => (/* binding */ handleUsersSearch),
  "iA": () => (/* binding */ isBirthdayCorrect),
  "H4": () => (/* binding */ makeTimeCreated),
  "Zu": () => (/* binding */ nameChanged),
  "d8": () => (/* binding */ setCookie),
  "B4": () => (/* binding */ showLastMessage),
  "nM": () => (/* binding */ validateNameSurname)
});

// EXTERNAL MODULE: ./globalSettings.ts
var globalSettings = __webpack_require__(2076);
;// CONCATENATED MODULE: ./globalTypes/index.ts
const checkExtensionRegex = /.(?<extension>\w+)$/;
const PhotoExtentions = [
    'png',
    'jpeg',
    'webp',
    'jpg',
    'jfif',
    'bmp',
    'gif',
    'tiff'
];
const VideoExtentions = [
    'mp4',
    'avi',
    'mov',
    'flv',
    'vob',
    'mkv',
    'wmv'
];

;// CONCATENATED MODULE: ./helpers/index.ts


function deleteCookie(name) {
    setCookie({
        name: name,
        value: "",
        options: {
            'max-age': String(-1)
        }
    });
}
function getCookie(name) {
    const matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
function setCookie({ name , value , options  }) {
    options = {
        path: '/',
        ...options
    };
    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
    for(const optionKey in options){
        updatedCookie += "; " + optionKey;
        const optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }
    document.cookie = updatedCookie;
}
function declOfNum(number, words) {
    return words[number % 100 > 4 && number % 100 < 20 ? 2 : [
        2,
        0,
        1,
        1,
        1,
        2
    ][number % 10 < 5 ? Math.abs(number) % 10 : 5]];
}
const fileExtentionCorrect = (type, fileName)=>{
    if (type === 'photo') {
        return PhotoExtentions.filter((ext)=>fileName?.match(checkExtensionRegex)?.groups?.extension?.includes(ext)
        ).length === 1;
    }
    if (type === 'video') {
        return VideoExtentions.filter((ext)=>fileName?.match(checkExtensionRegex)?.groups?.extension?.includes(ext)
        ).length === 1;
    }
};
const changeTitle = (type)=>{
    if (document.visibilityState === 'visible') {
        document.title = globalSettings/* defaultTitle */.oc;
        return;
    }
    switch(type){
        case 'default':
            {
                document.title = globalSettings/* defaultTitle */.oc;
                break;
            }
        case 'new message':
            {
                const interval = setInterval(()=>document.title === globalSettings/* defaultTitle */.oc ? document.title = globalSettings/* newMessageTitle */.Gh : document.title = globalSettings/* defaultTitle */.oc
                , 1000);
                const removeInterval = ()=>{
                    if (document.visibilityState === 'visible') {
                        changeTitle('default');
                        window.clearInterval(interval);
                        window.removeEventListener('visibilitychange', removeInterval);
                    }
                };
                window.addEventListener('visibilitychange', removeInterval);
                break;
            }
        default:
            {
                document.title = globalSettings/* defaultTitle */.oc;
                break;
            }
    }
};
const convertFromSpecialSymbols = (str)=>{
    return str.replaceAll(/&#39;/g, '\'').replaceAll(/&quot;/g, '"');
};
const convertToSpecialSymbols = (str)=>{
    return str.trim().replaceAll(/'/g, '&#39;').replaceAll(/"/g, '&quot;');
};
const createBase64 = async (data)=>{
    const reader = new FileReader();
    reader.readAsDataURL(data);
    return new Promise((resolve)=>{
        reader.onload = ()=>{
            resolve(reader.result);
        };
    });
};
const getAnotherUser = (array, userId)=>{
    return array.filter((anotherUserId)=>anotherUserId != userId
    )[0];
};
const getDateRegistered = (message)=>{
    return message.date_joined.match(/(?<date_joined>\d{4}-\d{2}-\d{2})/)?.groups?.date_joined;
};
const getFullName = (user)=>{
    return user.first_name + user.last_name;
};
const getTimeCreated = (message)=>{
    if (!message?.timestamp_created) return '';
    let offset = new Date().getTimezoneOffset() / 60;
    offset = offset > 0 ? Math.abs(offset) : offset * -1;
    const date = new Date(message.timestamp_created).toUTCString();
    const groups = date.match(/(?<hours>\d{2}):(?<minutes>\d{2}):/).groups;
    const { hours , minutes  } = groups;
    return String((+hours + offset) % 24) + ':' + minutes;
};
const handleUsersSearch = (event, dispatch, userGroup)=>{
    event.preventDefault();
    const input = event.target;
    if (input.value === '') {
        dispatch(userGroup);
        return;
    }
    dispatch(userGroup.filter((friend)=>{
        if ((friend.first_name + ' ' + friend.last_name).includes(input.value)) return true;
        return false;
    }));
};
const isBirthdayCorrect = (birthday)=>{
    const birthdayYear = new Date(birthday).getFullYear();
    if (birthdayYear >= new Date().getFullYear()) return false;
    return true;
};
const makeTimeCreated = ()=>{
    return new Date().getTime();
};
const nameChanged = (prevName, newName)=>{
    if (prevName.trim() === newName) return false;
    return true;
};
const validateNameSurname = (name, surname)=>{
    if (name.toLowerCase() === name) {
        return [
            'first_name',
            'Имя должно начинаться с заглавной буквы'
        ];
    }
    if (surname.toLowerCase() === surname) {
        return [
            'last_name',
            'Фамилия должна начинаться с заглавной буквы'
        ];
    }
    if (name.length > 12) {
        return [
            'first_name',
            'Имя должно содержать не более 12 символов'
        ];
    }
    if (name.length < 3) {
        return [
            'first_name',
            'Имя должно содержать не менее 3 символов'
        ];
    }
    if (surname.length < 3) {
        return [
            'last_name',
            'Фамилия должна содержать не менее 3 символов'
        ];
    }
    if (surname.length > 21) {
        return [
            'last_name',
            'Фамилия должна содержать не более 21 символа'
        ];
    }
    return [
        '',
        'valid'
    ];
};
const showLastMessage = (message)=>{
    if (!message) return;
    return message.text ? message.text.length > 100 ? message.text.slice(0, 99) + '...' : message.text : message.photo ? 'photo' : message.video ? 'video' : 'audio';
};


/***/ })

};
;