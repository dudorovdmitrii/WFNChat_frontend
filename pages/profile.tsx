import { useRouter } from "next/router"
import { useContext, useEffect } from "react"

import { Profile } from "../components"
import { GlobalContext } from "../context"
import { WithLayout } from "../layout/Layout"

const ProfilePage = (): JSX.Element => {
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
        <Profile />
    )
}
export default WithLayout(ProfilePage)