import React, { useState, useEffect, createRef, useContext } from "react";
import { BsBackspace } from "react-icons/bs";
import { capitalize } from "../js/functions";

import { ApiContext } from "./ApiProvider";

export default function InputName({
    onChange = null,
    onValid = null,
    onClearText = null,
    validMessage = "",
    existsMessage = "ce nom est déjà employé.",
    invalidMessage = "format incorrect.",
    requestedMessage = "requis.",
    checkExists = false,
    readOnly = false,
    ...props
}) {
    const api = useContext(ApiContext);

    const initialValue = props.value || "";

    const inputType = "text";
    const [value, setValue] = useState(initialValue);
    const [validated, setValidated] = useState(true);
    const [requested, setRequested] = useState(true);
    const [nameExists, setNameExists] = useState(false);

    const inputRef = createRef();

    const isValid = (testValue) => {
        return /^[A-Za-z\s\\-\\.\\_]+$/.test(testValue);
    };

    useEffect(() => {
        let existsCheck = null;
        const validation = isValid(value.trim());

        if (value !== "") {
            setNameExists(false);
            setValidated(validation);
            setRequested(false);

            if (validation && value !== initialValue) {
                if (checkExists) {
                    if (existsCheck) clearTimeout(existsCheck);

                    existsCheck = setTimeout(async () => {
                        setNameExists(await api.nameExists(value));
                    }, 500);
                }
            }
        } else {
            setRequested(true);
            setValidated(false);
        }

        return () => {
            if (existsCheck) clearTimeout(existsCheck);
        };
    }, [value]);

    useEffect(() => {
        if (onValid) onValid(validated && !nameExists, value);
    }, [value, validated, nameExists]);

    useEffect(() => {
        if (readOnly) {
            setRequested(false);
            setValidated(true);
        }
    });

    useEffect(() => {
        setValue(props.value || "");
    }, [props.value]);

    function handleChange(e) {
        e.preventDefault();

        const data = capitalize((e.target.value || "").trim());
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
            <div className={`inputValidator ${!validated || requested || nameExists ? "invalid" : "valid"}`.trim()}>
                {validated
                    ? nameExists
                        ? existsMessage
                        : validMessage
                    : requested
                    ? requestedMessage
                    : invalidMessage}
            </div>
        </div>
    );
}
