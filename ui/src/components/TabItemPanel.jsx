import React, { useState, useImperativeHandle, forwardRef, createRef, useEffect } from "react";

import { AiOutlinePlusCircle, AiOutlineMinusCircle } from "react-icons/ai";

const TabItemPanel = forwardRef((props, ref) => {
    const {
        title,
        titleIcon = null,
        initialOpepend = false,
        closedTitle = null,
        onClosed = null,
        onOpened = null,
        children
    } = props;

    const [opened, setOpened] = useState(initialOpepend);

    const contentRef = createRef();

    useImperativeHandle(ref, () => ({
        open() {
            setOpened(true);
        },
        close() {
            setOpened(false);
        },
        toggle() {
            setOpened((oldState) => !oldState);
        }
    }));

    useEffect(() => {
        if (opened && onOpened) onOpened();
        if (!opened && onClosed) onClosed();
    }, [opened]);

    return (
        <div className="tabItemPanel">
            <div className="tabItemTitle">
                <div
                    className="tabItemTitleDetails"
                    onClick={() => {
                        setOpened((oldState) => !oldState);
                    }}
                    title={!opened ? "Développer" : "Réduire"}
                >
                    <div className="tabItemTitleChevron">
                        {!opened ? <AiOutlinePlusCircle /> : <AiOutlineMinusCircle />}
                    </div>
                    <h3>
                        {title}
                        {closedTitle ? <span className="closedTitle">({closedTitle})</span> : null}
                    </h3>
                </div>
                {opened && titleIcon}
            </div>
            <div className={`tabItemContent ${opened ? "opened" : "closed"}`.trim()} ref={contentRef}>
                {children}
            </div>
        </div>
    );
});

export default TabItemPanel;
