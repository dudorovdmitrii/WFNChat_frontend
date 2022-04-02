import { memo, useContext, useRef } from 'react'
import cn from 'classnames'
import { areEqual } from "react-window";

import { MessageProps } from './MessageProps'
import { GlobalContext } from '../../context'
import { convertFromSpecialSymbols, getTimeCreated } from '../../helpers'
import { Avatar } from '..'

import styles from './Message.module.scss'
import { useEffect } from 'react'

export const Message = memo(({ message, className, index, style, setHeights, ...props }: MessageProps): JSX.Element => {
    const messageRef = useRef<HTMLDivElement>(null)
    const { UserStore } = useContext(GlobalContext)
    const { user, theme, ObjectOfUsers } = UserStore
    const inlineStyles = {
        message:
        {
            ...style,
            top: `${parseFloat(style.top as string) + 15}px`,
            paddingBottom: '15px'
        }
    }
    const getMessageClassNames = () => {
        return cn(
            className,
            styles.message, {
            [styles.messageBlackTheme]: theme === 'black',
            [styles.myMessage]: message.author === user.id,
            [styles.myMessageBlackTheme]: message.author === user.id && theme === 'black',
            [styles.notMyMessage]: message.author != user.id,
            [styles.notMyMessageBlackTheme]: message.author != user.id && theme === 'black'
        })
    }
    useEffect(() => {
        if (!messageRef?.current) return
        setHeights(index, messageRef.current.clientHeight)
    }, [messageRef])
    if (message.text) {
        return (
            <div className={getMessageClassNames()} {...props} ref={messageRef} style={inlineStyles.message}>
                <div className={styles.avatar}>
                    <Avatar object={ObjectOfUsers[message.author]} cover={true} size={36} edgeType='circle' />
                </div>
                <div className={cn(styles.content, styles.text)}>
                    {convertFromSpecialSymbols(message.text)}
                </div>
                <div className={styles.timeCreated}>{getTimeCreated(message)}</div>
            </div>)
    }
    if (message.photo) {
        console.log(message.photo)
        return (
            <div className={getMessageClassNames()} {...props} ref={messageRef} style={inlineStyles.message}>
                <div className={styles.avatar}>
                    <Avatar object={ObjectOfUsers[message.author]} cover={true} size={36} edgeType='circle' />
                </div>
                <div className={cn(styles.content, styles.photo)}>
                    <img src={message.photo} height="500" width="300" alt={''} />
                </div>
                <div className={styles.timeCreated}>{getTimeCreated(message)}</div>
            </div>)
    }
    if (message.video) {
        return (
            <div className={getMessageClassNames()} {...props} ref={messageRef} style={inlineStyles.message}>
                <div className={styles.avatar}>
                    <Avatar object={ObjectOfUsers[message.author]} cover={true} size={36} edgeType='circle' />
                </div>
                <div className={cn(styles.content, styles.video)}>
                    <video controls src={message.video} height={300}>
                        <source src={message.video} type="video/mp4" />
                        Ваш браузер не поддерживает html 5 видео
                    </video>
                </div>
                <div className={styles.timeCreated}>{getTimeCreated(message)}</div>
            </div>)

    }
    return <></>
}, areEqual)
Message.displayName = 'Message'