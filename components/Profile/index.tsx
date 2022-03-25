import { useContext, useEffect, useRef } from 'react'
import cn from 'classnames'
import { observer } from 'mobx-react-lite'

import { GlobalContext } from '../../context'
import { ProfileProps } from './ProfileProps'
import { Avatar, Button } from '..'
import { declOfNum, fileExtentionCorrect, getDateRegistered, isBirthdayCorrect, nameChanged, validateNameSurname } from '../../helpers'

import styles from './Profile.module.scss'

export const Profile = observer(({ className, ...props }: ProfileProps): JSX.Element => {
    const descriptionRef = useRef<HTMLTextAreaElement>(null)
    const nameInputRef = useRef<HTMLInputElement>(null)
    const hiddenInputRef = useRef<HTMLInputElement>(null)
    const birthdayInputRef = useRef<HTMLInputElement>(null)
    const { UserStore, showWarning } = useContext(GlobalContext)
    const { user, updateUserDataInDB, theme, fullName } = UserStore
    useEffect(() => {
        if (!descriptionRef.current) return
        descriptionRef!.current!.style.height = descriptionRef!.current!.scrollHeight + 'px'
    }, [])
    const handleAddPhoto = (event: React.MouseEvent) => {
        event.preventDefault()
        hiddenInputRef?.current.click()
    }
    const getNameParts = (name: string): string[] => {
        const groups = name.match(/^(?<name>\p{L}+)\s(?<surname>\p{L}+)/u)?.groups
        return [groups?.name, groups?.surname]
    }
    const handleSubmit = async () => {
        const updatedData = {}
        if (nameChanged(user.first_name + ' ' + user.last_name, nameInputRef?.current?.value)) {
            const [name, surname] = getNameParts(nameInputRef?.current?.value)
            if (name && surname) {
                const [, message] = validateNameSurname(name, surname)
                if (message != 'valid') {
                    showWarning({ type: 'danger', text: message })
                    return
                }
                updatedData['first_name'] = name
                updatedData['last_name'] = surname
            }
            else {
                showWarning({ type: 'danger', text: 'Поле имени и фамилии заполнено неверно', icon: 'exclamation' })
                return
            }
        }
        if (descriptionRef?.current.value != user.description) {
            updatedData['description'] = descriptionRef?.current.value
        }
        const birthday = birthdayInputRef?.current.value
        if (birthday && birthday != user.birthday) {
            if (!isBirthdayCorrect(birthday)) {
                showWarning({ type: 'danger', text: 'Поле дня рождения заполнено неверно', icon: 'exclamation' })
                return
            }
            updatedData['birthday'] = birthday
        }
        if (hiddenInputRef?.current?.files.length > 0) {
            if (hiddenInputRef?.current.files.length > 1) {
                showWarning({ type: 'danger', text: 'Нельзя выбрать больше одной фотографии', icon: 'exclamation' })
                hiddenInputRef!.current.value = ''
                return
            }
            const photo = hiddenInputRef?.current?.files[0]
            if (!fileExtentionCorrect('photo', photo?.name)) {
                showWarning({ type: 'danger', text: 'Не подходящий тип файла', icon: 'exclamation' })
                return
            }
            const reader = new FileReader()
            reader.readAsDataURL(photo)
            reader.onload = async () => {
                updatedData['photo'] = reader.result

                const updated = await updateUserDataInDB(user.username, updatedData)
                if (!updated) {
                    showWarning({ type: 'danger', text: 'Что-то пошло не так', icon: 'exclamation' })
                }
                else {
                    showWarning({ type: 'success', text: 'Данные обновлены', icon: 'ok' })
                }
                return
            }
        }
        else {
            if (!Object.keys(updatedData).length) return
            const updated = await updateUserDataInDB(user.username, updatedData)
            if (!updated) {
                showWarning({ type: 'danger', text: 'Что-то пошло не так', icon: 'exclamation' })
            }
            else {
                showWarning({ type: 'success', text: 'Данные обновлены', icon: 'ok' })
            }
            return
        }
    }
    if (!user) return <></>
    return (
        <div className={cn(className, styles.profile, { [styles.profileBlackTheme]: theme === 'black' })} {...props}>
            {
                <Avatar title={fullName} object={user} size={300} cover={true} edgeType='round_6' className={styles.photo} />
            }
            <div className={styles.mainInfo}>
                <div className={styles.name}>
                    <input ref={nameInputRef} type='text' className={styles.input} defaultValue={fullName} />
                </div>
                <div className={styles.statistics}>
                    <div className={styles.stat}>
                        <div>{user.friends.length}</div>
                        <div>{declOfNum(user.friends.length, ['ДРУГ', 'ДРУГА', 'ДРУЗЕЙ'])}</div>
                    </div>
                    <div className={styles.stat}>
                        <div>{user.friend_requests.length}</div>
                        <div>{declOfNum(user.friend_requests.length, ['ЗАЯВКА', 'ЗАЯВКИ', 'ЗАЯВОК'])} В ДРУЗЬЯ</div>
                    </div>
                </div>
            </div>
            <div className={styles.description}>
                <h1 className={styles.h1}>О себе</h1>
                <textarea ref={descriptionRef} className={styles.descriptionInput} defaultValue={user.description} />
            </div>
            <div className={styles.additionalInfo}>
                <h1 className={styles.h1}>Дополнительная информация</h1>
                <div className={styles.birthdayInput}>
                    <span>Дата рождения: {user.birthday}</span>
                    <input className={styles.birthdayInput} type='date' ref={birthdayInputRef} />
                </div>
                <div>Дата регистрации: {getDateRegistered(user)}</div>
            </div>
            <div className={styles.actions}>
                <div className={styles.hiddenInputWrap}>
                    <Button color={theme} className={cn(styles.btn, styles.addPhoto)} animations={['base']} size={240} onClick={handleAddPhoto}>
                        Фото
                    </Button>
                    <input type='file' className={styles.hiddenInput} ref={hiddenInputRef} />
                </div>
                <Button className={styles.btn} color={theme} animations={['success']} size={240} onClick={handleSubmit}>
                    Применить
                </Button>
            </div>
        </div>
    )
})
Profile.displayName = 'Profile'