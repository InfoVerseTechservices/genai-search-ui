'use client'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, ReactNode } from 'react'
import { usePopper } from 'react-popper'
import type { Placement, Modifier } from '@popperjs/core'

interface DropdownProps {
    button: ReactNode
    children: ReactNode
    placement?: Placement
    offset?: [number, number]
    btnClassName?: string
}

interface DropdownRef {
    close: () => void
}

const Dropdown = (props: DropdownProps, forwardedRef: React.Ref<DropdownRef>) => {
    const [visibility, setVisibility] = useState(false)

    const referenceRef = useRef<HTMLButtonElement>(null)
    const popperRef = useRef<HTMLDivElement>(null)

    const { styles, attributes } = usePopper(referenceRef.current, popperRef.current, {
        placement: props.placement || 'bottom-end',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: props.offset || [0, 0],
                },
            },
        ] as unknown as Array<Modifier<string, any>>,
    });

    const handleDocumentClick = (event: MouseEvent) => {
        if (
            referenceRef.current?.contains(event.target as Node) ||
            popperRef.current?.contains(event.target as Node)
        ) {
            return;
        }

        setVisibility(false);
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        document.addEventListener('mousedown', handleDocumentClick)
        return () => {
            document.removeEventListener('mousedown', handleDocumentClick)
        }
    }, [])

    useImperativeHandle(forwardedRef, () => ({
        close() {
            setVisibility(false)
        },
    }));

    return (
        <>
            <button ref={referenceRef} className={props.btnClassName} onClick={() => setVisibility(!visibility)}>
                {props.button}
            </button>

            <div
                ref={popperRef}
                style={styles.popper}
                {...attributes.popper}
                className="z-40"
                onClick={() => setVisibility(!visibility)}
            >
                {visibility && props.children}
            </div>
        </>
    );
};

export default forwardRef(Dropdown)