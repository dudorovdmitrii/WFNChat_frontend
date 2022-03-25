import { useRouter } from "next/router"
import { useContext, useEffect } from "react"

import { Friends } from "../components"
import { GlobalContext } from "../context"
import { WithLayout } from "../layout/Layout"

const FriendsPage = (): JSX.Element => {
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
        <Friends />
    )
}
export default WithLayout(FriendsPage)