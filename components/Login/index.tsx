import { useContext, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import cn from 'classnames'
import { useRouter } from 'next/router'

import { loginFormInterface, LoginProps } from './LoginProps'
import { Button, Form, FormInput } from '..'
import { GlobalContext } from '../../context'

import styles from './Login.module.scss'


export const Login = observer(({ className, ...props }: LoginProps): JSX.Element => {
    const router = useRouter()
    const formRef = useRef<loginFormInterface>(null)
    const { UserStore, showWarning } = useContext(GlobalContext)
    const { login, user } = UserStore
    useEffect(() => {
        formRef?.current.elements.username.focus()
    }, [])
    const handleLogin = async (event: React.MouseEvent) => {
        event.preventDefault()
        const username = formRef?.current?.elements?.username?.value
        const password = formRef?.current?.elements?.password?.value
        if (!username || !password) {
            showWarning({ type: 'danger', text: 'Заполните все поля', icon: 'exclamation' })
            return
        }

        const loggedIn = await login({
            username: username,
            password: password
        }).then(result => result)
        if (loggedIn) {
            router.push('/')
        }
        else {
            showWarning({ type: 'danger', text: 'Пароль или логин не подходит', icon: 'exclamation' })
        }
    }
    const handleNext = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            formRef?.current.elements.password.focus()
        }
    }
    if (user) {
        router.push('/')
    }
    return (
        <div className={cn(className, styles.wrapper)} {...props}>
            <Form ref={formRef} className={styles.form}>
                <h2>Вход</h2>
                <FormInput name='username' type='text' placeholder='Логин' autoComplete="on" onKeyDown={handleNext} />
                <FormInput name='password' type='password' placeholder='Пароль' autoComplete="on" />
                <Button onClick={handleLogin} className={styles.button} size={280} animations={['base']}>
                    Войти
                </Button>
            </Form>
        </div>
    )
})
Login.displayName = 'Login'