import { ForwardedRef, forwardRef, SyntheticEvent, useContext } from 'react'
import cn from 'classnames'

import { SearchBarProps } from './SearchBarProps'
import { GlobalContext } from '../../context'

import styles from './SearchBar.module.scss'

export const SearchBar = forwardRef(({ className, type, array, color, children, placeholder, ...props }: SearchBarProps,
    ref: ForwardedRef<HTMLInputElement>): JSX.Element => {
    const { RoomStore, UserStore } = useContext(GlobalContext)
    const { filterRoomsArray } = RoomStore
    const { filterUsersArray, user } = UserStore
    const handleInput = (event: SyntheticEvent) => {
        const input: HTMLInputElement = event.target as HTMLInputElement
        if (type === 'rooms') {
            filterRoomsArray({ filter_word: input.value, user_id: user.id })
        }
        if (type === 'users') {
            filterUsersArray({ filter_word: input.value, array: array })
        }
    }
    return (
        <div className={cn(className, styles.searchBar, { [styles.searchBarBlackTheme]: color === 'black' })} {...props}>
            {children}
            <input placeholder={placeholder ? placeholder : 'Поиск'} className={cn(styles.input)} onChange={handleInput} ref={ref} />
        </div>
    )
})
SearchBar.displayName = 'SearchBar'