import React, { useState, useEffect } from "react";

import { BsLightbulb, BsXLg } from "react-icons/bs";

export default function Toast({ name, message, icon = null, closable = true }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const savedState = localStorage.getItem(`${process.env.APP_NAME}_${name}_toast`);
        console.log(savedState);
        setShow(savedState !== "off" ? true : false);
    }, []);

    useEffect(() => {
        localStorage.setItem(`${process.env.APP_NAME}_${name}_toast`, show ? "on" : "off");
    }, [show]);

    return show ? (
        <div className={`infoLine ${closable ? "closable" : ""}`.trim()}>
            {icon ?? <BsLightbulb className="infoLineIcon" size="40vmin" />}
            <p className="infoLineText">
                <small>{message}</small>
            </p>
            {closable && (
                <div
                    className="closer"
                    title="Ne plus afficher"
                    onClick={() => {
                        setShow(false);
                    }}
                >
                    <BsXLg />
                </div>
            )}
        </div>
    ) : null;
}
