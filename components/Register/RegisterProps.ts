import { DetailedHTMLProps, HTMLAttributes } from "react";

export interface RegisterProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    className?: string
}

export interface registerFormInterface extends HTMLFormElement {
    elements: formElementsInterface
}

export interface formElementsInterface extends HTMLFormControlsCollection {
    username: HTMLInputElement,
    password: HTMLInputElement,
    repeat_password: HTMLInputElement,
    email: HTMLInputElement,
    first_name: HTMLInputElement,
    last_name: HTMLInputElement,
    birthday: HTMLInputElement
}