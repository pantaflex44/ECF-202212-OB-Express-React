import React, { useState, useContext, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import env from "../../env.json";

import { ApiContext } from "../components/ApiProvider";
import ProfileTab from "../components/ProfileTab";
import PartnersTab from "../components/PartnersTab";
import RightsTab from "../components/RightsTab";
import StructuresTab from "../components/StructuresTab";

import { BsPersonBoundingBox, BsHouse, BsDiagram3 } from "react-icons/bs";

export default function Index() {
    const [tabId, setTabId] = useState("profile");

    const api = useContext(ApiContext);

    function selTab(id) {
        api.setHttpError(null);

        setTabId(id);
    }

    return (
        <>
            <Helmet>
                <title>{env.APP_NAME} - Tableau de bord</title>
            </Helmet>
            <div className="page">
                <h2>Tableau de bord</h2>

                <div className="mainMenu">
                    <div
                        className={`mainMenuItem ${tabId === "profile" ? "active" : ""}`.trim()}
                        onClick={() => {
                            selTab("profile");
                        }}
                    >
                        <div className="mainMenuItemIcon">
                            <BsPersonBoundingBox size={"7vmin"} />
                        </div>
                        <h3>Mon profil</h3>
                    </div>

                    {api.currentUser.account.is_admin && (
                        <>
                            <div
                                className={`mainMenuItem ${tabId === "partners" ? "active" : ""}`.trim()}
                                onClick={() => {
                                    selTab("partners");
                                }}
                            >
                                <div className="mainMenuItemIcon">
                                    <BsHouse size={"7vmin"} />
                                </div>
                                <h3>Franchises</h3>
                            </div>
                            <div
                                className={`mainMenuItem ${tabId === "rights" ? "active" : ""}`.trim()}
                                onClick={() => {
                                    selTab("rights");
                                }}
                            >
                                <div className="mainMenuItemIcon">
                                    <BsDiagram3 size={"7vmin"} />
                                </div>
                                <h3>Permissions</h3>
                            </div>
                        </>
                    )}

                    {api.currentUser.account.is_partner && (
                        <div
                            className={`mainMenuItem ${tabId === "structures" ? "active" : ""}`.trim()}
                            onClick={() => {
                                selTab("structures");
                            }}
                        >
                            <div className="mainMenuItemIcon">
                                <BsHouse size={"7vmin"} />
                            </div>
                            <h3>Structures</h3>
                        </div>
                    )}
                </div>

                <div className="tabPage">
                    {tabId === "profile" && <ProfileTab currentAccount={{ ...api.currentUser.account }} />}
                    {tabId === "partners" && <PartnersTab />}
                    {tabId === "rights" && <RightsTab />}
                    {tabId === "structures" && <StructuresTab />}
                </div>
            </div>
        </>
    );
}
