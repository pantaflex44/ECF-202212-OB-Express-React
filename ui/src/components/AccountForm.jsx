import React, { useContext, useState, useEffect, createRef } from "react";

import { ApiContext } from "./ApiProvider";
import TabItem from "./TabItem";
import TabItemPanel from "./TabItemPanel";
import InputEmail from "./InputEmail";
import InputPassword from "./InputPassword";
import InputName from "./InputName";
import Switch from "./Switch";
import Toast from "./Toast";
import InputDescription from "./InputDescription";
import InputAddress from "./InputAddress";
import InputPhone from "./InputPhone";

import { FiRotateCcw, FiSave } from "react-icons/fi";

export default function AccountForm({ account }) {
    const api = useContext(ApiContext);

    const initialAccount = { ...account, password: "" };

    const [formData, setFormData] = useState(initialAccount);
    const [validations, setValidations] = useState({});
    const [accountRightIds, setAccountRightIds] = useState([]);
    const [availlableRights, setAvaillableRights] = useState([]);
    const [switchs, setSwitchs] = useState({ active: createRef() });

    const [editable, setEditable] = useState(api.currentUser.account.is_admin);
    const [locked, setLocked] = useState(true);

    const [updated, setUpdated] = useState(false);
    const [validated, setValidated] = useState(false);

    const [panels, setPanels] = useState({ profile: createRef(), rights: createRef() });

    function setRandomPassword() {}

    function handleChange(key, value) {
        setFormData((oldFormData) => {
            return { ...oldFormData, [key]: value };
        });
    }

    function handleRightChange(right, state) {
        if (state) {
            if (!accountRightIds.includes(right.id)) {
                setFormData((oldFormData) => {
                    return { ...oldFormData, rights: [...oldFormData.rights, right] };
                });
            }
        } else {
            if (accountRightIds.includes(right.id)) {
                setFormData((oldFormData) => {
                    return { ...oldFormData, rights: oldFormData.rights.filter((r) => r.id !== right.id) };
                });
            }
        }
    }

    function handleValidate(key, state) {
        setValidations((oldValidations) => {
            return { ...oldValidations, [key]: state };
        });
    }

    function handleCancel(confirmation = true) {
        if (confirmation) {
            if (confirm("Annuler toutes les modifications?")) setFormData({ ...initialAccount });
        } else {
            setFormData({ ...initialAccount });
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
    }

    useEffect(() => {
        api.getAllRights()
            .then((rights) => {
                rights.rights.forEach((r) => {
                    setSwitchs((oldSwitchs) => Object.assign(oldSwitchs, { [r.id]: createRef() }));
                });

                setAvaillableRights(rights.rights);
            })
            .catch((err) => {
                setAvaillableRights([]);
            });
    }, []);

    useEffect(() => {
        setAccountRightIds(Object.keys(formData.rights).map((key) => formData.rights[key].id));
    }, [formData.rights]);

    useEffect(() => {
        const isEqual = Object.entries(initialAccount).toString() === Object.entries(formData).toString();
        setUpdated(!isEqual);
    }, [formData]);

    useEffect(() => {
        const allValidated = Object.keys(validations).reduce((previous, current) => {
            return previous && validations[current];
        }, true);
        setValidated(allValidated);
    }, [validations]);

    return (
        <>
            <div className="toolbar">
                <div className="toolbarSide">
                    {editable && (
                        <Switch
                            label={
                                locked ? (
                                    <span className="">Lecture seule</span>
                                ) : (
                                    <span className="blink important">Edition</span>
                                )
                            }
                            name="lock"
                            checked={editable && !locked}
                            onChange={(state) => {
                                handleCancel(false);
                                setLocked(!state);
                            }}
                            readOnly={!editable}
                        />
                    )}
                </div>
                <div className="toolbarSide">
                    {editable && (
                        <>
                            <button
                                className="alert"
                                title="Annuler"
                                disabled={!updated || locked}
                                onClick={() => {
                                    handleCancel(true);
                                }}
                            >
                                <FiRotateCcw />
                            </button>
                            <button className="primary" title="Enregistrer" disabled={!updated || !validated || locked}>
                                <FiSave />
                                <span>enregistrer</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <TabItem>
                <TabItemPanel
                    title="Profil"
                    closedTitle={formData.email}
                    initialOpepend={api.currentUser.account.is_admin && api.currentUser.account.email === account.email}
                    ref={panels.profile}
                    onOpened={() => {
                        Object.keys(panels).forEach((key) => {
                            if (key !== "profile") panels[key].current.close();
                        });
                    }}
                >
                    <div className="profileForm">
                        {/* <img className="avatar" src={formData.avatar_url} title={formData.name} /> */}
                        <div className="formBox noMargin">
                            <form onSubmit={handleSubmit} className="multiCol">
                                <div className="formRow bdr">
                                    <h4>Informations sensibles</h4>
                                </div>

                                <div className="formCol">
                                    <div className="formRow">
                                        <label
                                            htmlFor="email"
                                            className={`${
                                                validations.hasOwnProperty("email") && validations.email !== true
                                                    ? "notValidated"
                                                    : ""
                                            }`.trim()}
                                        >
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
                                                handleValidate("email", isValid);
                                            }}
                                            checkExists={editable}
                                            readOnly={!editable || locked}
                                        />
                                    </div>

                                    <div className="formRow">
                                        <label
                                            className={`${
                                                validations.hasOwnProperty("password") && validations.password !== true
                                                    ? "notValidated"
                                                    : ""
                                            }`.trim()}
                                        >
                                            Mot de passe
                                        </label>
                                        {api.currentUser.account.email === account.email && (
                                            <InputPassword
                                                name="password"
                                                id="password"
                                                placeholder="laisser vide pour ne pas le modifier."
                                                autoComplete="off"
                                                validate={true}
                                                value={formData.password}
                                                onChange={(value) => {
                                                    handleChange("password", value);
                                                }}
                                                onValid={(isValid, value) => {
                                                    handleValidate("password", value !== "" ? isValid : true);
                                                }}
                                                readOnly={!editable || locked}
                                            />
                                        )}
                                        {api.currentUser.account.email !== account.email &&
                                            api.currentUser.account.is_admin && (
                                                <div className="resetPassword">
                                                    <span>
                                                        <a href="javascript: setRandomPassword()" title="">
                                                            <BsHurricane /> Redéfinir le mot de passe aléatoirement
                                                        </a>
                                                    </span>
                                                </div>
                                            )}
                                        <p>
                                            <small>
                                                Pour des raisons de sécurité, le mot de passe actuel ne peut être
                                                récupéré.
                                            </small>
                                        </p>
                                    </div>
                                </div>

                                <div className="formCol">
                                    <div className="formRow">
                                        <label
                                            htmlFor="name"
                                            className={`${
                                                validations.hasOwnProperty("name") && validations.name !== true
                                                    ? "notValidated"
                                                    : ""
                                            }`.trim()}
                                        >
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
                                                handleValidate("name", isValid);
                                            }}
                                            onClearText={() => {
                                                handleChange("name", "");
                                            }}
                                            readOnly={!editable || locked}
                                            checkExists={true}
                                        />
                                    </div>
                                    <div className="formRow">
                                        <label htmlFor="active" style={{ marginBottom: "6px" }}>
                                            Etat du compte
                                        </label>

                                        <Switch
                                            label={`Compte ${formData.active ? "activé" : "désactivé"}`}
                                            title="Etat du compte"
                                            name="active"
                                            checked={formData.active}
                                            onChange={(state) => {
                                                handleChange("active", state);
                                            }}
                                            readOnly={
                                                !editable || api.currentUser.account.email === account.email || locked
                                            }
                                            ref={switchs["active"]}
                                        />

                                        {api.currentUser.account.email === account.email && editable ? (
                                            <p>
                                                <small>
                                                    Vous ne pouvez pas activer ou désactiver votre propre compte.
                                                </small>
                                            </p>
                                        ) : null}
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
                                            pour illuster le compte utilisateur. Pour fonctionner correctement,
                                            l'adresse email de connexion doit être identique à celle utilisée pour le
                                            compte{" "}
                                            <a href="https://fr.gravatar.com/" target="_blank">
                                                Gravatar
                                            </a>
                                            .
                                        </>
                                    }
                                />

                                <div className="formRow bdr">
                                    <h4>Informations complémentaires</h4>
                                </div>

                                <div className="formRow">
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
                                        readOnly={!editable || locked}
                                    />
                                </div>

                                <div className="formCol">
                                    <div className="formRow">
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
                                            readOnly={!editable || locked}
                                        />
                                    </div>
                                    <div className="formRow">
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
                                            readOnly={!editable || locked}
                                            phonePattern={/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/}
                                            phonePatternSample="0102030405 / +33102030405 / 0033102030405"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </TabItemPanel>

                <TabItemPanel
                    title="Droits et permissions"
                    initialOpepend={
                        !(api.currentUser.account.is_admin && api.currentUser.account.email === account.email)
                    }
                    ref={panels.rights}
                    onOpened={() => {
                        Object.keys(panels).forEach((key) => {
                            if (key !== "rights") panels[key].current.close();
                        });
                    }}
                >
                    <div className="rightsList">
                        <div className="formBox noMargin">
                            {false &&
                            api.currentUser.account.is_admin &&
                            api.currentUser.account.email === account.email ? (
                                <p>
                                    Vous êtes un administrateur, par conséquent vous possédez tous les droits aux
                                    services {env.APP_NAME}.
                                </p>
                            ) : (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                    }}
                                    className="multiCol"
                                >
                                    <div className="rightRows">
                                        {availlableRights && (
                                            <div className="rightRow header">
                                                <b>{accountRightIds.length}</b> option
                                                {accountRightIds.length > 1 ? "s" : ""} souscrite
                                                {accountRightIds.length > 1 ? "s" : ""} sur{" "}
                                                <b>{availlableRights.length}</b> proposée
                                                {availlableRights.length > 1 ? "s" : ""}.
                                            </div>
                                        )}
                                        {availlableRights &&
                                            availlableRights.map((right) => (
                                                <div className="rightRow" key={right.id} id={right.id}>
                                                    <Switch
                                                        label={right.name}
                                                        name={`right_${right.id}`}
                                                        checked={accountRightIds.includes(right.id)}
                                                        onChange={(state) => {
                                                            handleRightChange(right, state);
                                                        }}
                                                        readOnly={
                                                            !editable || !api.currentUser.account.is_admin || locked
                                                        }
                                                        ref={switchs[right.id]}
                                                    />
                                                </div>
                                            ))}
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </TabItemPanel>
            </TabItem>
        </>
    );
}
