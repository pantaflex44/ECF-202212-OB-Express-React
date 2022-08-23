import React from "react";
import { useNavigate } from "react-router-dom";

import { Helmet } from "react-helmet-async";
import { BsGeo, BsHouse } from "react-icons/bs";

import env from "../../env.json";

export default function Error404() {
    let navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>{env.APP_NAME} - Oups, êtes-vous perdu?</title>
            </Helmet>
            <div className="page">
                <h2>Oups, êtes-vous perdu?</h2>
                <div className="error">
                    <div className="errorLogo">
                        <BsGeo size="10vmax" />
                    </div>
                    <p className="errorCode">404</p>
                    <p className="errorMessage">
                        <strong>Quelle aventure!</strong>
                        <br />
                        <br />
                        Il semblerait que vous vous soyez perdu dans les limbes du web.
                        <br />
                        La maison ci-dessous vous renverra dans la bonne direction.
                    </p>
                    <p className="errorLinks">
                        <button
                            onClick={() => {
                                navigate("/", { replace: true });
                            }}
                        >
                            <BsHouse />
                            <span>allez hop, à la maison</span>
                        </button>
                    </p>
                </div>
            </div>
        </>
    );
}
