import React, { useState, useContext } from "react";
import { Helmet } from "react-helmet-async";

import env from "../../env.json";

import { ApiContext } from "../components/ApiProvider";
import ProfileTabItem from "../components/ProfileTabItem";
import PartnersTabItem from "../components/PartnersTabItem";
import RightsTabItem from "../components/RightsTabItem";
import StructuresTabItem from "../components/StructuresTabItem";

import { BsPersonBoundingBox, BsHouse, BsDiagram3 } from "react-icons/bs";

export default function Index() {
    const [tabId, setTabId] = useState("profile");

    const api = useContext(ApiContext);

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
                            setTabId("profile");
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
                                    setTabId("partners");
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
                                    setTabId("rights");
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
                                setTabId("structures");
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
                    {tabId === "profile" && <ProfileTabItem />}
                    {tabId === "partners" && <PartnersTabItem />}
                    {tabId === "rights" && <RightsTabItem />}
                    {tabId === "structures" && <StructuresTabItem />}
                </div>
            </div>
        </>
    );
}
