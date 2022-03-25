import { SyntheticEvent } from "react";
import { defaultTitle, newMessageTitle } from "../globalSettings";
import { checkExtensionRegex, MessageInterface, PhotoExtentions, PluralUserProps, UserProps, VideoExtentions } from "../globalTypes";
import { setCookieProps, TitleType } from "./helpersProps";

export function deleteCookie(name: string) {
    setCookie({ name: name, value: "", options: { 'max-age': String(-1) } })
}

export function getCookie(name: string): string {
    const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function setCookie({ name, value, options }: setCookieProps) {

    options = {
        path: '/',
        ...options
    };

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString()
    }

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value)

    for (const optionKey in options) {
        updatedCookie += "; " + optionKey
        const optionValue = options[optionKey]
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue
        }
    }

    document.cookie = updatedCookie
}

export function declOfNum(number: number, words: string[]) {
    return words[(number % 100 > 4 && number % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? Math.abs(number) % 10 : 5]]
}

export const fileExtentionCorrect = (type: 'photo' | 'video', fileName: string) => {
    if (type === 'photo') {
        return PhotoExtentions
            .filter(ext =>
                fileName?.match(checkExtensionRegex)?.groups?.extension?.includes(ext)).length === 1
    }
    if (type === 'video') {
        return VideoExtentions
            .filter(ext =>
                fileName?.match(checkExtensionRegex)?.groups?.extension?.includes(ext)).length === 1
    }
}

export const changeTitle = (type: TitleType) => {
    if (document.visibilityState === 'visible') {
        document.title = defaultTitle
        return
    }
    switch (type) {
        case 'default':
            {
                document.title = defaultTitle
                break
            }
        case 'new message':
            {
                const interval = setInterval(() =>
                    document.title === defaultTitle
                        ?
                        document.title = newMessageTitle
                        :
                        document.title = defaultTitle, 1000)
                const removeInterval = () => {
                    if (document.visibilityState === 'visible') {
                        changeTitle('default')
                        window.clearInterval(interval)
                        window.removeEventListener('visibilitychange', removeInterval)
                    }
                }
                window.addEventListener('visibilitychange', removeInterval)
                break
            }
        default:
            {
                document.title = defaultTitle
                break
            }
    }
}

export const convertFromSpecialSymbols = (str: string) => {
    return str.replaceAll(/&#39;/g, '\'').replaceAll(/&quot;/g, '"')
}

export const convertToSpecialSymbols = (str: string) => {
    return str.trim().replaceAll(/'/g, '&#39;').replaceAll(/"/g, '&quot;')
}

export const createBase64 = async (data: File): Promise<string> => {
    const reader = new FileReader()
    reader.readAsDataURL(data)
    return new Promise(resolve => {
        reader.onload = () => {
            resolve(reader.result as string)
        }
    })
}

export const getAnotherUser = (array: number[], userId: number) => {
    return array.filter(anotherUserId => anotherUserId != userId)[0]
}

export const getDateRegistered = (message: { date_joined: string }) => {
    return message.date_joined.match(/(?<date_joined>\d{4}-\d{2}-\d{2})/)?.groups?.date_joined
}

export const getFullName = (user: PluralUserProps | UserProps) => {
    return user.first_name + user.last_name
}

export const getTimeCreated = (message: { timestamp_created: number }) => {
    if (!message?.timestamp_created) return ''
    let offset = new Date().getTimezoneOffset() / 60
    offset = offset > 0 ? Math.abs(offset) : offset * -1
    const date = new Date(message.timestamp_created).toUTCString()
    const groups = date.match(/(?<hours>\d{2}):(?<minutes>\d{2}):/).groups
    const { hours, minutes } = groups
    return String((+hours + offset) % 24) + ':' + minutes
}

export const handleUsersSearch = (event: SyntheticEvent, dispatch: React.Dispatch<React.SetStateAction<PluralUserProps[]>>,
    userGroup: PluralUserProps[]) => {
    event.preventDefault()
    const input: HTMLInputElement = event.target as HTMLInputElement
    if (input.value === '') {
        dispatch(userGroup)
        return
    }
    dispatch(userGroup.filter(friend => {
        if ((friend.first_name + ' ' + friend.last_name).includes(input.value)) return true
        return false
    }))
}

export const isBirthdayCorrect = (birthday: string) => {
    const birthdayYear = new Date(birthday).getFullYear()
    if (birthdayYear >= new Date().getFullYear()) return false
    return true
}

export const makeTimeCreated = () => {
    return new Date().getTime()
}

export const nameChanged = (prevName: string, newName: string): boolean => {
    if (prevName.trim() === newName) return false
    return true
}

export const validateNameSurname = (name: string, surname: string): string[] => {
    if (name.toLowerCase() === name) {
        return ['first_name', 'Имя должно начинаться с заглавной буквы']
    }
    if (surname.toLowerCase() === surname) {
        return ['last_name', 'Фамилия должна начинаться с заглавной буквы']
    }
    if (name.length > 12) {
        return ['first_name', 'Имя должно содержать не более 12 символов']
    }
    if (name.length < 3) {
        return ['first_name', 'Имя должно содержать не менее 3 символов']
    }

    if (surname.length < 3) {
        return ['last_name', 'Фамилия должна содержать не менее 3 символов']
    }
    if (surname.length > 21) {
        return ['last_name', 'Фамилия должна содержать не более 21 символа']
    }
    return ['', 'valid']
}

export const showLastMessage = (message: MessageInterface) => {
    if (!message) return
    return message.text
        ?
        message.text.length > 100
            ?
            message.text.slice(0, 99) + '...'
            :
            message.text
        :
        message.photo
            ?
            'photo'
            :
            message.video
                ?
                'video'
                :
                'audio'
}