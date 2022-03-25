import cn from 'classnames'

import { ModalWindowProps } from "./ModalWindowProps"

import styles from './ModalWindow.module.scss'

export const ModalWindow = ({ className, children, theme, ...props }: ModalWindowProps): JSX.Element => {

    return (
        <div className={cn(className, styles.wrapper)}>
            <div className={cn(styles.modal, { [styles.modal_black_theme]: theme === 'black' })} {...props}>
                {children}
            </div>
            <div className={cn(className, styles.shadow)}></div>
        </div>
    )
}
ModalWindow.displayName = 'ModalWindow'