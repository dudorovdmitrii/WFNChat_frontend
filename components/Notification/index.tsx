import { useContext } from 'react'
import cn from 'classnames'
import { observer } from 'mobx-react-lite'

import { NotificationProps } from './NotificationProps'
import { GlobalContext } from '../../context'
import FriendRequestIcon from './../../public/icons/friend_request.svg'
import FriendAcceptionIcon from './../../public/icons/friend_acception.svg'

import styles from './Notification.module.scss'

export const Notification = observer(({ className, user_id, type, color, ...props }: NotificationProps): JSX.Element => {
    const { UserStore } = useContext(GlobalContext)
    const { ObjectOfUsers } = UserStore
    return (
        <div className={cn(className, styles.notification, { [styles.notificationBlackTheme]: color === 'black' })} {...props} >
            {
                type === 'friend_request'
                    ?
                    <>
                        <FriendRequestIcon className={styles.svg} />
                        <h1 className={styles.text}>
                            {ObjectOfUsers[user_id]?.first_name} {ObjectOfUsers[user_id]?.last_name} - хочет добавить вас в друзья
                        </h1>
                    </>
                    :
                    type === 'friend_acception'
                        ?
                        <>
                            <FriendAcceptionIcon className={styles.svgFriendAcception} />
                            <h1 className={styles.text}>
                                {ObjectOfUsers[user_id]?.first_name} {ObjectOfUsers[user_id]?.last_name} - заявка в друзья принята
                            </h1>
                        </>
                        :
                        <></>
            }
        </div>
    )
})
Notification.displayName = 'Notification'