import { ForwardedRef, forwardRef } from 'react'
import cn from 'classnames'

import { WarningProps } from "./WarningProps"
import ExclamationIcon from './../../public/icons/warning.svg'
import MailIcon from './../../public/icons/mail.svg'
import OkIcon from './../../public/icons/ok.svg'

import styles from './Warning.module.scss'

export const Warning = forwardRef(({ className, type, text = '', icon, ...props }:
    WarningProps, ref: ForwardedRef<HTMLDivElement>): JSX.Element => {
    const getWarningClassNames = () => {
        return cn(
            styles.warning,
            {
                [styles.dangerWarning]: type === 'danger',
                [styles.successWarning]: type === 'success'
            })
    }
    return (
        <div className={cn(className, styles.wrapper)} ref={ref} {...props}>
            <div className={getWarningClassNames()}>
                <ExclamationIcon className={cn(styles.svg, { [styles.svgOpen]: icon === 'exclamation' })} />
                <MailIcon className={cn(styles.svg, { [styles.svgOpen]: icon === 'mail' })} />
                <OkIcon className={cn(styles.svg, { [styles.svgOpen]: icon === 'ok' })} />
                <div className={styles.text}>
                    {text}
                </div>
            </div>
        </div>
    )
})
Warning.displayName = 'Warning'