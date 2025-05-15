import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";


export default function StudyRoom() {
    const getTimerColor = () => {
        if (countdown > 60) return "text-green-600";
        if (countdown > 20) return "text-yellow-500";
        return "text-red-600 animate-pulse";
    };
    const [searchParams] = useSearchParams();
    const topic = searchParams.get("topic") || "Unknown Topic";
    const time = parseInt(searchParams.get("time")) || 15;

    const [youReady, setYouReady] = useState(false);
    const [opponentReady, setOpponentReady] = useState(false); // simulate for now
    const [studyStarted, setStudyStarted] = useState(false);
    const [countdown, setCountdown] = useState(time * 60); // seconds
    const navigate = useNavigate();

    // Start countdown when both ready
    useEffect(() => {
        if (youReady && opponentReady) {
            setStudyStarted(true);
        }
    }, [youReady, opponentReady]);

    // Countdown effect
    useEffect(() => {
        if (!studyStarted || countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [studyStarted, countdown]);

    // Redirect to quiz when timer ends
    useEffect(() => {
        if (countdown === 0) {
            navigate("/quiz");
        }
    }, [countdown, navigate]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60)
            .toString()
            .padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const handleReady = () => {
        setYouReady(true);
        setTimeout(() => setOpponentReady(true), 2000); // simulate opponent ready
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
            <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Study Duel: {topic}</h1>
                    <p className="text-gray-600">Study Time: {time} minutes</p>
                </div>

                {/* Participant Status */}
                <div className="grid grid-cols-2 gap-4">
                    {/* You */}
                    <div className="border rounded-xl p-4 text-center">
                        <p className="font-semibold">You</p>
                        <p className={`text-sm mt-1 ${youReady ? "text-green-600" : "text-gray-500"}`}>
                            {youReady ? "Ready ✅" : "Not Ready"}
                        </p>
                    </div>

                    {/* Opponent */}
                    <div className="border rounded-xl p-4 text-center">
                        <p className="font-semibold">Opponent</p>
                        <p className={`text-sm mt-1 ${opponentReady ? "text-green-600" : "text-gray-500"}`}>
                            {opponentReady ? "Ready ✅" : "Waiting..."}
                        </p>
                    </div>
                </div>

                {/* Ready Button */}
                {!youReady && !studyStarted && (
                    <button
                        onClick={handleReady}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                    >
                        I'm Ready
                    </button>
                )}

                {/* Study Countdown */}
                {studyStarted && (
                    <div className={`text-center text-3xl font-mono font-bold text-green-700 mt-4 ${getTimerColor()}`}>
                        Study Time Left: {formatTime(countdown)}
                    </div>
                )}
            </div>
        </div>
    );
}
