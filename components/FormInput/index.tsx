import { ForwardedRef, forwardRef } from 'react'
import cn from 'classnames'

import { FormInputProps } from './FormInputProps'

import styles from './FormInput.module.scss'

export const FormInput = forwardRef(({ className, color, incorrect, ...props }: FormInputProps,
    ref: ForwardedRef<HTMLInputElement>): JSX.Element => {
    const getInputClassNames = () => {
        return cn(
            className,
            styles.input,
            {
                [styles.inputBlackTheme]: color === 'black',
                [styles.incorrect]: incorrect
            })
    }
    return (
        <input className={getInputClassNames()} {...props} ref={ref} />
    )
})
FormInput.displayName = 'FormInput'