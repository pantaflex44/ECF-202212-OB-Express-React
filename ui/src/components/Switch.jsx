import React, { useState, useEffect, createRef } from "react";

export default function Switch({ onChange = null, label = "", checked = false, readOnly = false, ...props }) {
    const [state, setState] = useState(checked);

    const switchRef = createRef();

    useEffect(() => {
        if (onChange) onChange(state);
    }, [state, setState]);

    useEffect(() => {
        setState(checked);
    }, [checked]);

    return (
        <div className={`switchBox ${readOnly ? "disabled" : ""}`.trim()}>
            <label className="switch" htmlFor={props.name}>
                <input
                    name={props.name}
                    id={props.name}
                    type="checkbox"
                    checked={state}
                    onChange={() => {
                        setState((oldState) => !oldState);
                    }}
                    {...props}
                    ref={switchRef}
                />
                <span></span>
            </label>
            <span>{label}</span>
        </div>
    );
}
