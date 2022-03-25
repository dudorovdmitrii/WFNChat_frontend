import { DetailedHTMLProps, HTMLAttributes } from "react";

export interface ProfileProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    className?: string
}