import { useContext } from 'react'
import cn from 'classnames'

import { SettingsProps } from './SettingsProps'
import { observer } from 'mobx-react-lite'
import { GlobalContext } from '../../context'

import styles from './Settings.module.scss'

export const Settings = observer(({ className, ...props }: SettingsProps): JSX.Element => {
    const { UserStore } = useContext(GlobalContext)
    const { theme, changeTheme } = UserStore
    const handleChangeTheme = (event: React.MouseEvent) => {
        const input: HTMLInputElement = event.target as HTMLInputElement
        if (input.checked) {
            changeTheme('black')
            localStorage.setItem('black-theme', 'on')
        }
        else {
            changeTheme('white')
            localStorage.removeItem('black-theme')
        }
    }
    return (
        <div className={cn(className, styles.settings, { [styles.settingsBlackTheme]: theme === 'black' })} {...props}>
            <div className={styles.setting}>
                <h1 className={styles.settingText}>Темная тема</h1>
                <input type='checkbox' className={styles.input} onClick={handleChangeTheme} defaultChecked={theme === 'black'} />
            </div>
        </div>
    )
})
Settings.displayName = 'Settings'