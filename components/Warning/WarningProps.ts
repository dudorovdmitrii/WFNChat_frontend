import { DetailedHTMLProps, HTMLAttributes } from "react";
import { Icons, Themes, WarningTypes } from "../../globalTypes";

export interface WarningProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    className?: string,
    type?: WarningTypes,
    text?: string,
    color?: Themes,
    icon?: Icons
}