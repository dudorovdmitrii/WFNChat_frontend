import cn from 'classnames'

import { LoadingProps } from "./LoadingProps"

import styles from './Loading.module.scss'
import LoadingIcon from './../../public/svgAnimations/loading.svg'

export const Loading = ({ className, ...props }: LoadingProps): JSX.Element => {
    return (
        <div className={cn(className, styles.wrapper)} {...props}>
            <div className={styles.loading}>
                <span className={styles.span}><LoadingIcon /></span>
            </div>
        </div>
    )
}
Loading.displayName = 'Loading'