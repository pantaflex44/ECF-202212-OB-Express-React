import React, { useState, useEffect } from "react";
import { createRef } from "react";

import { BsEye, BsEyeSlash, BsCircle, BsCheckCircle } from "react-icons/bs";

export default function InputPassword({
    validate = false,
    minLength = 8,
    testLowerCase = true,
    testUpperCase = true,
    testDigit = true,
    testSpecialChar = true,
    testMinLength = true,
    onChange = null,
    onValid = null,
    ...props
}) {
    const inputType = "password";
    const [value, setValue] = useState(props.value || "");
    const [hidden, setHidden] = useState(true);
    const inputRef = createRef();

    const toggleVisibility = (e) => {
        const state = !hidden;
        setHidden(state);

        if (state) {
            inputRef.current.classList.remove("revealed");
            inputRef.current.setAttribute("type", "password");
        } else {
            inputRef.current.classList.add("revealed");
            inputRef.current.setAttribute("type", "text");
        }
    };

    const hasLowerCase = (testValue) => (testLowerCase && new RegExp(`^(?=.*[a-z])`).test(testValue)) || !testLowerCase;
    const hasUpperCase = (testValue) => (testUpperCase && new RegExp(`^(?=.*[A-Z])`).test(testValue)) || !testUpperCase;
    const hasDigit = (testValue) => (testDigit && new RegExp(`^(?=.*[0-9])`).test(testValue)) || !testDigit;
    const hasSpecialChar = (testValue) =>
        (testSpecialChar &&
            new RegExp(
                `^(?=.*[\\!\\@\\#\\$\\%\\^\\&\\*\\)\\(\\+\\=\\.\\<\\>\\{\\}\\[\\]\\:\\;\\'\\"\\|\\~\`\\_\\-])`
            ).test(testValue)) ||
        !testSpecialChar;
    const hasMinLength = (testValue) =>
        (testMinLength && new RegExp(`^(?=.{${minLength},})`).test(testValue)) || !testMinLength;

    const isValid = (testValue) => {
        return (
            hasLowerCase(testValue) &&
            hasUpperCase(testValue) &&
            hasDigit(testValue) &&
            hasSpecialChar(testValue) &&
            hasMinLength(testValue)
        );
    };

    useEffect(() => {
        if (onValid) onValid(validate ? isValid(value) : value.length > 0, value);
    }, [value]);

    useEffect(() => {
        setValue(props.value || "");
    }, [props.value]);

    function handleChange(e) {
        e.preventDefault();

        const data = (e.target.value || "").trim();
        setValue(data);
        if (onChange) onChange(data);
    }

    return (
        <div className="passwordBox">
            <input type={inputType} value={value} onChange={handleChange} {...props} ref={inputRef} />
            <div
                className="passwordRevelator"
                onClick={toggleVisibility}
                title={`${hidden ? "Afficher" : "Cacher"} le mot de passe`}
            >
                {hidden ? <BsEyeSlash /> : <BsEye />}
            </div>
            {validate && (
                <ul className="passwordRules">
                    {testLowerCase && (
                        <li>
                            <div className="bullet">
                                {hasLowerCase(value) ? <BsCheckCircle color={"darkslategray"} /> : <BsCircle />}
                            </div>
                            <span>minimum 1 caractère minuscule</span>
                        </li>
                    )}
                    {testUpperCase && (
                        <li>
                            <div className="bullet">
                                {hasUpperCase(value) ? <BsCheckCircle color={"darkslategray"} /> : <BsCircle />}
                            </div>
                            <span>minimum 1 caractère majuscule</span>
                        </li>
                    )}
                    {testDigit && (
                        <li>
                            <div className="bullet">
                                {hasDigit(value) ? <BsCheckCircle color={"darkslategray"} /> : <BsCircle />}
                            </div>
                            <span>minimum 1 caractère numérique</span>
                        </li>
                    )}
                    {testSpecialChar && (
                        <li>
                            <div className="bullet">
                                {hasSpecialChar(value) ? <BsCheckCircle color={"darkslategray"} /> : <BsCircle />}
                            </div>
                            <span>minimum 1 caractère spécial</span>
                        </li>
                    )}
                    {testMinLength && (
                        <li>
                            <div className="bullet">
                                {hasMinLength(value) ? <BsCheckCircle color={"darkslategray"} /> : <BsCircle />}
                            </div>
                            <span>minimum {minLength} caractères</span>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
