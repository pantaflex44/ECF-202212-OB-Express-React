import React from "react";

import { BsGithub, BsGlobe } from "react-icons/bs";

export default function Footer() {
    return (
        <footer>
            <span style={{ fontSize: "larger" }}>
                <a
                    href="https://github.com/pantaflex44/ECF-202212-OB-Express-React"
                    target="_blank"
                    title="Github du projet"
                >
                    <BsGithub />
                </a>
            </span>
            <span style={{ fontSize: "larger" }}>
                <a href="https://pantaflex44.me/" target="_blank" title="Mon portfolio">
                    <BsGlobe />
                </a>
            </span>
            <span>Licence MIT</span>
            <span>Copyleft 🄯2022, Christophe LEMOINE (pantaflex44)</span>
            <span>
                Application réalisée dans le cadre de l'examen en cours de formation ECF 2022 de l'école{" "}
                <a href="https://www.studi.com/" target="_blank" title="L'école Studi">
                    Studi
                </a>{" "}
                (
                <a href="https://www.digital-campus.fr/" target="_blank" title="Digital Campus">
                    Digital Campus
                </a>
                ).
            </span>
            <span>Promotion Gefland, Décembre 2022, Graduate Développeur Web et Web mobile.</span>
        </footer>
    );
}
