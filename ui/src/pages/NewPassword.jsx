import React, { useEffect, useState, useContext, createRef } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BeatLoader from "react-spinners/BeatLoader";

import env from "../../env.json";

import { ApiContext } from "../components/ApiProvider";
import InputEmail from "../components/InputEmail";
import InputMultiline from "../components/InputMultiline";
import InputPassword from "../components/InputPassword";
import { BsHouse, BsCheck2Square } from "react-icons/bs";

export default function NewPassword() {
    const api = useContext(ApiContext);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        email: { value: "", isValid: false },
        password: { value: "", isValid: false },
        token: { value: "", isValid: false }
    });
    const [sending, setSending] = useState(false);
    const [sended, setSended] = useState(false);

    const submitRef = createRef();

    function handleSubmit(e) {
        e.preventDefault();
        if (!formData.email.isValid || !formData.password.isValid || !formData.token.isValid) return;

        setSending(true);

        api.newPassword(
            formData.token.value,
            formData.email.value,
            formData.password.value,
            (data) => {
                setSending(false);
                setSended(true);
            },
            (err) => {
                setSending(false);
                setSended(false);
            }
        );
    }

    function handleChange(type, value) {
        setFormData((oldFormData) => {
            return { ...oldFormData, [type]: { ...oldFormData[type], ...value } };
        });

        api.resetHttpError();
    }

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            setFormData((oldFormData) => {
                return { ...oldFormData, token: { value: token, isValid: true } };
            });
        }
    }, []);

    return (
        <>
            <Helmet>
                <title>{env.APP_NAME} - Redéfinir le mot de passe</title>
            </Helmet>
            <div className="page">
                <h2 className="breadcrumb">
                    <div
                        className="icon"
                        onClick={() => {
                            navigate("/", { replace: true });
                        }}
                        title="retourner à l'accueil"
                    >
                        <BsHouse />
                    </div>
                    <span className="chevron">»</span>
                    <span>Redéfinir le mot de passe</span>
                </h2>

                {sended ? (
                    <>
                        <div className="row">
                            <BsCheck2Square size={160} className="light" />
                            <p style={{ maxWidth: "50%" }}>
                                La modification du mot de passe a bien été prise en compte.
                                <br />
                                <br />
                                <NavLink to="/" replace={true}>
                                    Retourner à l'accueil
                                </NavLink>{" "}
                                pour se connecter.
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <p>
                            Bienvenue dans la procédure de création d'un nouveau mot de passe. Suivez les étapes
                            ci-dessous en remplissant le formulaire comme indiqué, puis <em>Validez</em> votre demande.
                        </p>
                        <div className="row">
                            <div className="formBox">
                                <form onSubmit={handleSubmit} className="lg">
                                    <div className="formRow noPadding">
                                        <label htmlFor="email">Adresse email du compte</label>
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
                                            checkExists={true}
                                            checkReverse={true}
                                            disabled={sending || sended}
                                        />
                                    </div>

                                    <div className="formRow noPadding">
                                        <label htmlFor="email">Nouveau mot de passe</label>
                                        <InputPassword
                                            name="password"
                                            id="password"
                                            placeholder="choisissez un nouveau mot de passe"
                                            autoComplete="off"
                                            minLength={8}
                                            testDigit={true}
                                            testLowerCase={true}
                                            testSpecialChar={true}
                                            testUpperCase={true}
                                            testMinLength={true}
                                            reType={true}
                                            validate={true}
                                            value={formData.password.value}
                                            onChange={(value) => {
                                                handleChange("password", { value });
                                            }}
                                            onValid={(isValid) => {
                                                handleChange("password", { isValid });
                                            }}
                                        />
                                    </div>

                                    <div className="formRow noPadding">
                                        {sending ? (
                                            <div className="spinner">
                                                <BeatLoader size={16} />
                                            </div>
                                        ) : (
                                            <input
                                                type="submit"
                                                value={"valider"}
                                                title={"valider ma demande"}
                                                disabled={
                                                    api.httpError ||
                                                    !formData.email.isValid ||
                                                    formData.email.value === "" ||
                                                    !formData.password.isValid ||
                                                    !formData.token.isValid ||
                                                    sending ||
                                                    sended
                                                }
                                                ref={submitRef}
                                            />
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
