import React, { useState, createRef, useEffect } from "react";
import { BsBackspace } from "react-icons/bs";

export default function InputAddress({ onChange = null, onClearText = null, readOnly = false, rows = 4, ...props }) {
    const [value, setValue] = useState(props.value || "");

    const textRef = createRef();

    function handleChange(e) {
        e.preventDefault();

        const data = e.target.value || "";
        setValue(data);
        if (onChange) onChange(data);
    }

    function handleClear(e) {
        e.preventDefault();

        setValue("");

        if (onClearText) onClearText();
    }

    useEffect(() => {
        setValue(props.value || "");
    }, [props.value]);

    return (
        <div className="inputBox">
            <textarea onChange={handleChange} {...props} ref={textRef} readOnly={readOnly} rows={rows} value={value} />
            {!readOnly && onClearText && value !== "" && (
                <div className="textClear" onClick={handleClear} title={"Effacer"}>
                    <BsBackspace />
                </div>
            )}
        </div>
    );
}
