import { DetailedHTMLProps, HTMLAttributes } from "react";
import { RoomInterface } from "../../globalTypes";

export interface RoomProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    room: RoomInterface,
    className?: string
}