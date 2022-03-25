import { observer } from 'mobx-react-lite'
import dynamic from 'next/dynamic'
import { useContext, useEffect } from 'react'

import { GlobalContext } from '../context'
import { WithLayout } from '../layout/Layout'
import { Anonymous } from '../components'
import { MessangerProps } from '../components/Messanger/MessangerProps'
const Messanger = dynamic<MessangerProps>(() => import('./../components/Messanger').then(mod => mod.Messanger))


const App = observer((): JSX.Element => {
    const { UserStore } = useContext(GlobalContext)
    const { user, tryRelogin } = UserStore
    useEffect(() => {
        if (!user) {
            (async () => {
                await tryRelogin()
            })()
        }
    }, [])
    if (!user) return <Anonymous />
    return <Messanger />
})
export default WithLayout(App)