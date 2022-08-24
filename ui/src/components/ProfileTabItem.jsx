import React, { useContext, useState } from "react";
import { BsPen, BsSave } from "react-icons/bs";

import { ApiContext } from "./ApiProvider";
import TabItems from "./TabItems";
import TabItemPanel from "./TabItemPanel";
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
        <TabItems>
            <TabItemPanel
                title="Fiche profil"
                titleIcon={
                    api.currentUser.account.is_admin && (
                        <button
                            onClick={handleEditModeClick}
                            title={editMode ? "Enregistrer" : "Editer"}
                            className={`${editMode ? "important" : ""}`.trim()}
                        >
                            {!editMode && <BsPen size={"1.5em"} />}
                            {editMode && <BsSave size={"1.5em"} />}
                        </button>
                    )
                }
                closedTitle={editedAccount && editedAccount.name}
            >
                <ProfileForm account={editedAccount} editMode={editMode} onChange={handleChange} onSave={handleSave} />
            </TabItemPanel>

            <TabItemPanel title="Droits et permissions" initialOpepend={true}>
                Mes droits
            </TabItemPanel>
        </TabItems>
    );
}
