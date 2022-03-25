import { ForwardedRef, forwardRef } from 'react'
import cn from 'classnames'

import { FormProps } from './FormProps'

import styles from './Form.module.scss'

export const Form = forwardRef(({ className, children, color, ...props }: FormProps,
    ref: ForwardedRef<HTMLFormElement>): JSX.Element => {
    return (
        <form ref={ref} className={cn(className, styles.form, { [styles.formBlackTheme]: color === 'black' })} {...props}>
            {children}
        </form>
    )
})
Form.displayName = 'Form'