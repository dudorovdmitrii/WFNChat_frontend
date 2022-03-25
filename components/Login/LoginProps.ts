import { DetailedHTMLProps, HTMLAttributes } from "react";

export interface LoginProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    className?: string
}

export interface loginFormInterface extends HTMLFormElement {
    elements: formElementsInterface
}

interface formElementsInterface extends HTMLFormControlsCollection {
    username: HTMLInputElement,
    password: HTMLInputElement
}
