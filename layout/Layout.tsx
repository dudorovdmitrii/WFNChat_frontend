import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import cn from 'classnames'
import { Sidebar } from './Sidebar'
import { LayoutProps } from './LayoutProps'
import styles from './Layout.module.scss'
import { GlobalContext } from '../context'

const Layout = observer(({ children }: LayoutProps): JSX.Element => {
    const { UserStore } = useContext(GlobalContext)
    const { user, theme } = UserStore
    return (
        <div className={cn(styles.layout, { [styles.unauthorized]: !user })}>
            <div className={cn(styles.main, { [styles.mainBlackTheme]: theme == 'black' })}>
                {children}
            </div>
            <Sidebar className={cn(styles.sidebar, { [styles.open]: user })} />
        </div>
    )
})

export const WithLayout = <T extends Record<string, unknown>>(Component: React.ComponentType<T>) => {
    return function InsideWithLayout(props: T): JSX.Element {
        return (
            <Layout>
                <Component {...props} />
            </Layout>
        )
    }
}
