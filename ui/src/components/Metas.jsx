import React from "react";
import { Helmet } from "react-helmet-async";

import env from "../../env.json";
import Logo from "../assets/logo.png";

export default function Metas() {
    return (
        <Helmet htmlAttributes={{ lang: env.APP_LANG }}>
            <title>{process.env.APP_NAME}</title>
            <meta name="description" content={env.APP_DESC} />
            <meta name="keywords" content="credible" />
            <meta http-equiv="content-language" content={env.APP_LANG} />
            <meta name="author" content="Christophe LEMOINE" />
            <meta name="generator" content="Credible" />
            <meta name="publisher" content="Credible" />
            <meta property="og:site_name" content="Credible" />
            <meta property="og:title" content="Credible" />
            <meta property="og:description" content={env.APP_DESC} />
            <meta property="og:image" content={Logo} />
            <meta property="og:url" content={window.location.href} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image:alt" content={Logo} />
            <link rel="icon" type="image/x-icon" href={Logo}></link>
            <meta name="robots" content="noindex, nofollow" />
        </Helmet>
    );
}
