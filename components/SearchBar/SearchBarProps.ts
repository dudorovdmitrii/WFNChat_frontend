import { DetailedHTMLProps, InputHTMLAttributes, ReactNode } from "react";
import { PluralUserProps, Themes } from "../../globalTypes";

export interface SearchBarProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    children?: ReactNode,
    className?: string,
    type?: 'rooms' | 'users',
    array?: PluralUserProps[],
    color?: Themes,
    placeholder?: string
}