import React, { createContext, useState, useEffect } from "react";

import env from "../../env.json";

import { AES, enc } from "crypto-js";
import { getDelay, getNowTs, secondsToHuman } from "../js/functions";

const ApiContext = createContext();

const ApiProvider = ({ children, baseURL = env.API_BASEURL }) => {
    const [currentUser, setCurrentUser] = useState({ connected: false, account: null, expireDelay: 0 });
    const [httpError, setHttpError] = useState(null);

    let expireConfirmAsked = false;

    function resetHttpError() {
        setHttpError(null);
    }

    async function httpResponse(response) {
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
            const code = response.status;
            const message = (data && data.message) || "Une erreur inconnue est survenue.";
            setHttpError({ code, message });

            return null;
        }

        resetHttpError();

        return data || "";
    }

    function httpClient(method, url, data = {}, callback = null, httpErrorCallback = null) {
        let headers = {};
        let body = null;

        const accessToken = localStorage.getItem(`${env.APP_NAME}-access-token`);
        if (accessToken) {
            headers = { ...headers, Authorization: `Bearer ${accessToken}` };
        }

        if (method === "post") {
            headers = { ...headers, "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" };

            body = [];
            for (var property in data) {
                var encodedKey = encodeURIComponent(property);
                var encodedValue = encodeURIComponent(data[property]);
                body.push(encodedKey + "=" + encodedValue);
            }
            body = body.join("&");
        }

        fetch(`${baseURL}${url}`, {
            method,
            headers,
            body
        })
            .then((response) => callback && callback(response))
            .catch((err) => {
                setHttpError({
                    code: 500,
                    message: "Une erreur critique est survenue. Veuillez recommencer ultérieurement."
                });

                httpErrorCallback && httpErrorCallback(err);
            });
    }

    async function httpClientAsync(method, url, data = {}) {
        return new Promise((resolve, reject) => {
            httpClient(
                method,
                url,
                data,
                async (response) => {
                    const data = await httpResponse(response);
                    resolve(data);
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    function computeCredentials(data) {
        if (!data.hasOwnProperty("token") || !data.hasOwnProperty("expires") || !data.hasOwnProperty("account")) {
            setHttpError({
                code: 500,
                message: "Une erreur interne est survenue. Veuillez recommencer ultérieurement."
            });
            return;
        }

        const accessToken = data.token;
        const accessExpires = Date.parse(data.expires) / 1000;
        localStorage.setItem(`${env.APP_NAME}-access-token`, accessToken);
        localStorage.setItem(`${env.APP_NAME}-access-expires`, accessExpires);

        setCurrentUser({ connected: true, account: data.account, expireDelay: getDelay(accessExpires) });
    }

    useEffect(() => {
        const interval = setInterval(async () => {
            let delay = getDelay(
                currentUser.connected ? localStorage.getItem(`${env.APP_NAME}-access-expires`) : getNowTs()
            );

            const endConnection = () => {
                logout();
                clearInterval(interval);
            };

            if (currentUser.connected) {
                if (delay <= 0) return endConnection();

                if (delay <= 60 && !expireConfirmAsked) {
                    expireConfirmAsked = true;

                    if (
                        confirm(
                            "Vous allez être déconnecté dans moins de 60 secondes. Désirez-vous prolonger votre connexion?"
                        )
                    ) {
                        if (delay > 0) refreshCurrentUserConnection();
                    }

                    if (delay <= 0) return endConnection();
                }
            }

            setCurrentUser((oldData) => {
                return { ...oldData, expireDelay: delay };
            });
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [currentUser.connected]);

    useEffect(() => {
        if (!httpError || !httpError.hasOwnProperty("code")) return;

        if (httpError.code === 401) logout();

        if (httpError.code === 500) {
            setCurrentUser((oldData) => {
                return { ...oldData, connected: false, account: null, expireDelay: 0 };
            });
        }
    }, [httpError]);

    function getSavedCredentials() {
        const cryptedCredentials = localStorage.getItem(`${env.APP_NAME}_credentials`);
        if (cryptedCredentials) {
            const credentials = JSON.parse(AES.decrypt(cryptedCredentials, env.APP_SECRET).toString(enc.Utf8));

            return credentials;
        }

        return { email: "", password: "" };
    }

    function logout(preventLogout = false) {
        if (!preventLogout || (preventLogout && confirm("Confirmez-vous l'ordre de déconnexion?"))) {
            httpClient("get", "accounts/logout", {}, async (response) => {
                const data = await httpResponse(response);
                if (data !== null) {
                    localStorage.removeItem(`${env.APP_NAME}-access-token`);
                    localStorage.removeItem(`${env.APP_NAME}-access-expires`);

                    setCurrentUser((oldData) => {
                        return { ...oldData, connected: false, account: null, expireDelay: 0 };
                    });
                }
            });
        }
    }

    function login(email, password, save = false) {
        httpClient(
            "post",
            "accounts/login",
            { email, password },
            async (response) => {
                const data = await httpResponse(response);
                if (data !== null) {
                    if (save) {
                        const cryptedCredentials = AES.encrypt(JSON.stringify({ email, password }), env.APP_SECRET);
                        localStorage.setItem(`${env.APP_NAME}_credentials`, cryptedCredentials.toString());
                    } else {
                        localStorage.removeItem(`${env.APP_NAME}_credentials`);
                    }

                    computeCredentials(data);
                }
            },
            () => {
                logout();
            }
        );
    }

    function refreshCurrentUserConnection() {
        const accessToken = localStorage.getItem(`${env.APP_NAME}-access-token`);
        if (!accessToken) return;

        httpClient(
            "post",
            "accounts/refresh",
            { token: accessToken },
            async (response) => {
                const data = await httpResponse(response);
                if (data !== null) computeCredentials(data);
            },
            () => {
                logout();
            }
        );
    }

    function passwordLost(email, onSuccess = null, onError = null) {
        httpClient(
            "post",
            "accounts/passwordlost",
            { email },
            async (response) => {
                const data = await httpResponse(response);
                if (data !== null) {
                    if (onSuccess) onSuccess(data);
                } else {
                    onError({ code: 500, message: "Une erreur interne est survenue." });
                }
            },
            (err) => {
                if (onError) onError(err);
            }
        );
    }

    async function emailExists(email) {
        try {
            const result = await httpClientAsync("post", "accounts/emailexists", { email });
            return result.exists;
        } catch (err) {
            const e = new Error(err.message);
            e.code = err.code;
            throw e;
        }
    }

    async function nameExists(name) {
        try {
            const result = await httpClientAsync("post", "accounts/nameexists", { name });
            return result.exists;
        } catch (err) {
            const e = new Error(err.message);
            e.code = err.code;
            throw e;
        }
    }

    return (
        <ApiContext.Provider
            value={{
                httpError,
                resetHttpError,
                currentUser,
                login,
                logout,
                refreshCurrentUserConnection,
                getSavedCredentials,
                emailExists,
                nameExists,
                passwordLost
            }}
        >
            {children}
        </ApiContext.Provider>
    );
};

module.exports = { ApiContext, ApiProvider };
