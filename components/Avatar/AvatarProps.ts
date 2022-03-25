import { DetailedHTMLProps, HTMLAttributes } from "react";

export interface AvatarProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    object?:
    {
        photo: string
        isGroup?: boolean
    },
    title?: string,
    className?: string,
    edgeType?: 'circle' | 'round_6',
    size?: number,
    cursor?: 'pointer',
    cover?: boolean
}