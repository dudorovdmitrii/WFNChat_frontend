import { SyntheticEvent, useCallback, useContext, useEffect, useRef, useState } from 'react'
import cn from 'classnames'
import { observer } from 'mobx-react-lite'
import dynamic from 'next/dynamic'
import { VariableSizeList as List } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"

import { ChatProps } from './ChatProps'
import { GlobalContext } from '../../context'
import { Avatar, Button, Form, FormInput, Message } from '..'
import { ModalWindowProps } from '../ModalWindow/ModalWindowProps'
const ModalWindow = dynamic<ModalWindowProps>(() => import('./../ModalWindow').then(mod => mod.ModalWindow), { ssr: false })

import { WS } from '../../WebSocket'
import { WebSocketChatURL } from '../../WebSocket/WebSocketSettings'
import { createBase64, fileExtentionCorrect, getAnotherUser, getCookie, getFullName, handleUsersSearch, makeTimeCreated, nameChanged, convertToSpecialSymbols } from '../../helpers'
import { MessageInterface, messageTypeOptions } from '../../globalTypes'
import { AuthorizationErrorMessage, IncorrectFileErrorMessage } from '../../globalSettings'
import { defaultMessageHeight, overscanCount } from './ChatSettings'

import SendIcon from './../../public/icons/send.svg'
import AddIcon from './../../public/icons/add.svg'
import MoreIcon from './../../public/icons/more.svg'
import ExitIcon from './../../public/icons/exitArrow.svg'
import LoadingIcon from './../../public/svgAnimations/loading.svg'
import styles from './Chat.module.scss'


