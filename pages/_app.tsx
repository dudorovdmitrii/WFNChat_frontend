import React, { useState } from 'react'
import Head from 'next/head'
import 'normalize.css/normalize.css'
import dynamic from 'next/dynamic'

import '../styles/global.scss'
import '../styles/global.css'
import '../styles/reset.css'
import RoomStore from '../stores/RoomStore'
import UserStore from '../stores/UserStore'
import { GlobalContext } from '../context'
const Warning = dynamic<WarningProps>(() => import('./../components/Warning').then(mod => mod.Warning), { ssr: false })
import { WarningInterface } from '../globalTypes'
import { APIDomainHTTP, defaultTitle, ShowWarningDuration } from '../globalSettings'
import { WarningProps } from '../components/Warning/WarningProps'

const AppWrapper = ({ Component, pageProps }) => {
    const [type, setType] = useState(null)
    const [text, setText] = useState('Некорректный тип файла')
    const [icon, setIcon] = useState(null)
    const showWarning = ({ type, text, icon }: WarningInterface) => {
        setType(type)
        setText(text)
        setIcon(icon)
        const warning = document?.getElementById('warning')
        warning?.classList.add('warningOpen')
        setTimeout(() => warning?.classList.remove('warningOpen'), ShowWarningDuration)
    }
    const contextValue = {
        'UserStore': UserStore,
        'RoomStore': RoomStore,
        'showWarning': ({ type, text, icon }: WarningInterface) => showWarning({ type, text, icon })
    }
    return (
        <>
            <Head>
                <title>{defaultTitle}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no"></meta>
                <meta name="description" content="Онлайн чат для общения"></meta>
                <meta httpEquiv="Content-Type" content="text/html; charset=utf-8"></meta>
                <meta name="Keywords" content="Чат, чат, Chat, chat, Мессэнджер, мессэнджер, Messanger, messanger"></meta>
                <link rel="shortcut icon" href="/static/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/static/favicon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon.png" />
                <link rel="preconnect" href="https://fonts.googleapis.com/css2?family=Open+Sans+Condensed:ital,wght@0,300;0,700;1,300&family=Poppins:ital,wght@0,200;0,300;0,400;1,100;1,200;1,300;1,400&display=swap" />
                <link rel="preconnect" as="font" href={APIDomainHTTP} />
            </Head>
            <GlobalContext.Provider value={contextValue}>
                <Warning id='warning' className='warning' type={type} text={text} icon={icon} />
                <Component {...pageProps} />
            </GlobalContext.Provider>
        </>)
}
export default AppWrapper
