import React, { useContext, useState } from "react";

import { ApiContext } from "./ApiProvider";

import { BsChevronDown, BsChevronUp, BsLock, BsArrowCounterclockwise } from "react-icons/bs";
import { secondsToHuman } from "../js/functions";

export default function Header() {
    const [opened, setOpened] = useState(false);

    const api = useContext(ApiContext);

    return (
        api && (
            <div
                className="userIcon"
                onClick={() => {
                    setOpened((state) => !state);
                }}
            >
                <div className="userIconButton">
                    <img
                        src={api.currentUser.account?.avatar_url}
                        title={api.currentUser.account?.name}
                        className={api.currentUser.expireDelay <= 60 ? "blink" : ""}
                    />
                    <div className="userChevron">{opened ? <BsChevronUp /> : <BsChevronDown />}</div>
                </div>

                <div className={`userMenu ${opened ? "opened" : ""}`.trim()}>
                    <div className="userMenuName">{api.currentUser.account.name}</div>
                    <div
                        className="userMenuExpires"
                        title="Pour des raisons de sécurité, la connexion au tableau de bord expire au bout d'un temps prédéfini. Néanmoins, vous aurez la possibilité, avant la du compte à rebourd, de prolonger ce délai pour éviter la déconnexion automatique."
                    >
                        Votre connexion expire dans {secondsToHuman(api.currentUser.expireDelay, true)}
                    </div>
                    {api.currentUser.expireDelay <= 60 && (
                        <div
                            className="userMenuItem bdr"
                            onClick={() => {
                                api.refreshCurrentUserConnection();
                            }}
                            title="Prolonger ma connexion avant le délai d'expiration."
                        >
                            <BsArrowCounterclockwise />
                            <span>Prolonger ma connexion</span>
                        </div>
                    )}
                    <div
                        className="userMenuItem bdr"
                        onClick={() => {
                            api.logout(true);
                        }}
                        title="Me déconnecter du tableau de bord."
                    >
                        <BsLock />
                        <span>Déconnexion</span>
                    </div>
                </div>
            </div>
        )
    );
}
