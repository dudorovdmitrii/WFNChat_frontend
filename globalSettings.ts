// URLs

////dev
// const APIDomain = '192.168.43.159:8000'
// export const APIDomainHTTP = `http://${APIDomain}`
// export const APIDomainWS = `ws://${APIDomain}/ws`

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