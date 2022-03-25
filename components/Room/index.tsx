import { useContext } from 'react'
import cn from 'classnames'
import { observer } from 'mobx-react-lite'
import { cloneDeep } from 'lodash'

import { NotificationsInterface } from '../../globalTypes'
import { GlobalContext } from '../../context'
import { RoomProps } from './RoomProps'
import { convertFromSpecialSymbols, getAnotherUser, getTimeCreated, showLastMessage } from '../../helpers'
import { Avatar, NotificationUnread } from '..'

import PhotoFileIcon from './../../public/icons/photoFile.svg'
import AudioFileIcon from './../../public/icons/audioFile.svg'
import VideoFileIcon from './../../public/icons/videoFile.svg'
import styles from './Room.module.scss'

export const Room = observer(({ room, className, ...props }: RoomProps): JSX.Element => {
    const { RoomStore, UserStore } = useContext(GlobalContext)
    const { user, checkJWT, updateServiceWS, ObjectOfUsers, theme, updateUserDataInDB, notifications } = UserStore
    const { changeCurrentRoom, currentRoom, unreadMessagesAmount, updateUnreadMessages, getMoreMessages } = RoomStore
    const handlePickRoom = async () => {
        if (!await checkJWT()) return
        changeCurrentRoom(room)
        const Updatednotifications: NotificationsInterface = cloneDeep(notifications)
        Updatednotifications.messages[room.id] = [0, null]
        await updateUserDataInDB(user.username, { notifications: JSON.stringify(Updatednotifications) })

        await getMoreMessages({ room_id: room.id, count: 20 })
        updateUnreadMessages(room.id, 0)
        updateServiceWS({ currentRoom: room.id })
    }
    const getLastMessageTime = () => {
        return getTimeCreated(
            room?.messages.length > 0
                ?
                room?.messages[room?.messages.length - 1]
                :
                room.last_message ? JSON.parse(room.last_message) : '')
    }
    const checkIfUserOnline = () => {
        return ObjectOfUsers[room.users.filter(anotherUserId => anotherUserId != user.id)[0]]?.isOnline
    }
    const getRoomClassNames = () => {
        return cn(
            className,
            styles.room,
            {
                [styles.currentRoom]: currentRoom === room,
                [styles.currentRoomBlackTheme]: currentRoom === room && theme === 'black',
                [styles.roomBlackTheme]: theme === 'black'
            })
    }
    const makeLastMessage = (message: string) => {
        if (message === 'photo') return <PhotoFileIcon className={styles.lastMessageIcon} />
        if (message === 'audio') return <AudioFileIcon className={styles.lastMessageIcon} />
        if (message === 'video') return <VideoFileIcon className={styles.lastMessageIcon} />
        return convertFromSpecialSymbols(message)
    }
    const getRoomName = () => {
        const shortenName = (name: string, shortName?: string) => {
            if (screen.width > 600 && screen.width <= 768) {
                return name
            }
            if (name.length <= 23) {
                return name
            }
            if (screen.width <= 1720) {
                return shortName ? shortName : name.slice(0, 20) + '...'
            }
            return name
        }
        if (room?.name) return shortenName(room.name)
        const anotherUser = ObjectOfUsers[getAnotherUser(room?.users, user.id)]
        return shortenName(anotherUser?.first_name + ' ' + anotherUser?.last_name, anotherUser?.first_name)
    }
    const getLastMessage = () => {
        if (room?.messages.length) {
            const message = showLastMessage(room?.messages[room?.messages.length - 1])
            return makeLastMessage(message)
        }
        if (room.last_message) {
            const message = showLastMessage(room.last_message ? JSON.parse(room.last_message) : '')
            return makeLastMessage(message)
        }
        return ''
    }
    return (
        <div className={getRoomClassNames()} {...props} onClick={handlePickRoom}>
            <div className={styles.upperBar}>
                <div className={styles.roomInfo}>
                    <div className={styles.avatarWrapper}>
                        {
                            room.isGroup
                                ?
                                <Avatar title={getRoomName()} object={room} size={54} edgeType='circle' cover={true} className={styles.avatar} />
                                :
                                <>
                                    <div className={cn(styles.isOnlineWrapper, { [styles.isOnlineOpen]: checkIfUserOnline() })}>
                                        <div className={cn(styles.isOnline)}></div>
                                    </div>
                                    <Avatar title={getRoomName()} className={cn(styles.avatar)} object={ObjectOfUsers[getAnotherUser(room?.users, user.id)]} size={54} cover={true} edgeType='circle' />
                                </>
                        }
                    </div>
                    <div className={styles.roomName}>{getRoomName()}</div>
                </div>
                <div className={styles.lastMessageTime}>{getLastMessageTime()}</div>
            </div>
            <div className={styles.lastMessage}>
                <div className={styles.content}>{getLastMessage()}</div>
                <NotificationUnread color={theme} number={unreadMessagesAmount[room.id]} />
            </div>
        </div>
    )
})
Room.displayName = 'Room'