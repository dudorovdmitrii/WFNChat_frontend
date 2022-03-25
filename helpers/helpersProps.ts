export interface setCookieProps {
    name: string,
    value: string,
    options?:
    {
        expires?: Date | string,
        'max-age'?: string,
        samesite?: string,
        secure?: string,
        httpOnly?: string,
        sameParty?: string,
        domain?: string,
        path?: string
    }
}

export type TitleType = 'default' | 'new message'