import { DetailedHTMLProps, HTMLAttributes } from "react";
import { Themes } from "../../globalTypes";

export interface NotificationUnreadProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    className?: string,
    number: number,
    color?: Themes
}