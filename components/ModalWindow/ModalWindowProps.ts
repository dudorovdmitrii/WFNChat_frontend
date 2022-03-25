import { DetailedHTMLProps, HTMLAttributes } from "react";
import { Themes } from "../../globalTypes";

export interface ModalWindowProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    className?: string,
    theme?: Themes
}