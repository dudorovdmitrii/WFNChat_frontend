import { DetailedHTMLProps, HTMLAttributes } from "react";
import { WebSocketMessageInterface } from "../../WebSocket/WebSocketInterface";

export interface MessageProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    message: WebSocketMessageInterface,
    className?: string,
    index: number,
    setHeights: (index: number, size: number) => void
}