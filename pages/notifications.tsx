import { useRouter } from "next/router"
import { useContext, useEffect } from "react"

import { NotificationList } from "../components"
import { GlobalContext } from "../context"
import { WithLayout } from "../layout/Layout"

const NotificationsPage = (): JSX.Element => {
    const router = useRouter()
    const { UserStore } = useContext(GlobalContext)
    const { user, tryRelogin } = UserStore
    useEffect(() => {
        if (!user) {
            (async () => {
                const loggedIn = await tryRelogin()
                if (!loggedIn) router.push('/')
            })()
        }
    }, [])
    return (
        <NotificationList />
    )
}
export default WithLayout(NotificationsPage)