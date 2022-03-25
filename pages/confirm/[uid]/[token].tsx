import { useRouter } from 'next/router'
import React, { useContext, useEffect } from 'react'

import { Loading } from '../../../components'
import { GlobalContext } from '../../../context'
import { WithLayout } from '../../../layout/Layout'

const ConfirmPage = (): JSX.Element => {
    const { UserStore, showWarning } = useContext(GlobalContext)
    const { confirmEmail } = UserStore
    const router = useRouter()
    useEffect(() => {
        if (!router?.query?.uid || !router?.query?.token) return
        if (!confirmEmail({ uid: router?.query?.uid as string, token: router?.query?.token as string })) {
            showWarning({ type: 'danger', text: 'Не удалось подтвердить электронную почту', icon: 'exclamation' })
        }
        router.push('/login')
    })
    return (
        <Loading />
    )
}
export default WithLayout(ConfirmPage)