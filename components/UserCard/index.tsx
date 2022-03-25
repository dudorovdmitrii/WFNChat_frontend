import { useContext } from 'react'
import cn from 'classnames'
import { observer } from 'mobx-react-lite'

import { Avatar } from '..'
import { GlobalContext } from '../../context'
import { actionTypes, UserCardProps } from './UserCardProps'
import { NotificationsInterface } from '../../globalTypes'

import AddFriendIcon from './../../public/icons/addFriend.svg'
import CancelIcon from './../../public/icons/cancel.svg'
import BlockUserIcon from './../../public/icons/blockUser.svg'
import UnblockUserIcon from './../../public/icons/unblockUser.svg'
import styles from './UserCard.module.scss'
import { getFullName } from '../../helpers'

export const UserCard = observer(({ user_type, anotherUser, color, filterChoice, className, ...props }: UserCardProps): JSX.Element => {
    const { UserStore, showWarning } = useContext(GlobalContext)
    const { updateUserDataInDB, updateFilteredUsers, user, updateUserDataInStore } = UserStore
    const handleAction = async (event: React.MouseEvent) => {
        const icon: SVGElement = event.target as SVGElement
        const UserNofts: NotificationsInterface = JSON.parse(user.notifications)
        const AnotherUserNofts: NotificationsInterface = JSON.parse(anotherUser.notifications)
        const removeIdsFromArray = (array: number[], removed: number[]) => {
            return array.filter(id => !removed.includes(id))
        }
        switch (icon.dataset.action) {
            case 'add': {
                if (getUserType() === 'friend_request') {
                    AnotherUserNofts.friend_acceptions.push(user.id)

                    const updated = await Promise.all(
                        [
                            updateUserDataInDB(user.username,
                                {
                                    'friends': [...user.friends, anotherUser.id],
                                    'friend_requests': removeIdsFromArray(user.friend_requests, [anotherUser.id])
                                }),
                            updateUserDataInDB(anotherUser.username,
                                {
                                    'notifications': JSON.stringify(AnotherUserNofts),
                                    'friends': [...anotherUser.friends, user.id],
                                    'desired_friends': removeIdsFromArray(anotherUser.desired_friends, [user.id])
                                })
                        ])

                    if (!updated) {
                        showWarning({ type: 'danger', text: 'Не удалось добавить в друзья', icon: 'exclamation' })
                        return
                    }

                    updateUserDataInStore(user.id,
                        {
                            'friend_requests': removeIdsFromArray(user.friend_requests, [anotherUser.id])
                        })
                }
                else if (getUserType() === 'searched_user') {
                    AnotherUserNofts.friend_requests.push(user.id)

                    const updatedUser = await Promise.all(
                        [
                            updateUserDataInDB(anotherUser.username,
                                {
                                    'notifications': JSON.stringify(AnotherUserNofts),
                                    'friend_requests': [...anotherUser.friend_requests, user.id]
                                }),
                            updateUserDataInDB(user.username,
                                { 'desired_friends': [...user.desired_friends, anotherUser.id] })
                        ])

                    if (!updatedUser) {
                        showWarning({ type: 'danger', text: 'Не удалось добавить в друзья', icon: 'exclamation' })
                        return
                    }
                }
                updateFilteredUsers(filterChoice)
                break
            }
            case 'cancel': {
                if (getUserType() === 'desired_friend') {
                    AnotherUserNofts.friend_requests = removeIdsFromArray(AnotherUserNofts.friend_requests, [user.id])
                    AnotherUserNofts.friend_deletions.push(user.id)

                    const updated = await Promise.all(
                        [
                            updateUserDataInDB(user.username,
                                { 'desired_friends': removeIdsFromArray(user.friends, [anotherUser.id]) }),
                            updateUserDataInDB(anotherUser.username,
                                {
                                    'friend_requests': removeIdsFromArray(anotherUser.friends, [user.id]),
                                    'notifications': JSON.stringify(AnotherUserNofts)
                                })
                        ])

                    if (!updated) {
                        showWarning({ type: 'danger', text: 'Не удалось удалить из подписок', icon: 'exclamation' })
                        return
                    }
                }
                else if (getUserType() === 'friend') {
                    UserNofts.friend_acceptions = removeIdsFromArray(UserNofts.friend_acceptions, [anotherUser.id])
                    UserNofts.friend_requests = removeIdsFromArray(UserNofts.friend_requests, [anotherUser.id])

                    AnotherUserNofts.friend_deletions.push(user.id)
                    AnotherUserNofts.friend_acceptions = removeIdsFromArray(UserNofts.friend_acceptions, [user.id])
                    AnotherUserNofts.friend_requests = removeIdsFromArray(UserNofts.friend_requests, [user.id])

                    const updated = await Promise.all(
                        [updateUserDataInDB(user.username,
                            {
                                'friends': removeIdsFromArray(user.friends, [anotherUser.id]),
                                'notifications': JSON.stringify(UserNofts)
                            }),
                        updateUserDataInDB(anotherUser.username,
                            {
                                'friends': removeIdsFromArray(anotherUser.friends, [user.id]),
                                'notifications': JSON.stringify(AnotherUserNofts)
                            })
                        ])

                    if (!updated) {
                        showWarning({ type: 'danger', text: 'Не удалось удалить из друзей', icon: 'exclamation' })
                        return
                    }

                    updateUserDataInStore(user.id, {
                        friend_requests: removeIdsFromArray(user.friend_requests, [anotherUser.id]),
                        desired_friends: removeIdsFromArray(user.desired_friends, [anotherUser.id]),
                    })

                }
                updateFilteredUsers(filterChoice)
                break
            }
            case 'block': {
                if (anotherUser.friends.includes(user.id)) {
                    AnotherUserNofts.friend_deletions.push(user.id)
                    AnotherUserNofts.friend_acceptions = removeIdsFromArray(UserNofts.friend_acceptions, [user.id])
                    AnotherUserNofts.friend_requests = removeIdsFromArray(UserNofts.friend_requests, [user.id])
                    AnotherUserNofts.blocked_by = removeIdsFromArray(UserNofts.blocked_by, [user.id])

                    UserNofts.friend_acceptions = removeIdsFromArray(UserNofts.friend_acceptions, [user.id])
                    UserNofts.friend_requests = removeIdsFromArray(UserNofts.friend_requests, [user.id])

                    const updated = await Promise.all(
                        [
                            updateUserDataInDB(anotherUser.username,
                                {
                                    'friends': removeIdsFromArray(anotherUser.friends, [user.id]),
                                    'notifications': JSON.stringify(AnotherUserNofts)
                                }),
                            updateUserDataInDB(user.username,
                                {
                                    'friends': removeIdsFromArray(anotherUser.friends, [anotherUser.id]),
                                    'blocked_users': [...user.blocked_users, anotherUser.id],
                                    'notifications': JSON.stringify(UserNofts)
                                })

                        ])

                    if (!updated) {
                        showWarning({ type: 'danger', text: 'Не удалось заблокировать пользователя', icon: 'exclamation' })
                        return
                    }
                }
                else if (user.friend_requests.includes(anotherUser.id)) {
                    UserNofts.friend_requests = removeIdsFromArray(UserNofts.friend_requests, [anotherUser.id])
                    UserNofts.friend_deletions = removeIdsFromArray(UserNofts.friend_deletions, [anotherUser.id])

                    AnotherUserNofts.blocked_by = removeIdsFromArray(UserNofts.blocked_by, [user.id])
                    AnotherUserNofts.friend_deletions.push(user.id)

                    const updated = await Promise.all(
                        [
                            updateUserDataInDB(user.username,
                                {
                                    'blocked_users': [...user.blocked_users, anotherUser.id],
                                    'friend_requests': removeIdsFromArray(user.friend_requests, [anotherUser.id]),
                                    'notifications': JSON.stringify(UserNofts)
                                }),
                            updateUserDataInDB(anotherUser.username,
                                {
                                    'notifications': JSON.stringify(AnotherUserNofts),
                                    'desired_friends': removeIdsFromArray(anotherUser.desired_friends, [user.id]),
                                })
                        ])

                    if (!updated) {
                        showWarning({ type: 'danger', text: 'Не удалось заблокировать пользователя', icon: 'exclamation' })
                        return
                    }
                }
                else {
                    AnotherUserNofts.blocked_by.push(user.id)

                    const updated = await Promise.all(
                        [updateUserDataInDB(user.username,
                            { 'blocked_users': [...user.blocked_users, anotherUser.id] }),
                        updateUserDataInDB(anotherUser.username,
                            {
                                'notifications': JSON.stringify(AnotherUserNofts)
                            })
                        ])

                    if (!updated) {
                        showWarning({ type: 'danger', text: 'Не удалось заблокировать пользователя', icon: 'exclamation' })
                        return
                    }
                }

                updateFilteredUsers(filterChoice)
                break
            }
            case 'unblock': {
                const updatedUser = await updateUserDataInDB(user.username,
                    { 'blocked_users': removeIdsFromArray(user.blocked_users, [anotherUser.id]) })

                if (!updatedUser) {
                    showWarning({ type: 'danger', text: 'Не удалось разблокировать пользователя', icon: 'exclamation' })
                    return
                }

                updateFilteredUsers(filterChoice)
                break
            }
            default: {
                return
            }
        }
    }
    const getStatus = () => {
        if (user_type != 'searched_user') return ''
        if (user.friends.includes(anotherUser.id)) {
            return 'в друзьях'
        }
        if (user.friend_requests.includes(anotherUser.id)) {
            return 'в заявках'
        }
        if (user.desired_friends.includes(anotherUser.id)) {
            return 'заявка отправлена'
        }
        if (user.blocked_users.includes(anotherUser.id)) {
            return 'заблокирован'
        }
        if (anotherUser.blocked_users.includes(user.id)) {
            return 'доступ ограничен'
        }
        return ''
    }
    const getUserType = () => {
        if (user_type != 'searched_user') return user_type
        switch (getStatus()) {
            case 'в друзьях': {
                return 'friend'
            }
            case 'в заявках': {
                return 'friend_request'
            }
            case 'заявка отправлена': {
                return 'desired_friend'
            }
            case 'заблокирован': {
                return 'blocked_user'
            }
            default: {
                if (anotherUser.blocked_users.includes(user.id)) return 'unreachable'
                return 'searched_user'
            }
        }
    }
    return (
        <div className={cn(className, styles.userCard, { [styles.userCardBlackTheme]: color === 'black' })} {...props}>
            <div className={styles.photoWrapper}>
                <Avatar title={getFullName(anotherUser)} object={anotherUser} className={styles.photo} edgeType='circle' size={90} cover={true} />
            </div>
            <div className={styles.main}>
                <div className={styles.name}>
                    <div>{anotherUser.first_name} {anotherUser.last_name}</div>
                    <div className={styles.statusWord}>
                        {
                            getStatus()
                        }
                    </div>
                </div>
                <div className={styles.actions}>
                    <AddFriendIcon onClick={handleAction} data-action='add' className={cn(styles.svg, { [styles.open]: actionTypes['add'].includes(getUserType()) })} />
                    <CancelIcon onClick={handleAction} data-action='cancel' className={cn(styles.svg, { [styles.open]: actionTypes['cancel'].includes(getUserType()) })} />
                    <BlockUserIcon onClick={handleAction} data-action='block' className={cn(styles.svg, { [styles.open]: actionTypes['block'].includes(getUserType()) })} />
                    <UnblockUserIcon onClick={handleAction} data-action='unblock' className={cn(styles.svg, { [styles.open]: actionTypes['unblock'].includes(getUserType()) })} />
                </div>
            </div>
        </div>
    )
})
UserCard.displayName = 'UserCard'