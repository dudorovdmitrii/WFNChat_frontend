import { useContext, useEffect } from 'react'
import cn from 'classnames'
import { useRouter } from 'next/router'
import { observer } from 'mobx-react-lite'

import { GlobalContext } from '../../context'
import { NotificationListProps } from './NotificationListProps'
import { Notification } from '..'

import styles from './NotificationList.module.scss'
import { AuthorizationErrorMessage } from '../../globalSettings'


export const NotificationList = observer(({ className, ...props }: NotificationListProps): JSX.Element => {
    const router = useRouter()
    const { UserStore, showWarning } = useContext(GlobalContext)
    const { theme, notifications, updateUserDataInDB, updateNotifications, user, checkJWT } = UserStore
    useEffect(() => {
        const username = user?.username
        const clearNotifications = async () => {
            if (!notifications) return
            if (!await checkJWT()) {
                showWarning({ type: 'danger', text: AuthorizationErrorMessage, icon: 'exclamation' })
                return
            }
            updateNotifications({ ...notifications, friend_acceptions: [], friend_requests: [] })
            const updated = await updateUserDataInDB(username, {
                notifications: JSON.stringify(
                    {
                        ...notifications,
                        friend_requests: [],
                        friend_acceptions: []
                    })
            })
            if (!updated) {
                showWarning({ type: 'danger', text: 'Не удалось обновить уведомления', icon: 'exclamation' })
            }
        }
        router.events.on('routeChangeStart', clearNotifications)
        return () => {
            router.events.off('routeChangeStart', clearNotifications)
        }
    }, [])
    if (!notifications) return <></>
    return (
        <div className={cn(className, styles.notificationList, { [styles.notificationList_black_theme]: theme === 'black' })} {...props}>
            {
                notifications?.friend_requests.map(user_id => <Notification type='friend_request' color={theme} user_id={user_id} key={user_id} />)
            }
            {
                notifications?.friend_acceptions.map(user_id => <Notification type='friend_acception' color={theme} user_id={user_id} key={user_id} />)
            }
        </div>
    )
})
NotificationList.displayName = 'NotificationList'