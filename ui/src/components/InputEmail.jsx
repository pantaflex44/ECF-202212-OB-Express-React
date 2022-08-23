import React, { useState, useEffect, createRef, useContext } from "react";

import { ApiContext } from "./ApiProvider";

export default function InputEmail({
    onChange = null,
    onValid = null,
    validMessage = "",
    existsMessage = "cette adresse email est déjà utilisée.",
    invalidMessage = "format incorrect.",
    existsErrorMessage = "erreur interne!",
    checkExists = false,
    checkReverse = false,
    readOnly = false,
    defaultValue = "",
    ...props
}) {
    const api = useContext(ApiContext);

    const initialValue = props.value || "";

    const inputType = "email";
    const [value, setValue] = useState(initialValue);
    const [validated, setValidated] = useState(true);
    const [existsError, setExistsError] = useState(false);
    const [emailExists, setEmailExists] = useState(false);

    const inputRef = createRef();

    const isValid = (testValue) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(testValue);
    };

    useEffect(() => {
        let existsCheck = null;
        const validation = isValid(value);

        if (value !== "") {
            setExistsError(false);
            setEmailExists(checkReverse);
            setValidated(validation);

            if (validation && value !== defaultValue) {
                if (checkExists) {
                    if (existsCheck) clearTimeout(existsCheck);

                    existsCheck = setTimeout(async () => {
                        try {
                            const exists = await api.emailExists(value);
                            setEmailExists(checkReverse ? !exists : exists);
                        } catch (err) {
                            setExistsError(true);
                        }
                    }, 500);
                }
            }
        } else {
            setValidated(true);
        }

        return () => {
            if (existsCheck) clearTimeout(existsCheck);
        };
    }, [value]);

    useEffect(() => {
        if (onValid) onValid(validated && !emailExists, value);
    }, [value, validated, emailExists]);

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

        const data = (e.target.value || "").trim().toLowerCase();
        setValue(data);
        if (onChange) onChange(data);
    }

    return (
        <div className="inputBox">
            <input
                type={inputType}
                value={value}
                onChange={handleChange}
                {...props}
                ref={inputRef}
                required={true}
                readOnly={readOnly}
            />
            <div className={`inputValidator ${!validated || emailExists || existsError ? "invalid" : "valid"}`.trim()}>
                {validated
                    ? existsError
                        ? existsErrorMessage
                        : emailExists && !checkReverse
                        ? existsMessage
                        : validMessage
                    : invalidMessage}
            </div>
        </div>
    );
}
