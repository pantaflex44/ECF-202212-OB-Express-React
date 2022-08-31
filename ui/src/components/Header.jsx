import React, { useContext, useEffect } from "react";

import { ApiContext } from "./ApiProvider";
import Metas from "./Metas";
import UserIcon from "../components/UserIcon";

import env from "../../env.json";

import { GiInvisible } from "react-icons/gi";

export default function Header() {
    const api = useContext(ApiContext);

    useEffect(() => {
        const error = api?.httpError || null;
        if (error && window) {
            window.scrollTo(0, 0);
        }
    }, [api?.httpError]);

    return (
        <>
            <Metas />

            <header>
                <div className="logo">
                    <GiInvisible size={32} />
                    <h1 className="title">{env.APP_NAME}</h1>
                </div>

                {api && api.currentUser.connected && <UserIcon />}
            </header>

            {api?.httpError && (
                <div className="errorBox">
                    <span className="errorCode">{api.httpError.code}</span>
                    <span className="errorMessage">
                        {api.httpError.message || "Une erreur est survenue. Veuillez recommencer ultérieurement."}
                    </span>
                </div>
            )}
        </>
    );
}
