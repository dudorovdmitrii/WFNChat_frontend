import { SyntheticEvent, useContext, useRef, useState } from 'react'
import cn from 'classnames'
import { observer } from 'mobx-react-lite'
import dynamic from 'next/dynamic'

import { createBase64, fileExtentionCorrect, handleUsersSearch, convertToSpecialSymbols } from '../../helpers'
import { GlobalContext } from '../../context'
import { ChatActionsProps } from './ChatActionsProps'
import { Button, Form, FormInput, SearchBar } from '..'
import { ModalWindowProps } from '../ModalWindow/ModalWindowProps'
const ModalWindow = dynamic<ModalWindowProps>(() => import('./../ModalWindow').then(mod => mod.ModalWindow), { ssr: false })

import SearchIcon from './../../public/icons/search.svg'
import PlusIcon from './../../public/icons/plus.svg'
import styles from './ChatActions.module.scss'
import { AuthorizationErrorMessage, IncorrectFileErrorMessage } from '../../globalSettings'

export const ChatActions = observer(({ className, ...props }: ChatActionsProps): JSX.Element => {
    const [modalOpen, setModalOpen] = useState(false)
    const [fileName, setFileName] = useState('не выбрано')
    const { UserStore, RoomStore, showWarning } = useContext(GlobalContext)
    const formRef = useRef<HTMLFormElement>(null)
    const hiddenInputRef = useRef<HTMLInputElement>(null)
    const chatNameRef = useRef<HTMLInputElement>(null)
    const { user, checkJWT, UsersFriends, theme, updateUserDataInDB, ObjectOfUsers } = UserStore
    const { createRoom } = RoomStore
    const [filteredFriends, setFilteredFriends] = useState(UsersFriends)
    const [buttonWord, setButtonWord] = useState('Создать диалог')
    const [membersArray, setMembersArray] = useState([])
    const handleModalOpen = (event: React.MouseEvent) => {
        event.preventDefault()
        setModalOpen(modalOpen ? false : true)
    }
    const handleCreate = async (event: React.MouseEvent) => {
        event.preventDefault()
        if (buttonWord === 'Диалог уже есть') {
            showWarning({ type: 'danger', text: 'Диалог с этим пользователем уже существует', icon: 'exclamation' })
            return
        }
        if (!await checkJWT()) {
            showWarning({ type: 'danger', text: AuthorizationErrorMessage, icon: 'exclamation' })
            return
        }
        const data = {}
        data['users'] = [...membersArray, user.id]
        data['messages'] = []
        data['name'] = null
        data['photo'] = null
        data['isGroup'] = data['users'].length > 2 ? true : false
        const name = convertToSpecialSymbols(chatNameRef?.current?.value)
        if (data['isGroup']) {
            if (name) {
                if (name.length > 35) {
                    showWarning({ type: 'danger', text: 'Название должно содержать не более 35 символов', icon: 'exclamation' })
                    return
                }
                data['name'] = name
            }
            else {
                showWarning({ type: 'danger', text: 'Не заполнено поле названия', icon: 'exclamation' })
                return
            }

            const photo = hiddenInputRef?.current?.files[0]
            if (photo) {
                if (!fileExtentionCorrect('photo', photo?.name)) {
                    showWarning({ type: 'danger', text: IncorrectFileErrorMessage, icon: 'exclamation' })
                    return
                }
                data['photo'] = await createBase64(photo)
            }
        }
        const response = await createRoom(data)
        if (!response) {
            showWarning({ type: 'danger', text: 'Не удалось создать чат', icon: 'exclamation' })
            handleModalOpen(event)
            return
        }
        for (const element in formRef?.current?.elements) {
            const elem = formRef?.current?.elements[element]
            if (elem instanceof HTMLInputElement) {
                if ((elem as HTMLInputElement).type === 'checkbox') {
                    (elem as HTMLInputElement).checked = false
                }
            }
        }
        showWarning({ type: 'success', text: 'Чат создан', icon: 'ok' })
        handleModalOpen(event)
        membersArray.forEach(async (memberId) => {
            const member = ObjectOfUsers[memberId]
            const notifications = JSON.parse(member.notifications)
            notifications.got_new_room = true
            const updated = await updateUserDataInDB(member.username,
                {
                    notifications: JSON.stringify(notifications)
                })
            if (!updated) {
                showWarning({ type: 'danger', text: 'Не удалось создать чат', icon: 'exclamation' })
                return
            }
        })
    }
    const handleCheckboxChange = async () => {
        let checkedAmount = 0
        const newMembersArray = []
        for (const element in formRef?.current?.elements) {
            const elem = formRef?.current?.elements[element]
            if (elem instanceof HTMLInputElement) {
                if ((elem as HTMLInputElement).type === 'checkbox' && (elem as HTMLInputElement).checked) {
                    checkedAmount++
                    newMembersArray.push(parseInt(elem.dataset['userid']))
                }
            }
        }
        setMembersArray(newMembersArray)
        if (checkedAmount > 1) {
            setButtonWord('Создать беседу')
            return
        }
        const existingDialogId = user.rooms
            ?.find(room =>
                room?.users.length === 2
                &&
                room?.users.includes(user.id)
                &&
                room?.users.includes(newMembersArray[0]))?.id

        if (existingDialogId) {
            setButtonWord('Диалог уже есть')
            return
        }

        setButtonWord('Создать диалог')
    }
    const handlePickPhoto = (event: React.MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        hiddenInputRef?.current.click()
    }
    const handlePhotoAdd = () => {
        setFileName(hiddenInputRef?.current?.files[0]?.name)
    }
    return (
        <>
            <div className={cn(className, styles.chatActions, { [styles.chatActionsBlackTheme]: theme === 'black' })} {...props}>
                <h1 className={styles.title}>Чаты</h1>
                <Button color={theme} className={styles.button} size={240} animations={['base']} onClick={handleModalOpen}>
                    <PlusIcon className={styles.plus} />
                    <div>Создать новый чат</div>
                </Button>
                <SearchBar color={theme} className={styles.searchBar} type='rooms'>
                    <SearchIcon />
                </SearchBar>
            </div>
            <ModalWindow theme={theme} className={cn(styles.modal, { [styles.modalOpen]: modalOpen, [styles.modalBlackTheme]: theme === 'black' })}>
                <Form ref={formRef} className={styles.form} color={theme}>
                    <div className={styles.chatSettings}>
                        <div className={styles.hiddenInputWrap}>
                            <Button color={theme} className={styles.addPhoto} size={125} animations={['base']} onClick={handlePickPhoto}>
                                Фото
                            </Button>
                            <div className={styles.fileName}>{fileName}</div>
                            <input type='file' className={styles.hiddenInput} ref={hiddenInputRef} onChange={handlePhotoAdd} />
                        </div>
                        <FormInput className={styles.nameInput} color={theme} ref={chatNameRef} type='text' placeholder='Название беседы...' />
                    </div>
                    <FormInput color={theme} className={styles.friendsSearchInput} type='text' placeholder='Поиск друзей...' onChange={(event: SyntheticEvent) => handleUsersSearch(event, (value) => setFilteredFriends(value), UsersFriends)} />
                    <div className={styles.friendsList}>
                        {
                            filteredFriends[0] && filteredFriends?.map(friend =>
                                <div className={styles.friendChoice} key={friend.id}>
                                    {friend?.first_name} {friend?.last_name}
                                    <input className={styles.checkbox} onChange={handleCheckboxChange} type='checkbox' data-userid={friend?.id} />
                                </div>)
                        }
                    </div>
                    <div className={styles.btnGroup}>
                        <Button className={styles.btn} color={theme} size={240} animations={['danger']} onClick={handleModalOpen}>Закрыть</Button>
                        <Button className={styles.btn} color={theme} size={240} animations={['success']} onClick={handleCreate}>{buttonWord}</Button>
                    </div>
                </Form>
            </ModalWindow>
        </>
    )
})
ChatActions.displayName = 'ChatActions'