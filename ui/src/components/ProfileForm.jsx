import React, { useState, useContext, useEffect } from "react";
import { BsHurricane, BsLightbulb, BsSave } from "react-icons/bs";

import { ApiContext } from "./ApiProvider";
import InputEmail from "./InputEmail";
import InputPassword from "./InputPassword";
import InputName from "./InputName";
import Switch from "./Switch";
import InputAddress from "./InputAddress";
import InputPhone from "./InputPhone";
import InputDescription from "./InputDescription";
import Toast from "./Toast";

export default function ProfileForm({ account, editMode = false, onChange = null, onSave = null }) {
    const api = useContext(ApiContext);

    const [lastChanges, setLastChanges] = useState({});
    const [formData, setFormData] = useState({ ...account });
    const [validations, setValidations] = useState({ email: true, password: true, name: true, gsm: true });

    function handleSubmit(e) {
        e.preventDefault();
    }

    function handleChange(type, value) {
        setFormData((oldFormData) => {
            setLastChanges((oldLastChanges) => {
                if (!oldLastChanges.hasOwnProperty(type)) {
                    return { ...oldLastChanges, [type]: oldFormData[type] };
                } else {
                    return { ...oldLastChanges };
                }
            });

            return { ...oldFormData, [type]: value };
        });

        api.resetHttpError();
    }

    function resetLastChanges() {
        for (const key of Object.keys(lastChanges)) {
            handleChange(key, lastChanges[key]);
        }

        setLastChanges({});
    }

    useEffect(() => {
        if (Object.entries(formData).toString() !== Object.entries(account).toString()) {
            if (onChange) onChange(formData);
        }
    }, [formData]);

    useEffect(() => {
        if (editMode && !formData.active) {
            if (!confirm("Confirmez-vous la désactivation du compte utilisateur?")) {
                handleChange("active", true);
            }
        }
    }, [editMode, formData.active]);

    useEffect(() => {
        if (!editMode && Object.entries(account).toString() !== Object.entries(formData).toString()) {
            const allValidated = Object.values(validations).every((v) => v);
            if (!allValidated) {
                alert("Des erreurs ont été détectées dans le formulaire.");

                resetLastChanges();
                return;
            }

            if (confirm("Des informations ont été modifiées, souhaitez-vous les enregistrer?")) {
                if (onSave) onSave({ ...formData });
            } else {
                resetLastChanges();
            }
        }
    }, [editMode]);

    return (
        <div className="profileForm">
            <img className="avatar" src={formData.avatar_url} title={formData.name} />
            <div className="formBox noMargin">
                {editMode && (
                    <div className="formRow noPadding">
                        <p>
                            <small>
                                <em>
                                    Pour enregistrer vos modifications, cliquez sur l'icone <BsSave />
                                </em>
                            </small>
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="multiCol">
                    <div className="formCol">
                        <div className="formRow noPadding">
                            <label htmlFor="email">
                                Adresse email du compte <b>*</b>
                            </label>
                            <InputEmail
                                name="email"
                                id="email"
                                placeholder=""
                                autoComplete="off"
                                value={formData.email}
                                defaultValue={account.email}
                                onChange={(value) => {
                                    handleChange("email", value);
                                }}
                                onValid={(isValid) => {
                                    setValidations((oldValidations) => {
                                        return { ...oldValidations, email: isValid };
                                    });
                                }}
                                checkExists={editMode}
                                readOnly={!editMode}
                            />
                        </div>

                        <div className="formRow noPadding">
                            <label>Mot de passe</label>
                            {editMode && (
                                <>
                                    {api.currentUser.account.email === account.email && (
                                        <InputPassword
                                            name="password"
                                            id="password"
                                            placeholder="nouveau mot de passe. laisser vide pour ne pas le modifier."
                                            autoComplete="off"
                                            validate={true}
                                            value={formData.password}
                                            onChange={(value) => {
                                                handleChange("password", value);
                                            }}
                                            onValid={(isValid, value) => {
                                                setValidations((oldValidations) => {
                                                    return {
                                                        ...oldValidations,
                                                        password: value !== "" ? isValid : true
                                                    };
                                                });
                                            }}
                                        />
                                    )}
                                    {api.currentUser.account.email !== account.email &&
                                        api.currentUser.account.is_admin && (
                                            <div className="resetPassword">
                                                <span>
                                                    <a href="javascript: void(0)" title="">
                                                        <BsHurricane /> Redéfinir le mot de passe aléatoirement
                                                    </a>
                                                </span>
                                            </div>
                                        )}
                                </>
                            )}
                            <p>
                                <small>
                                    Pour des raisons de sécurité, le mot de passe actuel ne peut être récupéré.
                                </small>
                            </p>
                        </div>
                    </div>

                    <div className="formCol">
                        <div className="formRow noPadding">
                            <label htmlFor="name">
                                Votre nom <b>*</b>
                            </label>
                            <InputName
                                name="name"
                                id="name"
                                placeholder="comment vous appele t'on?"
                                autoComplete="off"
                                value={formData.name}
                                onChange={(value) => {
                                    handleChange("name", value);
                                }}
                                onValid={(isValid) => {
                                    setValidations((oldValidations) => {
                                        return { ...oldValidations, name: isValid };
                                    });
                                }}
                                onClearText={() => {
                                    handleChange("name", "");
                                }}
                                readOnly={!editMode}
                                checkExists={true}
                            />
                        </div>
                        <div className="formRow noPadding">
                            <label htmlFor="active" style={{ marginBottom: "6px" }}>
                                Etat du compte
                            </label>
                            {api.currentUser.account.email === account.email && (
                                <p>
                                    <small>Vous ne pouvez pas activer ou désactiver votre propre compte.</small>
                                </p>
                            )}
                            {api.currentUser.account.email !== account.email && (
                                <Switch
                                    label={`Compte ${formData.active ? "activé" : "désactivé"}`}
                                    title="Etat du compte"
                                    name="active"
                                    checked={formData.active}
                                    onChange={(state) => {
                                        handleChange("active", state);
                                    }}
                                    readOnly={!editMode || api.currentUser.account.email === account.email}
                                />
                            )}
                        </div>
                    </div>

                    <Toast
                        name="profil_avatar"
                        message={
                            <>
                                L'application utilise le service{" "}
                                <a href="https://fr.gravatar.com/" target="_blank">
                                    Gravatar
                                </a>{" "}
                                pour illuster le compte utilisateur. Pour fonctionner correctement, l'adresse email de
                                connexion doit être identique à celle utilisée pour le compte{" "}
                                <a href="https://fr.gravatar.com/" target="_blank">
                                    Gravatar
                                </a>
                                .
                            </>
                        }
                    />

                    <div className="formRow noPadding">
                        <h4>Informations complémentaires</h4>
                    </div>

                    <div className="formRow noPadding">
                        <label htmlFor="description">Description</label>
                        <InputDescription
                            name="description"
                            id="description"
                            placeholder="un petit mot?"
                            value={formData.description}
                            onChange={(value) => {
                                handleChange("description", value);
                            }}
                            onClearText={() => {
                                handleChange("description", "");
                            }}
                            readOnly={!editMode}
                        />
                    </div>

                    <div className="formCol">
                        <div className="formRow noPadding">
                            <label htmlFor="postal_address">Adresse postale</label>
                            <InputAddress
                                name="postal_address"
                                id="postal_address"
                                placeholder="aucune adresse connue"
                                value={formData.postal_address}
                                onChange={(value) => {
                                    handleChange("postal_address", value);
                                }}
                                onClearText={() => {
                                    handleChange("postal_address", "");
                                }}
                                readOnly={!editMode}
                            />
                        </div>
                        <div className="formRow noPadding">
                            <label htmlFor="gsm">Téléphone</label>
                            <InputPhone
                                name="gsm"
                                id="gsm"
                                placeholder="aucun numéro connu"
                                value={formData.gsm}
                                onChange={(value) => {
                                    handleChange("gsm", value);
                                }}
                                onClearText={() => {
                                    handleChange("gsm", "");
                                }}
                                readOnly={!editMode}
                                phonePattern={/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/}
                                phonePatternSample="0102030405 / +33102030405 / 0033102030405"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
