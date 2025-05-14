import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = "pk_test_bWFpbi13YXJ0aG9nLTY5LmNsZXJrLmFjY291bnRzLmRldiQ";

if (!PUBLISHABLE_KEY) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
                <App />
            </ClerkProvider>
        </BrowserRouter>
    </React.StrictMode>
);
