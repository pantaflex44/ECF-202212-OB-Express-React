import React, { useState } from "react";

import { AiOutlinePlusCircle, AiOutlineMinusCircle } from "react-icons/ai";

export default function TabItemPanel({
    title,
    titleIcon = null,
    initialOpepend = false,
    closedTitle = null,
    children
}) {
    const [opened, setOpened] = useState(initialOpepend);

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
                        {!opened && closedTitle ? <span className="closedTitle">({closedTitle})</span> : null}
                    </h3>
                </div>
                {opened && titleIcon}
            </div>
            <div className={`tabItemContent ${opened ? "opened" : "closed"}`.trim()}>{children}</div>
        </div>
    );
}
