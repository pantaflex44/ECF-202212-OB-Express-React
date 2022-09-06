import React, { useContext, useState, useEffect, createRef } from "react";

import env from "../../env.json";
import { securePassword } from "../js/functions";

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
import { BsExclamationSquare, BsHurricane } from "react-icons/bs";

export default function AccountForm({ account }) {
    const api = useContext(ApiContext);

    const initialAccount = {
        ...account,
        password: "",
        account_type: account.is_admin ? "admin" : account.partner_id === 0 ? "partner" : "structure"
    };
    let savedTimer = null;

    const [formData, setFormData] = useState({ ...initialAccount });
    const [currentData, setCurrentData] = useState({ ...initialAccount });
    const [validations, setValidations] = useState({});
    const [accountRightIds, setAccountRightIds] = useState([]);
    const [availlableRights, setAvaillableRights] = useState([]);
    const [availlablePartners, setAvaillablePartners] = useState([]);
    const [switchs, setSwitchs] = useState({ active: createRef() });

    const [editable, setEditable] = useState(api.currentUser.account.is_admin);
    const [locked, setLocked] = useState(true);

    const [updated, setUpdated] = useState(false);
    const [validated, setValidated] = useState(false);

    const [saveState, setSaveState] = useState({
        state: "",
        messages: [],
        changes: {},
        newPassword: null,
        newActiveState: null
    });

    const [panels, setPanels] = useState({ profile: createRef(), rights: createRef() });

    function setRandomPassword() {
        do {
            handleChange("password", securePassword.generate(16));
        } while (validations.password !== true);
    }

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

    function handleAccountTypeChange(e) {
        const value = e.target.value;

        if (value === "partner") {
            handleChange("is_admin", false);
            handleChange("is_partner", true);
            handleChange("is_structure", false);
            handleChange("partner_id", 0);
            return;
        }

        if (value === "structure") {
            handleChange("is_admin", false);
            handleChange("is_partner", false);
            handleChange("is_structure", true);
            handleChange("partner_id", -1);
            return;
        }
    }

    function handlePartnerIdChange(e) {
        const id = parseInt(e.target.value);

        handleChange("partner_id", id);
    }

    function handleValidate(key, state) {
        setValidations((oldValidations) => {
            return { ...oldValidations, [key]: state };
        });
    }

    function handleCancel(confirmation = true) {
        if (confirmation) {
            if (confirm("Annuler toutes les modifications?")) setFormData({ ...currentData });
        } else {
            setFormData({ ...currentData });
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        setSaveState({ state: "saving", messages: [], changes: {} });

        panels["profile"].current.open();

        if (formData.description !== currentData.description) {
            setSaveState((oldState) => {
                return {
                    ...oldState,
                    messages: [...oldState.messages, "Modification de la description..."],
                    changes: { ...oldState.changes, description: formData.description }
                };
            });
        }

        if (formData.postal_address !== currentData.postal_address) {
            setSaveState((oldState) => {
                return {
                    ...oldState,
                    messages: [...oldState.messages, "Modification de l'adresse postale..."],
                    changes: { ...oldState.changes, postal_address: formData.postal_address }
                };
            });
        }

        if (formData.gsm !== currentData.gsm) {
            setSaveState((oldState) => {
                return {
                    ...oldState,
                    messages: [...oldState.messages, "Modification du numéro de téléphone..."],
                    changes: { ...oldState.changes, gsm: formData.gsm }
                };
            });
        }

        if (
            formData.is_partner !== currentData.is_partner ||
            formData.is_structure !== currentData.is_structure ||
            formData.partner_id !== currentData.partner_id
        ) {
            if (
                !currentData.is_admin &&
                (!formData.is_structure || (formData.is_structure && formData.partner_id > 0))
            ) {
                setSaveState((oldState) => {
                    return {
                        ...oldState,
                        messages: [...oldState.messages, "Modification du type de compte..."],
                        changes: { ...oldState.changes, partner_id: formData.is_partner ? 0 : formData.partner_id }
                    };
                });
            }
        }

        if (formData.name !== currentData.name) {
            setSaveState((oldState) => {
                return {
                    ...oldState,
                    messages: [...oldState.messages, "Modification de la dénomination..."],
                    changes: { ...oldState.changes, name: formData.name }
                };
            });
        }

        if (formData.email !== currentData.email) {
            setSaveState((oldState) => {
                return {
                    ...oldState,
                    messages: [...oldState.messages, "Modification de l'adresse email..."],
                    changes: { ...oldState.changes, email: formData.email }
                };
            });
        }

        if (formData.password !== currentData.password) {
            setSaveState((oldState) => {
                return {
                    ...oldState,
                    messages: [...oldState.messages, "Modification du mot de passe..."],
                    newPassword: {
                        email: oldState.changes.hasOwnProperty("email") ? oldState.changes.email : currentData.email,
                        password: formData.password
                    }
                };
            });
        }

        if (formData.active !== currentData.active) {
            setSaveState((oldState) => {
                return {
                    ...oldState,
                    messages: [
                        ...oldState.messages,
                        formData.active ? "Activation du compte..." : "Désactivation du compte..."
                    ],
                    newActiveState: {
                        email: oldState.changes.hasOwnProperty("email") ? oldState.changes.email : currentData.email,
                        state: formData.active ? 1 : 0
                    }
                };
            });
        }

        setSaveState((oldState) => {
            return { ...oldState, processing: true };
        });
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

        api.getPartners()
            .then((p) => {
                setAvaillablePartners(p.partners);
            })
            .catch((err) => {
                setAvaillablePartners([]);
            });

        return () => {
            if (savedTimer) {
                clearTimeout(savedTimer);

                setSaveState({
                    state: "",
                    messages: [],
                    changes: {},
                    newPassword: null,
                    newActiveState: null,
                    processing: false
                });
            }
        };
    }, []);

    useEffect(() => {
        setAccountRightIds(Object.keys(formData.rights).map((key) => formData.rights[key].id));
    }, [formData.rights]);

    useEffect(() => {
        const isEqual = Object.entries(currentData).toString() === Object.entries(formData).toString();
        setUpdated(!isEqual);
    }, [formData]);

    useEffect(() => {
        const allValidated = Object.keys(validations).reduce((previous, current) => {
            return previous && validations[current];
        }, true);
        setValidated(allValidated);
    }, [validations]);

    useEffect(() => {
        if (saveState.state === "saving") setLocked(true);
        if (saveState.state === "saved") {
            setUpdated(false);

            if (api.currentUser.account.id === currentData.id) {
                alert(
                    `Les modifications de votre propre compte nécessites une reconnexion aux services ${env.APP_NAME} pour valider la mise à jour des informations.`
                );
                api.logout();
            }

            if (
                api.currentUser.account.email === initialAccount.email &&
                api.currentUser.account.email !== currentData.email
            ) {
                alert(
                    `Votre adresse email a été modifiée. Vous allez être automatiquement déconnecté. Surveillez votre boite mail pour activer de nouveau votre compte ;-)`
                );
                api.logout();
            }
        }

        if (saveState.state === "saving" && saveState.processing === true) {
            setSaveState((oldState) => {
                return { ...oldState, processing: false };
            });

            let savedOk = true;
            const promises = [];

            if (Object.keys(saveState.changes).length > 0) {
                promises.push(api.updateAccount(currentData.id, saveState.changes));
            }

            if (saveState.newPassword) {
                promises.push(api.changePassword(saveState.newPassword.email, saveState.newPassword.password));
            }

            if (saveState.newActiveState) {
                promises.push(api.activate(saveState.newActiveState.email, saveState.newActiveState.state));
            }

            Promise.all(promises)
                .then((results) => {
                    for (const result of results) savedOk = savedOk && result === 204;
                })
                .catch((err) => {
                    savedOk = false;
                });

            setSaveState((oldState) => {
                return {
                    ...oldState,
                    messages: [],
                    changes: {},
                    newPassword: null,
                    newActiveState: null
                };
            });

            if (savedOk) {
                setCurrentData({ ...formData });

                setSaveState((oldState) => {
                    return {
                        ...oldState,
                        state: "saved"
                    };
                });
            } else {
                setSaveState((oldState) => {
                    return {
                        ...oldState,
                        state: "error"
                    };
                });
            }

            if (savedTimer) clearTimeout(savedTimer);

            savedTimer = setTimeout(
                () => {
                    setSaveState({
                        state: "",
                        messages: [],
                        changes: {},
                        newPassword: null,
                        newActiveState: null,
                        processing: false
                    });
                },
                savedOk ? 2000 : 3000
            );
        }
    }, [saveState]);

    return (
        <>
            {editable && (
                <Toast
                    name="account_updates"
                    message={`Toute modification apportée au compte utilisateur impose une reconnexion aux services ${env.APP_NAME}.`}
                    icon={<BsExclamationSquare size="3.5vmin" />}
                />
            )}

            <div className="toolbar">
                <div className="toolbarSide">
                    {editable && (
                        <Switch
                            label={
                                locked ? (
                                    <span className="">Mode consultation</span>
                                ) : (
                                    <span className="blink important">Mode édition</span>
                                )
                            }
                            name="lock"
                            checked={editable && !locked}
                            onChange={(state) => {
                                handleCancel(false);
                                setLocked(!state);
                            }}
                            readOnly={!editable}
                            alert={!locked}
                        />
                    )}
                </div>
                <div className="toolbarSide">
                    {editable && (
                        <>
                            <button
                                className=""
                                title="Annuler"
                                disabled={!updated || locked}
                                onClick={() => {
                                    handleCancel(true);
                                }}
                            >
                                <FiRotateCcw />
                            </button>
                            <button
                                className="primary"
                                title="Enregistrer"
                                disabled={!updated || !validated || locked}
                                onClick={handleSubmit}
                            >
                                <FiSave />
                                <span>enregistrer</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {saveState.state !== "" && (
                <ul className="box">
                    {saveState.messages.map((message, idx) => (
                        <li key={`message_${idx}`}>{message}</li>
                    ))}
                    {saveState.state === "error" && <li className="errorMessage">Erreur lors de l'enregistrement!</li>}
                </ul>
            )}

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
                            <form onSubmit={handleSubmit} className={`multiCol ${!locked ? "editMode" : ""}`.trim()}>
                                <div className="formRow bdr">
                                    <h4>Compte utilisateur</h4>
                                </div>

                                {editable &&
                                    !initialAccount.is_admin &&
                                    api.currentUser.account.email !== initialAccount.email && (
                                        <div className="formCol">
                                            <div className="formRow">
                                                <label htmlFor="accountType">
                                                    Type de compte <b>*</b>
                                                </label>

                                                <select
                                                    name="accountType"
                                                    id="accountType"
                                                    value={formData.is_partner ? "partner" : "structure"}
                                                    disabled={!editable || locked}
                                                    onChange={handleAccountTypeChange}
                                                >
                                                    <option value="partner">Partenaire franchisé</option>
                                                    {availlablePartners.length > 0 && (
                                                        <option value="structure">Structure affiliée</option>
                                                    )}
                                                </select>
                                            </div>

                                            {formData.is_structure && (
                                                <div className="formRow">
                                                    <label htmlFor="partnerId">
                                                        Affiliée au partenaire <b>*</b>
                                                    </label>

                                                    <select
                                                        name="partnerId"
                                                        id="partnerId"
                                                        value={formData.partner_id}
                                                        disabled={!editable || locked}
                                                        onChange={handlePartnerIdChange}
                                                    >
                                                        {availlablePartners.length === 0 && (
                                                            <option value="-1">-- aucun partenaire connu --</option>
                                                        )}
                                                        {availlablePartners.length > 0 &&
                                                            availlablePartners.forEach((partner) => (
                                                                <option value={partner.id}>{partner.name}</option>
                                                            ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}

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
                                            readOnly={
                                                !editable ||
                                                locked ||
                                                api.currentUser.account.email === initialAccount.email
                                            }
                                        />

                                        {api.currentUser.account.email === account.email && editable && !locked ? (
                                            <p className="info">
                                                <small>
                                                    Vous ne pouvez pas modifier votre propre adresse email de connexion.
                                                </small>
                                            </p>
                                        ) : null}
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
                                                validate={true && !locked}
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

                                        {api.currentUser.account.email === account.email && editable && !locked && (
                                            <div className="resetPassword">
                                                <span>
                                                    <a
                                                        title=""
                                                        onClick={() => {
                                                            setRandomPassword();
                                                        }}
                                                    >
                                                        <BsHurricane /> Générer un mot de passe sécurisé
                                                    </a>
                                                </span>
                                            </div>
                                        )}

                                        <p className="info">
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
                                            labelClassName="large"
                                        />

                                        {api.currentUser.account.email === account.email && editable && !locked ? (
                                            <p className="info">
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
                            {api.currentUser.account.is_admin && api.currentUser.account.email === account.email ? (
                                <p>
                                    <small>
                                        Vous êtes un administrateur, par conséquent vous possédez tous les droits aux
                                        services {env.APP_NAME}.
                                    </small>
                                </p>
                            ) : (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                    }}
                                    className={`multiCol ${!locked ? "editMode" : ""}`.trim()}
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
