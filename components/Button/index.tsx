import cn from 'classnames'

import { ButtonProps } from './ButtonProps'

import styles from './Button.module.scss'

export const Button = ({ className, children, color, size, animations, ...props }: ButtonProps): JSX.Element => {
    return (
        <button className={cn(
            className,
            styles.button, {
            [styles.buttonBlackTheme]: color === 'black',
            [styles.size280]: size === 280,
            [styles.size240]: size === 240,
            [styles.size125]: size === 125,
            [styles.baseAnimated]: animations?.includes('base'),
            [styles.baseAnimatedBlackTheme]: animations?.includes('base') && color === 'black',
            [styles.successAnimated]: animations?.includes('success'),
            [styles.failureAnimated]: animations?.includes('danger')
        })} {...props}>
            {children}
        </button>
    )
}
Button.displayName = 'Button'