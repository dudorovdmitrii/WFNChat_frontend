import { DetailedHTMLProps, HTMLAttributes } from "react";
import { Themes } from "../../globalTypes";

export interface NotificationProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    className?: string,
    user_id: number,
    color?: Themes,
    type: 'friend_request' | 'friend_acception'
}