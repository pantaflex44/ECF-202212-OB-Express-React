import React, { useEffect, useState, useContext, createRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BeatLoader from "react-spinners/BeatLoader";

import env from "../../env.json";

import { ApiContext } from "../components/ApiProvider";
import InputEmail from "../components/InputEmail";

import { AiOutlineHome, AiOutlineMail, AiOutlineSearch } from "react-icons/ai";

export default function PasswordLost() {
    const api = useContext(ApiContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: { value: "", isValid: false }
    });
    const [sending, setSending] = useState(false);
    const [sended, setSended] = useState(false);

    const submitRef = createRef();

    function handleSubmit(e) {
        e.preventDefault();
        if (!formData.email.isValid) return;

        setSending(true);

        api.passwordLost(
            formData.email.value,
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

    return (
        <>
            <Helmet>
                <title>{env.APP_NAME} - Retrouver mon mot de passe</title>
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
                        <AiOutlineHome />
                    </div>
                    <span className="chevron">»</span>
                    <span>Retrouver mon mot de passe</span>
                </h2>

                {sended ? (
                    <>
                        <div className="row">
                            <AiOutlineMail size={160} className="light" />
                            <p style={{ maxWidth: "50%" }}>
                                Un email vient d'être envoyé dans votre boite. Suivez les indications pour définir un
                                nouveau mot de passe.
                                <br />
                                <br />A bientôt.
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <p>
                            Vous avez perdu votre mot de passe? Pas de panique, nous vous proposons de redéfinir un
                            nouveau mot de passe en toute sécurité. Il vous faudra remplir ce formulaire et suivre les
                            instructions dans le mail qui vous sera envoyé.
                        </p>
                        <div className="row">
                            <div className="colLeft shrink mobileHide">
                                <AiOutlineSearch size={192} />
                            </div>
                            <div className="colRight grow">
                                <div className="formBox noMargin">
                                    <form onSubmit={handleSubmit} className="lg">
                                        <div className="formRow">
                                            <label htmlFor="email">Email</label>
                                            <InputEmail
                                                name="email"
                                                id="email"
                                                placeholder="adresse email de connexion"
                                                value={formData.email.value}
                                                onChange={(value) => {
                                                    handleChange("email", { value });
                                                }}
                                                onValid={(isValid) => {
                                                    handleChange("email", { isValid });
                                                }}
                                                checkExists={false}
                                                checkReverse={false}
                                                disabled={sending || sended}
                                            />
                                        </div>
                                        <div className="formRow">
                                            {sending ? (
                                                <div className="spinner">
                                                    <BeatLoader size={16} />
                                                </div>
                                            ) : (
                                                <input
                                                    type="submit"
                                                    value={"envoyer"}
                                                    title={"réinitialiser mon mot de passe"}
                                                    disabled={
                                                        api.httpError ||
                                                        !formData.email.isValid ||
                                                        formData.email.value === "" ||
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
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
