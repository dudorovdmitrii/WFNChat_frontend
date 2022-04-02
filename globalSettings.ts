// URLs

////dev
// const devAPIDomain = '192.168.43.159:8000'
// export const APIDomainHTTP = `http://${devAPIDomain}`
// export const APIDomainWS = `ws://${devAPIDomain}/ws`

//prod
const APIDomain = 'wfnchat.store'
export const APIDomainHTTP = `https://${APIDomain}`
export const APIDomainWS = `wss://${APIDomain}/ws`

// Ошибки
export const AuthorizationErrorMessage = 'Что-то пошло не так'
export const IncorrectFileErrorMessage = 'Некорректный тип файла'

// titles
export const defaultTitle = 'WFNChat'
export const newMessageTitle = 'Новое сообщение'

// extra
export const ShowWarningDuration = 5000