export const Chat = observer(({ className, exit, ...props }: ChatProps): JSX.Element => {
    const [modalOpen, setModalOpen] = useState(false)
    const [fileName, setFileName] = useState('не выбрано')
    const [moreTabOpen, setMoreTabOpen] = useState(false)
    const [sendingStartTime, setSendingStartTime] = useState(0) // Хранит время отправки сообщения для показа индикатора загрузки
    const [closed, setClosed] = useState(false) // Отвечает за скрытие-открытие сообщений
    const [needScrollDown, setNeedScrollDown] = useState(false) // Отвечает за скролл в самый низ
    const [canScrollWDown, setCanScrollWDown] = useState(true) // Отвечает за скролл при каждом новом сообщении
    const [addedFileName, setAddedFileName] = useState('')

    const addRef = useRef<HTMLInputElement>(null)
    const moreTabRef = useRef<HTMLDivElement>(null)
    const typeInputRef = useRef<HTMLInputElement>(null)
    const messagesRef = useRef<HTMLDivElement>(null)
    const hiddenInputRef = useRef<HTMLInputElement>(null)
    const chatNameRef = useRef<HTMLInputElement>(null)
    const formRef = useRef<HTMLFormElement>(null)
    const heights = useRef<Record<string, unknown>>(null) // Динамические высоты сообщений визуализированного списка
    const outerRef = useRef<HTMLDivElement>(null) // Внешний ref визуализированного списка
    const ws = useRef<WS>(null)

    const { RoomStore, UserStore, showWarning } = useContext(GlobalContext)
    const { user, checkJWT, ObjectOfUsers, UsersFriends, theme, updateUserDataInDB, updateServiceWS } = UserStore
    const { currentRoom, filterRoomsArray, addMessageToRoom, updateRoom, changeCurrentRoom,
        getMoreMessages } = RoomStore
    const [filteredFriends, setFilteredFriends] = useState(UsersFriends)

    const inlineStyles = {
        messagesContainer:
        {
            height: '100%',
            width: '100%'
        },
        autoSizerWrapperJunior:
        {
            display: 'flex',
            flexGrow: 1,
            height: "100%",
            width: '100%'
        }

    }

    const handleFileAdded = () => {
        setAddedFileName(addRef?.current?.files[0]?.name)
    }

    const getRoomName = () => {
        let name = ''
        if (currentRoom?.name) {
            name = currentRoom.name
            if (name.length <= 12 || screen.width >= 768) {
                return name
            }
            return name.slice(0, 12) + '...'
        }
        else {
            const anotherUser = ObjectOfUsers[getAnotherUser(currentRoom.users, user.id)]
            if (screen.width >= 768) {
                return anotherUser?.first_name + ' ' + anotherUser?.last_name
            }
            else {
                return anotherUser?.first_name
            }
        }
    }

    const getHeights = (index: number) => {
        if (!heights?.current) return defaultMessageHeight
        return heights?.current[index] ? heights?.current[index] : defaultMessageHeight
    }

    const setHeights = useCallback((index: number, size: number) => {
        const chat = messagesRef?.current as List
        chat.resetAfterIndex(0)
        heights.current = { ...heights.current, [index]: size }
    }, [])

    const handleAdd = (event: React.MouseEvent) => {
        if (event.target === addRef?.current) return
        addRef?.current.click()
    }

    const handleAddPhoto = (event: React.MouseEvent) => {
        event.preventDefault()
        hiddenInputRef?.current.click()
    }

    const handleExit = () => {
        if (ws?.current) ws.current.disconnect()
        changeCurrentRoom(null)
        updateServiceWS({ currentRoom: null })
        if (screen.width < 768) {
            exit()
        }
    }

    const handleLeaveChat = async () => {
        if (!await checkJWT()) {
            showWarning({ type: 'danger', text: AuthorizationErrorMessage, icon: 'exclamation' })
            return
        }
        const response = await updateRoom({ removed_users: [user.id] }, currentRoom.id, user)
        if (!response) {
            showWarning({ type: 'danger', text: 'Не удалось удалить чат', icon: 'exclamation' })
            return
        }
        changeCurrentRoom(null)
        setMoreTabOpen(false)
    }

    const handleOpenEdit = (event: React.MouseEvent) => {
        event.preventDefault()
        setMoreTabOpen(false)
        document.removeEventListener('click', trackCLick)
        setModalOpen(modalOpen ? false : true)
    }

    const handleOpenMoreTab = (event: React.MouseEvent) => {
        event.preventDefault()
        if (!moreTabOpen) {
            document.addEventListener('click', trackCLick)
        }
        else {
            document.removeEventListener('click', trackCLick)
        }
        setMoreTabOpen(moreTabOpen ? false : true)
    }

    const handlePhotoEdit = () => {
        const input: HTMLInputElement = hiddenInputRef?.current
        setFileName(input?.files[0].name)
    }

    const handleScroll = async ({
        scrollOffset
    }) => {
        if (!currentRoom) {
            showWarning({ type: 'danger', text: AuthorizationErrorMessage, icon: 'exclamation' })
            return
        }
        const chat = messagesRef?.current as List
        if (!chat) return
        // Если после проскролла вверх чат был опущен вниз, 
        // то скроллим вниз при каждом новом сообщении
        if (!canScrollWDown && Math.abs(scrollOffset - (outerRef.current.scrollHeight - outerRef.current.offsetHeight)) < 5) {
            setCanScrollWDown(true)
            return
        }

        // Если чат проскроллен вверх
        // то запрашиваем новые сообщения и прекращаем скролл при каждом новом сообщении
        if (scrollOffset === 0 && currentRoom.messages.length >= 20) {
            if (!await checkJWT()) {
                showWarning({ type: 'danger', text: AuthorizationErrorMessage, icon: 'exclamation' })
                return
            }
            const oldMessagesAmount = currentRoom.messages.length
            const messages = await getMoreMessages({
                room_id: currentRoom.id,
                count: 20,
                last_id: currentRoom.messages[0]?.id
            })
            if (messages?.length > 0) {
                setClosed(true)
                const chat = messagesRef.current as List
                const unrealHeight = outerRef.current.scrollHeight
                const interval = setInterval(() => {
                    if (currentRoom.messages.length > oldMessagesAmount) {
                        if (unrealHeight != outerRef.current.scrollHeight) {
                            chat.scrollToItem(currentRoom.messages.length - oldMessagesAmount, 'start')
                            clearInterval(interval)
                            setClosed(false)
                            openScrollThumb()
                        }
                    }
                })
            }
            if (canScrollWDown) setCanScrollWDown(false)
        }
    }

    const handleSend = async (event: React.MouseEvent | React.KeyboardEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key != 'Enter')) return
        if (sendingStartTime) return
        let video: string = null
        let photo: string = null
        const audio: string = null
        let text: string = null
        const types: messageTypeOptions[] = []
        const timestamp_created = makeTimeCreated()

        setAddedFileName('')
        if (addRef?.current?.files[0]) {
            if (fileExtentionCorrect('video', addRef.current.files[0]?.name)) {
                await createBase64(addRef.current.files[0]).then(base64 => video = base64)
                types.push('Video')
            }
            else if (fileExtentionCorrect('photo', addRef.current.files[0]?.name)) {
                await createBase64(addRef.current.files[0]).then(base64 => photo = base64)
                types.push('Photo')
            }
            else {
                showWarning({ type: 'danger', text: IncorrectFileErrorMessage, icon: 'exclamation' })
                addRef!.current.value = ''
                return
            }
        }

        text = convertToSpecialSymbols(typeInputRef?.current.value)
        if (text) {
            types.push('Text')
        }
        if (text || photo || audio || video) {
            ws?.current.send({
                text: text,
                photo: photo,
                audio: audio,
                video: video,
                author: user.id,
                room: currentRoom.id,
                types: types,
                timestamp_created: timestamp_created
            })
            setSendingStartTime(timestamp_created)
        }
        typeInputRef.current.value = ''
        addRef.current.value = ''
        filterRoomsArray({ first_room_id: currentRoom.id })
        typeInputRef.current.focus()
    }

    const handleSave = async (event: React.MouseEvent) => {
        event.preventDefault()
        if (!await checkJWT()) {
            showWarning({ type: 'danger', text: AuthorizationErrorMessage, icon: 'exclamation' })
            return
        }
        const updatedData = {}
        const addedUsers: number[] = []
        const formElements = formRef?.current?.elements
        for (const element in formElements) {
            const elem = formElements[element]
            if (elem instanceof HTMLInputElement) {
                if ((elem as HTMLInputElement).type === 'checkbox' && (elem as HTMLInputElement).checked) {
                    addedUsers.push(parseInt(elem.dataset['userid']))
                }
            }
        }
        if (addedUsers.length) {
            updatedData['added_users'] = addedUsers
        }
        const photoName = hiddenInputRef?.current?.files[0]
        if (photoName) {
            if (fileExtentionCorrect('photo', photoName.name)) {
                updatedData['photo'] = await createBase64(photoName)
            }
            else {
                showWarning({ type: 'danger', text: IncorrectFileErrorMessage, icon: 'exclamation' })
                return
            }
        }
        const name = convertToSpecialSymbols(chatNameRef?.current?.value)
        if (name && nameChanged(currentRoom.name, name)) {
            if (name.length > 35) {
                showWarning({ type: 'danger', text: 'Название должно содержать не более 35 символов', icon: 'exclamation' })
                return
            }
            updatedData['name'] = name
        }
        if (Object.keys(updatedData).length === 0) return
        const response = await updateRoom(updatedData, currentRoom.id, user)
        if (!response) {
            showWarning({ type: 'danger', text: 'Не удалось обновить чат', icon: 'exclamation' })
            return
        }
        showWarning({ type: 'success', text: 'Данные обновлены', icon: 'ok' })
        setModalOpen(false)
        for (const id of addedUsers) {
            const addedUser = ObjectOfUsers[id]
            const notifications = JSON.parse(addedUser.notifications)
            notifications.got_new_room = true
            const updated = await updateUserDataInDB(addedUser.username, { notifications: JSON.stringify(notifications) })
            if (!updated) {
                showWarning({ type: 'danger', text: 'Не удалось обновить чат', icon: 'exclamation' })
                return
            }
        }
    }

    const itemKey = (index: number) => {
        return currentRoom?.messages[index].timestamp_created
    }

    const openScrollThumb = () => {
        // Открытие прокрутки
        const chat = outerRef?.current
        if (!chat) return
        if (!chat.classList.contains(styles.scrollThumbOpened)) {
            chat.classList.add(styles.scrollThumbOpened)
        }
    }

    const scrollDown = () => {
        const chat = messagesRef.current as List
        if (!chat) return
        if (needScrollDown) {
            let newHeight = null
            const interval = setInterval(() => {
                const currentScrollHeight = outerRef.current.scrollHeight
                if (newHeight == currentScrollHeight) {
                    clearInterval(interval)
                    chat.scrollToItem(currentRoom.messages.length - 1, 'start')
                    setNeedScrollDown(false)
                    return
                }
                newHeight = currentScrollHeight
            })
        }
    }

    const trackCLick = (event: MouseEvent) => {
        const target = event.target as Element
        if (target === moreTabRef?.current) return

        let relatedTarget = target.parentNode
        while (relatedTarget) {
            if (relatedTarget === moreTabRef?.current) return
            relatedTarget = relatedTarget.parentNode
        }
        setMoreTabOpen(false)
    }

    useEffect(() => {
        return () => {
            handleExit()
        }
    }, [])
    useEffect(() => {
        const handleResize = () => {
            if (screen.width <= 768) {
                setNeedScrollDown(true)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])
    useEffect(() => {
        // Скролл при получении нового сообщения
        const chat = messagesRef.current as List
        if (!canScrollWDown || !chat) return
        chat.scrollToItem(currentRoom.messages.length - 1, 'start')
    }, [currentRoom?.last_message])
    useEffect(() => {
        if (!outerRef?.current) return
        // Установка обработчика на wheel
        const element = outerRef?.current
        element.addEventListener('wheel', openScrollThumb, { passive: true })
        return () => element.removeEventListener('wheel', openScrollThumb)
    }, [outerRef.current])
    useEffect(() => {
        // Подключение WebSocket при изменении текущей комнаты
        if (!currentRoom) return
        if (ws?.current) ws.current.disconnect()
        ws.current = (new WS(WebSocketChatURL + `/${currentRoom.id}/` + `?username=${user.username}&token=${getCookie('BaseToken')}`,
            (room_id: number, message: MessageInterface) => addMessageToRoom(room_id, message),
            currentRoom.id))
    }, [currentRoom?.id])
    useEffect(() => {
        return document.removeEventListener('click', trackCLick)
    }, [])
    useEffect(() => {
        if (!currentRoom?.last_message) return
        const last_message = JSON.parse(currentRoom?.last_message)
        if (last_message.timestamp_created === sendingStartTime) {
            setSendingStartTime(0)
        }
    }, [currentRoom?.last_message])
    return (
        <div className={cn(className, styles.chat, { [styles.chatBlackTheme]: theme === 'black' })} {...props}>
            <ModalWindow className={cn(styles.modal, { [styles.modalOpen]: modalOpen })}>
                <Form className={styles.innerModal} ref={formRef}>
                    <h2 className={styles.h2}>Изменить название</h2>
                    <FormInput defaultValue={currentRoom?.name} className={styles.input} ref={chatNameRef} />
                    <div className={styles.members}>
                        <h2 className={styles.h2}>Добавить участников</h2>
                        <FormInput placeholder='Поиск...' className={styles.input} onChange={(event: SyntheticEvent) => handleUsersSearch(event, (value) => setFilteredFriends(value), UsersFriends)} />
                        <div className={styles.membersList}>
                            {
                                filteredFriends[0] && filteredFriends
                                    ?.filter(friend => !(currentRoom?.users?.includes(friend?.id)))
                                    ?.map(friend =>
                                        <div className={styles.member} key={friend.id}>
                                            {friend?.first_name} {friend?.last_name}
                                            <input type='checkbox' data-userid={friend?.id} />
                                        </div>)
                            }
                        </div>
                    </div>
                    <div className={styles.photoChange}>
                        <h2 className={styles.h2}>Изменить фото</h2>
                        <Avatar title={currentRoom?.name} className={styles.avatar} edgeType='circle' object={currentRoom} size={90} cover={true} />
                        <div className={styles.hiddenInputWrap}>
                            <Button className={styles.pickBtn} color={theme} animations={['base']} size={125} onClick={handleAddPhoto}>
                                Выбрать
                            </Button>
                            <input type='file' className={styles.hiddenInput} ref={hiddenInputRef} onChange={handlePhotoEdit} />
                            <div className={styles.fileName}>{fileName}</div>
                        </div>
                    </div>
                    <div className={styles.btnGroup}>
                        <Button className={styles.btn} color={theme} animations={['danger']} size={240} onClick={handleOpenEdit}>Назад</Button>
                        <Button className={styles.btn} color={theme} animations={['success']} size={240} onClick={handleSave}>Сохранить</Button>
                    </div>
                </Form>
            </ModalWindow>
            <div className={cn(styles.upperBar)}>
                <ExitIcon className={cn(styles.exitIcon, { [styles.exitIconOpen]: screen.width < 768 })} onClick={handleExit} />
                {
                    currentRoom
                        ?
                        <div className={styles.roomInfo}>
                            {
                                currentRoom.isGroup
                                    ?
                                    <Avatar title={currentRoom?.name} edgeType='circle' object={currentRoom} size={54} cover={true} />
                                    :
                                    <Avatar title={getFullName(ObjectOfUsers[getAnotherUser(currentRoom?.users, user.id)])} edgeType='circle' cover={true} size={54} object={ObjectOfUsers[getAnotherUser(currentRoom?.users, user.id)]} />
                            }
                            <div className={styles.title}>
                                {getRoomName()}
                                <div className={cn(styles.isOnline, { [styles.isOnlineOpen]: !currentRoom.isGroup })}>
                                    {
                                        ObjectOfUsers[getAnotherUser(currentRoom?.users, user.id)]?.isOnline
                                            ?
                                            'в сети'
                                            :
                                            'не в сети'
                                    }
                                </div>
                            </div>
                        </div>
                        :
                        <></>
                }
                <div className={styles.moreWrapper} ref={moreTabRef}>
                    <MoreIcon onClick={handleOpenMoreTab} className={cn(styles.svg, styles.moreIcon, { [styles.moreIconOpen]: currentRoom })} />
                    <div className={styles.modalsWrapper}>
                        <div className={cn(styles.moreTab, { [styles.openMoreTab]: moreTabOpen && currentRoom?.isGroup })}>
                            <h2 className={styles.h2}>Участники</h2>
                            <div className={styles.membersList}>
                                {
                                    currentRoom?.users.map(memberId =>
                                        <div key={memberId} className={styles.member}>
                                            <div>
                                                {ObjectOfUsers[memberId]?.first_name + ' ' + ObjectOfUsers[memberId]?.last_name}
                                            </div>
                                            <div className={styles.isOnline}>
                                                {ObjectOfUsers[memberId]?.isOnline ? 'в сети' : 'не в сети'}
                                            </div>
                                        </div>)
                                }

                            </div>
                            <div className={styles.btnGroup}>
                                <Button className={styles.btn} color={theme} animations={['base']} size={280} onClick={handleOpenEdit}>
                                    Редактировать
                                </Button>
                                <Button className={styles.btn} color={theme} animations={['danger']} size={280} onClick={handleLeaveChat}>
                                    Выйти
                                </Button>
                            </div>
                        </div>
                        <Button color={theme} animations={['danger']} size={280} onClick={handleLeaveChat} className={cn([styles.leaveBtn], { [styles.leaveBtnOpen]: moreTabOpen && !currentRoom?.isGroup })}>
                            Выйти
                        </Button>
                    </div>
                </div>
            </div>
            <div className={styles.autoSizerWrapper} onWheel={openScrollThumb}>
                <div style={inlineStyles.autoSizerWrapperJunior}>
                    {
                        currentRoom?.messages.length
                            ?
                            <AutoSizer style={inlineStyles.messagesContainer}>
                                {({ height, width }) => (
                                    <List
                                        className={cn(styles.messages, { [styles.closed]: closed, [styles.messages_black_theme]: theme === 'black' })}
                                        height={height}
                                        itemCount={currentRoom?.messages.length}
                                        itemSize={getHeights}
                                        width={width}
                                        itemKey={itemKey}
                                        ref={messagesRef}
                                        overscanCount={overscanCount}
                                        onScroll={handleScroll}
                                        outerRef={outerRef}
                                        initialScrollOffset={defaultMessageHeight * overscanCount}
                                        onItemsRendered={scrollDown}
                                    >
                                        {({ index, style }) => (
                                            <Message index={index} style={style} setHeights={setHeights} message={currentRoom?.messages[index]} key={currentRoom?.messages[index].timestamp_created} />
                                        )}
                                    </List>
                                )}
                            </AutoSizer>
                            :
                            currentRoom
                                ?
                                <></>
                                :
                                <div className={styles.noMessagesDiv} >
                                    <span className={styles.noMessagesSpan}>
                                        Выберите или создайте чат
                                    </span>
                                </div >
                    }
                </div>
            </div >
            <div className={cn(styles.inputBar, { [styles.open]: currentRoom })}>
                <div className={styles.hiddenInputWrap} onClick={handleAdd}>
                    <input className={styles.hiddenInput} type='file' ref={addRef} onChange={handleFileAdded} />
                    <AddIcon className={cn(styles.add, styles.svg)} />
                </div>
                <div className={cn(styles.fileAdded, { [styles.fileAddedOpen]: addedFileName })}>{addedFileName}</div>
                <input className={cn(styles.input, { [styles.inputOpen]: !addedFileName, [styles.input_black_theme]: theme === 'black' })} placeholder='Напишите сообщение...' ref={typeInputRef} onKeyDown={handleSend} />
                <SendIcon className={cn(styles.send, styles.svg, { [styles.sendOpen]: !sendingStartTime })} onClick={handleSend} />
                <LoadingIcon className={cn(styles.loading, { [styles.loadingOpen]: sendingStartTime })} />
            </div>
        </div>
    )
})
Chat.displayName = 'Chat'