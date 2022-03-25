import { APIDomainHTTP } from "../../globalSettings"

export const confirmEmailURL = `${APIDomainHTTP}/auth/users/activation/`
export const getUserDataURL = `${APIDomainHTTP}/user/`
export const getAllUsersURL = `${APIDomainHTTP}/users/`
export const getOnlyRoomsUserURL = `${APIDomainHTTP}/only_rooms_user/`
export const JWTGetURL = `${APIDomainHTTP}/api/token/`
export const JWTRefreshURL = `${APIDomainHTTP}/api/token/refresh/`
export const loginURL = `${APIDomainHTTP}/auth/token/login/`
export const logoutURL = `${APIDomainHTTP}/auth/token/logout/`
export const registerURL = `${APIDomainHTTP}/auth/users/`
export const updateUserDataURL = `${APIDomainHTTP}/user/`

const month = 60 ** 2 * 24 * 30
const minute = 60

export const BaseTokenOptions =
{
    'max-age': String(month),
    'samesite': 'strict',
    // 'secure': true
}

export const CredentialsOptions =
{
    'max-age': String(month),
    'samesite': 'strict',
    // 'secure': true
}

export const JWTAccessOptions =
{
    'max-age': String(minute * 3),
    'samesite': 'strict',
    // 'secure': true
}