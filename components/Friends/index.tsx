import React, { useContext, useEffect, useRef, useState } from 'react'
import cn from 'classnames'
import { observer } from 'mobx-react-lite'

import { GlobalContext } from '../../context'
import { FriendsProps } from './FriendsProps'
import { SearchBar, UserCard } from '..'
import { PaginationNumber } from './FriendsSettings'

import ArrowIcon from './../../public/icons/arrowDown.svg'
import styles from './Friends.module.scss'

export const Friends = observer(({ className, ...props }: FriendsProps): JSX.Element => {
    const [filterChoice, setFilterChoice] = useState('поиск')
    const [choicesListOpen, setChoicesListOpen] = useState(false)
    const [startInterval, setStartInterval] = useState(0)
    const { UserStore, showWarning } = useContext(GlobalContext)
    const searchBarRef = useRef(null)
    const { user, getAllUsers, users, UsersFriends, UsersFriendRequests, UsersDesiredFriends,
        UsersBlockedUsers, filteredUsers, filterUsersArray, theme } = UserStore
    useEffect(() => {
        (async () => {
            const gotUsers = await getAllUsers()
            if (!gotUsers) {
                showWarning({ type: 'danger', text: 'Не удалось загрузить пользователей', icon: 'exclamation' })
                return <></>
            }
        })()
    }, [])
    if (!user?.friends) {
        return <></>
    }
    const toggleChoicesListOpen = (event: React.MouseEvent) => {
        event.preventDefault()
        setChoicesListOpen(choicesListOpen ? false : true)
    }
    const handleSetFilterChoice = (event: React.MouseEvent) => {
        const div: HTMLDivElement = event.target as HTMLDivElement
        setFilterChoice(div.dataset.filter_choice)
        filterUsersArray(
            {
                filter_word: searchBarRef?.current?.value,
                array: getSearchArray(div.dataset.filter_choice)
            })
    }
    const getSearchArray = (filter_choice: string) => {
        switch (filter_choice) {
            case 'друзья': {
                return UsersFriends
            }
            case 'заявки в друзья': {
                return UsersFriendRequests
            }
            case 'отправленные заявки': {
                return UsersDesiredFriends
            }
            case 'заблокированные': {
                return UsersBlockedUsers
            }
            case 'поиск': {
                return users
            }
        }
    }
    const getUserType = () => {
        switch (filterChoice) {
            case 'друзья': {
                return 'friend'
            }
            case 'заявки в друзья': {
                return 'friend_request'
            }
            case 'отправленные заявки': {
                return 'desired_friend'
            }
            case 'заблокированные': {
                return 'blocked_user'
            }
            case 'поиск': {
                return 'searched_user'
            }
        }
    }
    const getPagintaionArray = () => {
        const array = [0]
        for (let page = 1; page < Math.ceil((filteredUsers.length - 1) / PaginationNumber); page++) {
            array.push(page)
        }
        return array
    }
    const handleChangePage = (event: React.MouseEvent) => {
        const div: HTMLDivElement = event.target as HTMLDivElement
        setStartInterval(parseInt(div.dataset.page))
    }
    const getFilteredUsersList = () => {
        return filteredUsers.filter(filtered => filtered.id != user.id).slice(startInterval * PaginationNumber, startInterval * PaginationNumber + PaginationNumber)
    }
    return (
        <div className={cn(className, styles.friends, { [styles.friendsBlackTheme]: theme === 'black' })} {...props}>
            <div className={styles.actions}>
                <div className={styles.filter}>
                    <ArrowIcon className={cn(styles.arrow, { [styles.arrowIconOpen]: choicesListOpen })} onClick={toggleChoicesListOpen} />
                    <h1 className={styles.filterChoice} onClick={toggleChoicesListOpen}>
                        {filterChoice}
                    </h1>
                    <div className={cn(styles.choicesList, { [styles.choicesListOpen]: choicesListOpen })}>
                        <h2 className={cn(styles.choice, { [styles.chosen]: filterChoice === 'поиск' })} data-filter_choice={'поиск'} onClick={handleSetFilterChoice}>
                            глобальный поиск
                        </h2>
                        <h2 className={cn(styles.choice, { [styles.chosen]: filterChoice === 'друзья' })} data-filter_choice={'друзья'} onClick={handleSetFilterChoice}>
                            друзья
                        </h2>
                        <h2 className={cn(styles.choice, { [styles.chosen]: filterChoice === 'заявки в друзья' })} data-filter_choice={'заявки в друзья'} onClick={handleSetFilterChoice}>
                            заявки в друзья
                        </h2>
                        <h2 className={cn(styles.choice, { [styles.chosen]: filterChoice === 'отправленные заявки' })} data-filter_choice={'отправленные заявки'} onClick={handleSetFilterChoice}>
                            отправленные заявки
                        </h2>
                        <h2 className={cn(styles.choice, { [styles.chosen]: filterChoice === 'заблокированные' })} data-filter_choice={'заблокированные'} onClick={handleSetFilterChoice}>
                            заблокированные
                        </h2>
                    </div>
                </div>
                <SearchBar color={theme} className={styles.searchBar} type='users' array={getSearchArray(filterChoice)} ref={searchBarRef} />
            </div>
            <div className={styles.usersList}>
                {
                    getFilteredUsersList()
                        ?.map(filteredUser =>
                            filteredUser.id != user.id
                            &&
                            <UserCard color={theme} filterChoice={filterChoice} anotherUser={filteredUser} key={filteredUser.username}
                                user_type={getUserType()} className={styles.userCard} />)
                }
            </div>
            <div className={styles.paginationBar}>
                <div data-page={startInterval - 1} onClick={handleChangePage}
                    className={cn(
                        styles.leftEnd,
                        styles.page,
                        {
                            [styles.leftEndOpen]: startInterval > 0
                        })}
                >пред</div>
                {
                    getPagintaionArray().map(page =>
                        <div key={page} data-page={page} onClick={handleChangePage}
                            className={cn(
                                styles.page,
                                {
                                    [styles.pageOpen]: Math.abs(page - startInterval) < 2,
                                    [styles.pageSelected]: startInterval === page
                                })}>
                            {page + 1}
                        </div>)
                }
                <div data-page={startInterval + 1} onClick={handleChangePage}
                    className={cn(
                        styles.rightEnd,
                        styles.page,
                        {
                            [styles.rightEndOpen]: startInterval < Math.ceil(filteredUsers.length / PaginationNumber) - 1
                        })}
                >след</div>
            </div>
        </div>
    )
})
Friends.displayName = 'Friends'