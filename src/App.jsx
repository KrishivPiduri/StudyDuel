import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PasswordReset from "./pages/PasswordReset";
import Dashboard from "./pages/Dashboard";
import DuelSetup from "./pages/DuelSetup";
import StudyRoom from "./pages/StudyRoom";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset" element={<PasswordReset />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/duel" element={<DuelSetup />} />
            <Route path="/study" element={<StudyRoom />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/results" element={<Results />} />
        </Routes>
    );
}

export default App;
