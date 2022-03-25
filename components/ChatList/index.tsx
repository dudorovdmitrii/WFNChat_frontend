import { useContext } from 'react'
import cn from 'classnames'
import { observer } from 'mobx-react-lite'

import { Room } from '..'
import { GlobalContext } from '../../context'
import { ChatListProps } from './ChatListProps'

import styles from './ChatList.module.scss'

export const ChatList = observer(({ className, ...props }: ChatListProps): JSX.Element => {
    const { RoomStore, UserStore } = useContext(GlobalContext)
    const { theme } = UserStore
    const { filteredRoomsArray } = RoomStore
    if (!filteredRoomsArray) return <></>
    return (
        <div className={cn(className, styles.chatList, { [styles.chatListBlackTheme]: theme == 'black' })} {...props}>
            {
                filteredRoomsArray.map(room => <Room key={room?.id} room={room} />)
            }
        </div>
    )
})
ChatList.displayName = 'ChatList'