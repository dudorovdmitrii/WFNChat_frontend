import React, { useContext } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { observer } from 'mobx-react-lite'
import cn from 'classnames'

import { GlobalContext } from '../../context'
import { Avatar, NotificationUnread } from '../../components'
import { SidebarProps } from './SidebarProps'

import FriendsIcon from './../../public/icons/friends.svg'
import ChatIcon from './../../public/icons/chat.svg'
import SettingsIcon from './../../public/icons/settings.svg'
import NotificationsIcon from './../../public/icons/notification.svg'
import LogoutIcon from './../../public/icons/logout.svg'
import styles from './Sidebar.module.scss'


export const Sidebar = observer(({ className, ...props }: SidebarProps): JSX.Element => {
    const router = useRouter()
    const { UserStore, RoomStore, showWarning } = useContext(GlobalContext)
    const { logout, user, theme, notifications, fullName } = UserStore
    const { unreadMessagesAmount } = RoomStore
    const handleLogout = async () => {
        const loggedOut = await logout()
        if (!loggedOut) {
            showWarning({ type: 'danger', text: 'Что-то пошло не так', icon: 'exclamation' })
        }
        router.push('/')
    }
    const handleGoProfile = async () => {
        router.push('/profile')
    }
    const getUnreadChatsAmount = () => {
        if (!unreadMessagesAmount) return
        let amount = 0
        for (const key in unreadMessagesAmount) {
            amount += unreadMessagesAmount[key] > 0 ? 1 : 0
        }
        return amount
    }
    const getUnreadNotifications = () => {
        return notifications?.friend_acceptions.length + notifications?.friend_requests.length
    }
    if (!user) return <></>
    return (
        <div className={cn(className, styles.sidebar, { [styles.sidebarBlackTheme]: theme === 'black' })} {...props}>
            <div className={styles.user}>
                <Avatar onClick={handleGoProfile} title={fullName} className={styles.avatar} object={user} size={86} cursor='pointer' cover={true} edgeType='circle' />
                <div className={styles.name} onClick={handleGoProfile}>
                    <span>{user.first_name}</span>
                    <span>&nbsp;{user.last_name}</span>
                </div>
            </div>
            <div className={styles.actions}>
                <nav className={styles.nav}>
                    <div className={cn(styles.buttonWrapper, { [styles.active]: router.pathname === '/friends' })}>
                        <Link href='/friends'>
                            <div className={styles.button}>
                                <FriendsIcon className={styles.svg} />
                                <span className={styles.link}>
                                    ДРУЗЬЯ
                                </span>
                            </div>
                        </Link>
                    </div>
                    <div className={cn(styles.buttonWrapper, { [styles.active]: router.pathname === '/' })}>
                        <Link href='/'>
                            <div className={styles.button}>
                                <ChatIcon className={styles.svg} />
                                <span className={styles.link}>
                                    ЧАТЫ
                                </span>
                                <div className={styles.unreadWrapper}>
                                    <NotificationUnread className={styles.unread} color={theme} number={getUnreadChatsAmount()} />
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className={cn(styles.buttonWrapper, { [styles.active]: router.pathname === '/notifications' })}>
                        <Link href='/notifications'>
                            <div className={styles.button}>
                                <NotificationsIcon className={styles.svg} />
                                <span className={styles.link}>
                                    УВЕДОМЛЕНИЯ
                                </span>
                                <NotificationUnread className={styles.unread} color={theme}
                                    number={router.pathname === '/notifications' ? 0 : getUnreadNotifications()} />
                            </div>
                        </Link>
                    </div>
                    <div className={cn(styles.buttonWrapper, { [styles.active]: router.pathname === '/settings' })}>
                        <Link href='/settings'>
                            <div className={styles.button}>
                                <SettingsIcon className={styles.svg} />
                                <span className={styles.link}>
                                    НАСТРОЙКИ
                                </span>
                            </div>
                        </Link>
                    </div>
                </nav>
                <div className={cn(styles.buttonWrapper, styles.logoutButton)}>
                    <div className={cn(styles.button)} onClick={handleLogout}>
                        <LogoutIcon className={styles.svg} />
                        <span className={styles.link}>
                            ВЫЙТИ
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
})
Sidebar.displayName = 'Sidebar'