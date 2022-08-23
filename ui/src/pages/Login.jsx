import React, { useEffect, useState, useContext, createRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import env from "../../env.json";

import { ApiContext } from "../components/ApiProvider";
import InputEmail from "../components/InputEmail";
import InputPassword from "../components/InputPassword";
import Switch from "../components/Switch";
import BeatLoader from "react-spinners/BeatLoader";

import { BsFillLockFill } from "react-icons/bs";

export default function Index() {
    const api = useContext(ApiContext);
    const navigate = useNavigate();

    const credentials = api.getSavedCredentials();
    const [formData, setFormData] = useState({
        email: { value: credentials.email, isValid: false },
        password: { value: credentials.password, isValid: false },
        save: credentials.email !== "" && credentials.password !== ""
    });
    const [connecting, setConnecting] = useState(false);

    const submitRef = createRef();

    function handleLogin(e) {
        e.preventDefault();
        if (!(formData.email.isValid && formData.password.isValid)) return;

        submitRef.current.disabled = true;
        setConnecting(true);

        api.login(formData.email.value, formData.password.value, formData.save);
    }

    function handleChange(type, value) {
        setFormData((oldFormData) => {
            return { ...oldFormData, [type]: { ...oldFormData[type], ...value } };
        });

        api.resetHttpError();
    }

    useEffect(() => {
        setConnecting(false);
    }, [api?.httpError]);

    return (
        <>
            <Helmet>
                <title>{env.APP_NAME} - Connexion</title>
            </Helmet>
            <div className="page">
                <h2>Connexion</h2>
                <p>
                    Gérants, Franchises, Structures, connectez-vous pour accéder à votre contrat. Controllez vos droits
                    et permissions.
                </p>

                <div className="row">
                    <div className="colLeft shrink mobileHide">
                        <BsFillLockFill size={192} />
                    </div>
                    <div className="colRight grow">
                        <div className="formBox noMargin">
                            <form onSubmit={handleLogin}>
                                <div className="formRow">
                                    <label htmlFor="email">Email</label>
                                    <InputEmail
                                        name="email"
                                        id="email"
                                        placeholder="adresse email de connexion"
                                        autoComplete="off"
                                        value={formData.email.value}
                                        onChange={(value) => {
                                            handleChange("email", { value });
                                        }}
                                        onValid={(isValid) => {
                                            handleChange("email", { isValid });
                                        }}
                                    />
                                </div>

                                <div className="formRow">
                                    <label htmlFor="email">Mot de passe</label>
                                    <InputPassword
                                        name="password"
                                        id="password"
                                        placeholder="mot de passe associé"
                                        autoComplete="off"
                                        validate={false}
                                        value={formData.password.value}
                                        onChange={(value) => {
                                            handleChange("password", { value });
                                        }}
                                        onValid={(isValid) => {
                                            handleChange("password", { isValid });
                                        }}
                                    />
                                </div>

                                <div className="formRow">
                                    <Switch
                                        label="Mémoriser mes identifiants."
                                        name="save"
                                        checked={formData.save}
                                        onChange={(state) => {
                                            setFormData((oldFormData) => {
                                                return { ...oldFormData, save: state };
                                            });
                                        }}
                                    />
                                </div>

                                <div className="formCol reverse">
                                    <div className="formRow noPadding">
                                        <input
                                            type="button"
                                            value={"mot de passe oublié"}
                                            onClick={() => {
                                                navigate("/passwordlost", { replace: false });
                                            }}
                                        />
                                    </div>
                                    {connecting ? (
                                        <div className="spinner">
                                            <BeatLoader size={16} />
                                        </div>
                                    ) : (
                                        <div className="formRow noPadding">
                                            <input
                                                type="submit"
                                                value={"connecter"}
                                                title={"se connected"}
                                                disabled={
                                                    !(formData.email.isValid && formData.password.isValid) ||
                                                    api.httpError
                                                }
                                                ref={submitRef}
                                            />
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
