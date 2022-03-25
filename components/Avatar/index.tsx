import cn from 'classnames'
import { observer } from 'mobx-react-lite'

import { AvatarProps } from './AvatarProps'

import styles from './Avatar.module.scss'

export const Avatar = observer(({ object, className, edgeType, size, cursor, cover, title, ...props }: AvatarProps): JSX.Element => {
    const photoWrapperClassName = cn(
        className,
        {
            [styles.pointer]: cursor === 'pointer',
            [styles.size300]: size === 300,
            [styles.size90]: size === 90,
            [styles.size86]: size === 86,
            [styles.size54]: size === 54,
            [styles.size36]: size === 36
        })
    const photoClassName = cn(
        styles.photo,
        {
            [styles.cover]: cover,
            [styles.round6]: edgeType === 'round_6',
            [styles.circle]: edgeType === 'circle',
        })
    return (
        <div className={photoWrapperClassName} {...props}>
            {
                object && object?.photo
                    ?
                    <img title={title} src={object.photo} className={photoClassName} alt={'фото'} width={90} height={90} />
                    :
                    object && Object.prototype.hasOwnProperty.call(object, 'isGroup')
                        ?
                        <img title={title} width={90} height={90} alt={'фото'} src={'/photos/noAvatarGroup.webp'} className={photoClassName} />
                        :
                        <img title={title} width={300} height={300} alt={'фото'} src={'/photos/noAvatar.webp'} className={photoClassName} />
            }
        </div>
    )
})
Avatar.displayName = 'Avatar'