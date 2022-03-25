import { DetailedHTMLProps, HTMLAttributes } from "react";

export interface AnonymousProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    className?: string
}