import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PasswordReset from "./pages/PasswordReset";
import Dashboard from "./pages/Dashboard";
import DuelSetup from "./pages/DuelSetup";
import StudyRoom from "./pages/StudyRoom";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Login from "./pages/Login";
import SSOCallback from "./pages/SSOCallback";
import Navbar from "../components/Navbar.jsx";
import {RedirectToSignIn, useUser} from "@clerk/clerk-react";
import HowToUse from "./pages/howToUse.jsx";

function ProtectedRoute({ children }) {
    const { isSignedIn, isLoaded } = useUser();

    if (!isLoaded) return null; // or a spinner

    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    return children;
}


function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar/>
            <Routes>
                <Route path="/" element={<LandingPage/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/reset" element={<PasswordReset/>}/>
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
                <Route path="/duel" element={<ProtectedRoute><DuelSetup/></ProtectedRoute>}/>
                <Route path="/study" element={<ProtectedRoute><StudyRoom/></ProtectedRoute>}/>
                <Route path="/quiz" element={<ProtectedRoute><Quiz/></ProtectedRoute>}/>
                    <Route path="/results" element={<Results/>}/>
                <Route path="/login/sso-callback" element={<SSOCallback/>}/>
                <Route path={"/about"} element={<HowToUse/>}/>
            </Routes>
        </div>
    );
}

export default App;
