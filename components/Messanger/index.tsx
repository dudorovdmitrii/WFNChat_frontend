import { useCallback, useContext, useEffect, useState } from 'react'
import cn from 'classnames'
import { observer } from 'mobx-react-lite'
import dynamic from 'next/dynamic'

import { GlobalContext } from '../../context'
import { MessangerProps } from './MessangerProps'
import { ChatProps } from '../Chat/ChatProps'
import { ChatListProps } from '../ChatList/ChatListProps'
import { ChatActionsProps } from '../ChatActions/ChatActionsProps'
const ChatList = dynamic<ChatListProps>(() => import('./../ChatList').then(mod => mod.ChatList), { ssr: false })
const ChatActions = dynamic<ChatActionsProps>(() => import('./../ChatActions').then(mod => mod.ChatActions), { ssr: false })
const Chat = dynamic<ChatProps>(() => import('./../Chat').then(mod => mod.Chat), { ssr: false })

import styles from './Messanger.module.scss'


export const Messanger = observer(({ className, ...props }: MessangerProps): JSX.Element => {
    const [chatListOpen, setChatListOpen] = useState(true)
    const { RoomStore, UserStore } = useContext(GlobalContext)
    const { theme } = UserStore
    const { RoomsArray, currentRoom } = RoomStore
    const handleOpenChatList = useCallback(() => {
        if (screen.width >= 768) {
            return
        }
        setChatListOpen(true)
    }, [])
    useEffect(() => {
        if (currentRoom && screen.width < 768) {
            setChatListOpen(false)
        }
    }, [currentRoom])
    if (!RoomsArray) return <></>
    return (
        <div className={cn(className, styles.messanger, { [styles.messangerBlackTheme]: theme === 'black' })} {...props}>
            <div className={cn(styles.additionals, { [styles.additionalsOpen]: chatListOpen })}>
                <ChatActions className={cn(styles.chatActions, { [styles.chatActionsOpen]: chatListOpen })} />
                <ChatList className={cn(styles.chatList, { [styles.chatListOpen]: chatListOpen })} />
            </div>
            <Chat className={cn(styles.chat, { [styles.chatOpen]: !chatListOpen })} exit={handleOpenChatList} />
        </div>
    )
})
Messanger.displayName = 'Messanger'