import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import { Themes } from "../../globalTypes";

export interface FormProps extends DetailedHTMLProps<HTMLAttributes<HTMLFormElement>, HTMLFormElement> {
    children?: ReactNode,
    className?: string,
    color?: Themes
}