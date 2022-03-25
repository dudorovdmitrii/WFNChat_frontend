import cn from 'classnames'

import { NotificationUnreadProps } from './NotificationUnreadProps'

import styles from './NotificationUnread.module.scss'

export const NotificationUnread = ({ className, number, color, ...props }: NotificationUnreadProps): JSX.Element => {
    const getClassNames = () => {
        return cn(
            className,
            styles.unread,
            {
                [styles.unreadOpen]: number > 0,
                [styles.unreadBlackTheme]: color === 'black'
            })
    }
    return (
        <div className={getClassNames()} {...props} >
            {number || 0}
        </div>
    )
}
NotificationUnread.displayName = 'NotificationUnread'