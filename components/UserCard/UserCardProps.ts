import { DetailedHTMLProps, HTMLAttributes } from "react";
import { PluralUserProps, Themes } from "../../globalTypes";

export interface UserCardProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    user_type: 'friend' | 'friend_request' | 'desired_friend' | 'blocked_user' | 'searched_user',
    anotherUser: PluralUserProps,
    className?: string,
    filterChoice: string,
    color?: Themes
}

export const actionTypes =
{
    'add': ['searched_user', 'friend_request'],
    'cancel': ['desired_friend', 'friend'],
    'block': ['friend', 'friend_request', 'searched_user'],
    'unblock': ['blocked_user']
}