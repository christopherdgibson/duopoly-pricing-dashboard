import { CSSProperties, JSX, useState } from 'react';

import styles from '../App/App.module.css'

interface ExpandableMenuProps {
    title: string;
    className?: string;
    classTitle?: string;
    style?: CSSProperties;
    startExpanded?: boolean;
    expandElement: JSX.Element;
    override?: boolean
}

export function ExpandableMenu({title, className = styles.expandBtn, classTitle = styles.subTitle, style, startExpanded = true, expandElement, override }: ExpandableMenuProps) {
    const [isExpanded, setIsExpanded] = useState<boolean>(startExpanded);

    return (
        <div className={className} style={style}>
            <h3 className={`${classTitle} ${styles.expandTitle}`} aria-expanded={isExpanded} onClick={(e) => setIsExpanded(prev => !prev)}>
                {title}
                <svg className={styles.expandChevron} width="12" height="12" viewBox="0 0 12 12">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
            </h3>
            <div className={styles.expandGroup} style={isExpanded ? {maxHeight:'2500px'} : {maxHeight:0}}>
                <div className={styles.expandGroupInner}>
                    {expandElement}
                </div>
            </div>
        </div>
    )
}