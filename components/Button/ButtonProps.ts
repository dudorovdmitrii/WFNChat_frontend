import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import { Themes } from "../../globalTypes";

export interface ButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    children?: ReactNode,
    className?: string,
    color?: Themes,
    size?: number,
    animations?: Animation[]
}

type Animation = 'base' | 'success' | 'danger' 