import { useContext, useEffect, useRef, useState } from 'react'
import cn from 'classnames'
import { useRouter } from 'next/router'
import { observer } from 'mobx-react-lite'

import { formElementsInterface, registerFormInterface, RegisterProps } from './RegisterProps'
import { Button, Form, FormInput } from '..'
import { amountOfPages, emailRegex, numberOfStartPage } from './RegisterSettings'
import { GlobalContext } from '../../context'

import styles from './Register.module.scss'
import { isBirthdayCorrect, validateNameSurname } from '../../helpers'


export const Register = observer(({ className, ...props }: RegisterProps): JSX.Element => {
    const router = useRouter()
    const [incorrectFields, setIncorrectFields] = useState([])
    const formRef = useRef<registerFormInterface>(null)
    const privateFormRef = useRef<registerFormInterface>(null)
    const [page, setPage] = useState<number>(numberOfStartPage)
    const { UserStore, showWarning } = useContext(GlobalContext)
    const { register, AllUsersSet, getAllUsers, user } = UserStore
    useEffect(() => {
        page === 1
            ?
            formRef?.current.elements.username.focus()
            :
            privateFormRef?.current.elements.first_name.focus()
    }, [page])
    const handleRegister = async (event: React.MouseEvent | React.KeyboardEvent) => {
        event.preventDefault()
        const username = formRef?.current?.elements?.username.value
        const password = formRef?.current?.elements?.password.value
        const repeat_password = formRef?.current?.elements?.repeat_password.value
        const last_name = privateFormRef?.current?.elements?.last_name?.value
        const first_name = privateFormRef?.current?.elements?.first_name?.value
        const email = formRef?.current?.elements?.email.value
        const birthday = privateFormRef?.current?.elements?.birthday?.value

        if ([username, password, repeat_password, last_name, first_name, email, birthday].filter(field => field === '').length) {
            showWarning({ type: 'danger', text: 'Заполните все поля', icon: 'exclamation' })
            return
        }

        if (!(isPasswordValid(password) && doPasswordsMatch(password, repeat_password))) return
        if (!areNamesValid(first_name, last_name)) return
        if (!isEmailValid(email)) return
        if (!isBirthdayValid(birthday)) return
        if (!isLoginValid(username)) return

        const registered = await register({
            username: username,
            password: formRef?.current?.elements?.password.value,
            last_name: privateFormRef?.current?.elements?.last_name?.value,
            first_name: privateFormRef?.current?.elements?.first_name?.value,
            email: formRef?.current?.elements?.email.value,
            birthday: privateFormRef?.current?.elements?.birthday?.value
        })
        if (!registered) {
            showWarning({ type: 'danger', 'text': 'Что-то пошло не так', icon: 'exclamation' })
            return
        }
        showWarning({ type: 'success', 'text': 'Письмо с подтверждением было отправлено на вашу почту', icon: 'mail' })
        router.push('/')
    }
    const handleNextPage = (event: React.MouseEvent) => {
        event.preventDefault()
        setPage(page === amountOfPages ? 1 : page + 1)
    }
    const isBirthdayValid = (birthday: string) => {
        if (!isBirthdayCorrect(birthday)) {
            showWarning({ type: 'danger', 'text': 'Некорректная дата рождения', icon: 'exclamation' })
            setIncorrectFields(prev => [...prev, 'birthday'])
            return false
        }
        return true
    }
    const isPasswordValid = (password: string) => {
        if (password.length < 8) {
            showWarning({ type: 'danger', 'text': 'Пароль должен содержать не менее 8 символов', icon: 'exclamation' })
            setIncorrectFields(prev => [...prev, 'password'])
            return false
        }
        return true
    }
    const doPasswordsMatch = (password: string, repeat_password: string) => {
        if (password != repeat_password) {
            showWarning({ type: 'danger', 'text': 'Пароли не совпадают', icon: 'exclamation' })
            setIncorrectFields(prev => [...prev, 'repeat_password'])
            return false
        }
        return true
    }
    const isEmailValid = (email: string) => {
        if (!emailRegex.test(email)) {
            showWarning({ type: 'danger', 'text': 'Некорректный адрес электронной почты', icon: 'exclamation' })
            setIncorrectFields(prev => [...prev, 'email'])
            return false
        }
        return true
    }
    const isLoginValid = async (login: string) => {
        if (login.length < 4) {
            showWarning({ type: 'danger', 'text': 'Логин должен содержать не менее 4 символов', icon: 'exclamation' })
            setIncorrectFields(prev => [...prev, 'login'])
            return false
        }
        const gotUsers = await getAllUsers()
        if (!gotUsers) {
            showWarning({ type: 'danger', 'text': 'Что-то пошло не так', icon: 'exclamation' })
            return false
        }

        if (AllUsersSet.has(login)) {
            showWarning({ type: 'danger', 'text': 'Этот логин занят', icon: 'exclamation' })
            return false
        }
        return true
    }
    const areNamesValid = (first_name: string, last_name: string) => {
        const [field, message] = validateNameSurname(first_name, last_name)
        if (message === 'valid') return true

        if (field === 'first_name') {
            showWarning({ type: 'danger', 'text': message, icon: 'exclamation' })
            setIncorrectFields(prev => [...prev, 'first_name'])
            return false
        }
        if (field === 'last_name') {
            showWarning({ type: 'danger', 'text': message, icon: 'exclamation' })
            setIncorrectFields(prev => [...prev, 'last_name'])
            return false
        }
        return false
    }
    const removeFromIncorrect = (event: React.MouseEvent) => {
        event.preventDefault()
        const input: HTMLInputElement = event.target as HTMLInputElement
        const inputIndex = incorrectFields.findIndex(input_name => input_name === input.name)
        setIncorrectFields(prev => {
            const mas = prev.slice(0,)
            mas.splice(inputIndex, 1)
            return mas
        })
    }
    const findNextField = (elements: formElementsInterface, number: number) => {
        for (const element in elements) {
            const elem = elements[element]
            if (elem instanceof HTMLInputElement) {
                if (parseInt(elem.dataset['fieldnumber']) === number + 1) {
                    elem.focus()
                    return true
                }
            }
        }
        return false
    }
    const handleNext = async (event: React.KeyboardEvent) => {
        if (event.key != 'Enter') return
        event.preventDefault()
        const input: HTMLInputElement = event.target as HTMLInputElement
        const fieldNumber = parseInt(input.dataset['fieldnumber'])
        switch (fieldNumber) {
            case 4: {
                setPage(2)
                break
            }
            case 7: {
                await handleRegister(event)
                break
            }
            default: {
                if (findNextField(privateFormRef?.current.elements, fieldNumber)) break
                findNextField(formRef?.current.elements, fieldNumber)
            }
        }
    }
    if (user) {
        router.push('/')
    }
    return (
        <div className={cn(className, styles.wrapper)} {...props}>
            <Form className={cn(styles.form, { [styles.closed]: page != 1 })} ref={formRef}>
                <h2>Регистрация</h2>
                <FormInput data-fieldnumber={1} onKeyDown={handleNext} className={styles.firstIinput} onClick={removeFromIncorrect} incorrect={incorrectFields.includes('username')} name='username' type='text' placeholder='Логин' autoComplete='username' />
                <FormInput data-fieldnumber={2} onKeyDown={handleNext} onClick={removeFromIncorrect} incorrect={incorrectFields.includes('email')} name='email' type='email' placeholder='Электронная почта' autoComplete='email' />
                <FormInput data-fieldnumber={3} onKeyDown={handleNext} onClick={removeFromIncorrect} incorrect={incorrectFields.includes('password')} name='password' type='password' placeholder='Пароль' autoComplete='new-password' />
                <FormInput data-fieldnumber={4} onKeyDown={handleNext} onClick={removeFromIncorrect} incorrect={incorrectFields.includes('repeat_password')} name='repeat_password' type='password' placeholder='Повторите пароль' autoComplete='new-password' />
                <Button onClick={handleNextPage} className={styles.button} size={280} animations={['base']}>
                    Дальше
                </Button>
            </Form>
            <Form ref={privateFormRef} className={cn(styles.form, { [styles.closed]: page != 2 })}>
                <h2>Личная информация</h2>
                <FormInput data-fieldnumber={5} onKeyDown={handleNext} className={styles.firstIinput} onClick={removeFromIncorrect} incorrect={incorrectFields.includes('first_name')} name='first_name' type='text' placeholder='Имя' />
                <FormInput data-fieldnumber={6} onKeyDown={handleNext} onClick={removeFromIncorrect} incorrect={incorrectFields.includes('last_name')} name='last_name' type='text' placeholder='Фамилия' />
                <fieldset>
                    <label htmlFor='birthday'>День рождения</label>
                    <FormInput data-fieldnumber={7} onKeyDown={handleNext} onClick={removeFromIncorrect} incorrect={incorrectFields.includes('birthday')} name='birthday' type='date' />
                </fieldset>
                <div className={styles.btnGroup}>
                    <Button onClick={handleNextPage} className={styles.button} size={125} animations={['base']}>
                        Назад
                    </Button>
                    <Button onClick={handleRegister} className={styles.button} size={125} animations={['success']}>
                        Готово
                    </Button>
                </div>
            </Form>
        </div>
    )
})
Register.displayName = 'Register'