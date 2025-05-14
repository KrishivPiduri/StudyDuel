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

function App() {
    return (
        <div className="h-screen flex flex-col">
            <Navbar />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<></>} />
                <Route path="/reset" element={<PasswordReset />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/duel" element={<DuelSetup />} />
                <Route path="/study" element={<StudyRoom />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/results" element={<Results />} />
                <Route path="/login/sso-callback" element={<SSOCallback />} />
            </Routes>
        </div>
    );
}

export default App;
