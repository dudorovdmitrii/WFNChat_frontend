import { DetailedHTMLProps, HTMLAttributes } from "react";

export interface ChatProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    className?: string,
    exit?: () => void
}
export default ChatProps