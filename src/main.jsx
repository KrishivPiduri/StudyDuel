import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ClerkProvider } from '@clerk/clerk-react'
import {WebSocketProvider} from "../context/WebSocketContext.jsx";

const PUBLISHABLE_KEY = "pk_live_Y2xlcmsuZHVlbC5oYWNreW91cmdyYWRlLmNvbSQ";

if (!PUBLISHABLE_KEY) {
    throw new Error('Add your Clerk Publishable Key to the .env file');
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <WebSocketProvider>
                <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
                    <App />
                </ClerkProvider>
            </WebSocketProvider>
        </BrowserRouter>
    </React.StrictMode>
);
