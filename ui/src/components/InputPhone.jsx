import React, { useState, useEffect, createRef } from "react";
import { BsBackspace } from "react-icons/bs";

export default function InputPhone({
    onChange = null,
    onValid = null,
    onClearText = null,
    validMessage = "",
    invalidMessage = "format incorrect.",
    readOnly = false,
    phonePattern = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    phonePatternSample = "0102030405 / +33102030405 / 0033102030405",
    ...props
}) {
    const initialValue = props.value || "";

    const inputType = "tel";
    const [value, setValue] = useState(initialValue);
    const [validated, setValidated] = useState(true);

    const inputRef = createRef();

    const isValid = (testValue) => {
        return phonePattern.test(testValue);
    };

    useEffect(() => {
        const validation = isValid(value.trim());

        if (value !== "") {
            setValidated(validation);
        } else {
            setValidated(true);
        }
    }, [value]);

    useEffect(() => {
        if (onValid) onValid(validated, value);
    }, [value, validated]);

    useEffect(() => {
        if (readOnly) {
            setValidated(true);
        }
    });

    useEffect(() => {
        setValue(props.value || "");
    }, [props.value]);

    function handleChange(e) {
        e.preventDefault();

        const data = (e.target.value || "").trim();
        setValue(data);
        if (onChange) onChange(data);
    }

    function handleClear(e) {
        e.preventDefault();

        setValue("");

        if (onClearText) onClearText();
    }

    return (
        <div className="inputBox">
            <input
                type={inputType}
                value={value}
                onChange={handleChange}
                {...props}
                ref={inputRef}
                readOnly={readOnly}
                required={true}
            />
            {!readOnly && onClearText && value !== "" && (
                <div className="textClear" onClick={handleClear} title={"Effacer"}>
                    <BsBackspace />
                </div>
            )}
            <div className={`inputValidator ${!validated ? "invalid" : "valid"}`.trim()}>
                {validated ? validMessage : invalidMessage}
            </div>
            {!readOnly && (
                <p>
                    <small>eg: {phonePatternSample}</small>
                </p>
            )}
        </div>
    );
}
