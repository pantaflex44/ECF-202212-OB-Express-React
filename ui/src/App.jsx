import React, { useContext } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import "./css/_app.scss";

import { ApiProvider, ApiContext } from "./components/ApiProvider";
import Layout from "./components/Layout";

import Index from "./pages/Index";
import Login from "./pages/Login";
import PasswordLost from "./pages/PasswordLost";
import Error404 from "./pages/Error404";

function RoutesManager() {
    const api = useContext(ApiContext);

    return (
        <Routes>
            <Route exact path="/" element={api.currentUser.connected ? <Index /> : <Login />} />
            <Route
                exact
                path="/passwordlost"
                element={api.currentUser.connected ? <Navigate to={"/"} replace={false} /> : <PasswordLost />}
            />
            <Route path="*" element={<Error404 />} />
        </Routes>
    );
}

export default function App() {
    const currentLocation = window.location.pathname;
    const currentPath = currentLocation.substring(0, currentLocation.lastIndexOf("/")) + "/";

    return (
        <BrowserRouter basename={currentPath}>
            <HelmetProvider>
                <ApiProvider>
                    <Layout>
                        <RoutesManager />
                    </Layout>
                </ApiProvider>
            </HelmetProvider>
        </BrowserRouter>
    );
}

const rootElement = document.getElementById("app");
if (rootElement.hasChildNodes()) {
    hydrateRoot(rootElement, <App />);
} else {
    const root = createRoot(rootElement);
    root.render(<App />);
}
