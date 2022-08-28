import React, { useState, useEffect, createRef, forwardRef, useImperativeHandle } from "react";

const Switch = forwardRef((props, ref) => {
    const { onChange = null, label = "", checked = false, readOnly = false, ...rest } = props;
    const [state, setState] = useState(checked);

    const switchRef = createRef();

    useImperativeHandle(ref, () => ({
        set(state) {
            setState(state);
        },
        get() {
            return state;
        },
        toggle() {
            setState((oldState) => !oldState);
        }
    }));

    useEffect(() => {
        if (onChange) onChange(state);
    }, [state, setState]);

    useEffect(() => {
        setState(checked);
    }, [checked]);

    return (
        <div className={`switchBox ${readOnly ? "disabled" : ""}`.trim()}>
            <label className="switch" htmlFor={rest.name}>
                <input
                    name={rest.name}
                    id={rest.name}
                    type="checkbox"
                    checked={state}
                    onChange={() => {
                        setState((oldState) => !oldState);
                    }}
                    {...rest}
                    ref={switchRef}
                />
                <span></span>
            </label>
            <span>{label}</span>
        </div>
    );
});

export default Switch;
