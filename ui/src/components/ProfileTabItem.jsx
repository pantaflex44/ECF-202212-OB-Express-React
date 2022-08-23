import React, { useContext, useState } from "react";
import { BsPen, BsSave } from "react-icons/bs";

import { ApiContext } from "./ApiProvider";
import ProfileForm from "./ProfileForm";

export default function ProfileTabItem() {
    const api = useContext(ApiContext);

    const initialAccount = { ...api.currentUser.account, password: "" };

    const [editMode, setEditMode] = useState(false);
    const [editedAccount, setEditedAccount] = useState({ ...initialAccount });

    function handleEditModeClick(e) {
        e.preventDefault();

        setEditMode((oldEditMode) => !oldEditMode);
    }

    function handleChange(newAccount) {
        setEditedAccount((oldEditedAccount) => {
            return { ...oldEditedAccount, newAccount };
        });
    }

    function handleSave(newAccount) {
        console.log("save", newAccount);
    }

    return (
        <div className="tabItem">
            <div className="tabItemTitle">
                <h3>Mon profil et mes droits</h3>

                {api.currentUser.account.is_admin && (
                    <button
                        onClick={handleEditModeClick}
                        title={editMode ? "Enregistrer" : "Editer"}
                        className={`${editMode ? "important" : ""}`.trim()}
                    >
                        {!editMode && <BsPen size={"1.5em"} />}
                        {editMode && <BsSave size={"1.5em"} />}
                    </button>
                )}
            </div>

            <ProfileForm account={editedAccount} editMode={editMode} onChange={handleChange} onSave={handleSave} />
        </div>
    );
}
