import Link from 'next/link'
import cn from 'classnames'

import { AnonymousProps } from './AnonymousProps'

import styles from './Anonymous.module.scss'

export const Anonymous = ({ className, ...props }: AnonymousProps): JSX.Element => {
    return (
        <div className={cn(className, styles.wrapper)} {...props}>
            <div>
                WFNChat - это мессенджер
            </div>
            <div className={styles.anonymous}>
                <Link href={'/login'}>
                    <span className={styles.link}>
                        Войдите
                    </span>
                </Link>
                <span>&nbsp;или&nbsp;</span>
                <Link href={'/register'}>
                    <span className={styles.link}>
                        зарегистрируйтесь,
                    </span>

                </Link>
                <div className={styles.textCentered}>
                    &nbsp;чтобы начать пользоваться приложением
                </div>
            </div>
        </div>
    )
}
Anonymous.displayName = 'Anonymous'