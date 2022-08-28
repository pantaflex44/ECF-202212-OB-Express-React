import React, { useContext } from "react";

import { ApiContext } from "./ApiProvider";
import AccountForm from "./AccountForm";

export default function ProfileTab({ currentAccount }) {
    const api = useContext(ApiContext);

    return <AccountForm account={currentAccount} />;
}
