import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { Themes } from "../../globalTypes";

export interface FormInputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    className?: string,
    color?: Themes,
    incorrect?: boolean
}