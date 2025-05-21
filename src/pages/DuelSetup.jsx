import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../../context/WebSocketContext.jsx";
import { useUser } from "@clerk/clerk-react";

export default function DuelSetup() {
    const [topic, setTopic] = useState("");
    const [scope, setScope] = useState("");
    const [timer, setTimer] = useState(15);
    const [questions_, setQuestions_] = useState(10);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingDots, setLoadingDots] = useState("");

    const topicRef = useRef(null);
    const scopeRef = useRef(null);
    const timerRef = useRef(null);
    const questionsRef = useRef(null);

    const { connect, send, socketRef, roomCodeRef, setQuestions } = useWebSocket();
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        if (!loading) {
            setLoadingDots("");
            return;
        }

        let count = 0;
        const interval = setInterval(() => {
            count = (count + 1) % 4; // cycles 0-3 dots
            setLoadingDots(".".repeat(count));
        }, 400);

        return () => clearInterval(interval);
    }, [loading]);

    const connectWebSocket = () => {
        connect();

        socketRef.current.onopen = () => {
            send({
                action: "createRoom",
                topic,
                scope,
                studyTime: timer,
                questions_: questions_,
                hostId: user.id,
            });
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.type === "roomCreated") {
                const { roomCode } = data;
                roomCodeRef.current = roomCode;
                setQuestions(data.generatedQuestions);
                navigate(`/study?code=${roomCode}`);
                setLoading(false);
            }
        };
    };

    const handleGenerateLink = () => {
        setLoading(true);
        const newErrors = {};

        if (!topic.trim()) newErrors.topic = "Please enter a topic.";
        if (!scope.trim() || scope.trim().length < 20)
            newErrors.scope =
                "Please describe the scope in more detail (at least 20 characters). Include what should and should NOT be quizzed.";
        if (!questions_ || isNaN(questions_) || questions_ < 1)
            newErrors.questions = "Please enter a valid number of questions.";
        if (!timer || isNaN(timer) || timer < 1)
            newErrors.timer = "Please enter a valid study time (at least 1 minute).";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            if (newErrors.topic) topicRef.current.focus();
            else if (newErrors.scope) scopeRef.current.focus();
            else if (newErrors.questions) questionsRef.current.focus();
            else if (newErrors.timer) timerRef.current.focus();
            setLoading(false);
            return;
        }

        connectWebSocket();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4 py-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-xl space-y-6">
                <h1 className="text-2xl font-bold text-center">Set Up a Duel 🧠⚔️</h1>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-300 p-4 rounded-md text-blue-800 text-sm">
                    <p>
                        <strong>Tip:</strong> Choose a <em>specific</em> topic for a quick and fun game.
                        For example, instead of "US History," try "Manifest Destiny" or "Civil War Battles."
                    </p>
                </div>

                {/* Topic Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        What topic are you studying?
                    </label>
                    <input
                        ref={topicRef}
                        type="text"
                        placeholder="e.g. The French Revolution"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className={`w-full border ${
                            errors.topic ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400`}
                    />
                    {errors.topic && <p className="text-sm text-red-500 mt-1">{errors.topic}</p>}
                </div>

                {/* Scope Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Describe the scope of your topic
                    </label>
                    <textarea
                        ref={scopeRef}
                        placeholder="Include chapters, subtopics, learning goals, or specific concepts. Be sure to tell the AI exactly what should and should NOT be quizzed."
                        value={scope}
                        onChange={(e) => setScope(e.target.value)}
                        rows={5}
                        className={`w-full border ${
                            errors.scope ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400`}
                    />
                    {errors.scope && <p className="text-sm text-red-500 mt-1">{errors.scope}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                        Don't assume the AI knows what you mean. "Unit 3 of APUSH" is not a good scope. "Revolutionary War" is better.
                    </p>
                </div>

                {/* Study Time Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    How much study time do you want? (minutes)
                    </label>
                    <input
                        ref={timerRef}
                        type="number"
                        min={1}
                        max={60}
                        value={timer}
                        onChange={(e) => setTimer(parseInt(e.target.value) || "")}
                        className={`w-full border ${
                            errors.timer ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Recommended: between 10 and 30 minutes for a quick and fun game.
                    </p>
                    {errors.timer && <p className="text-sm text-red-500 mt-1">{errors.timer}</p>}
                </div>

                {/* Questions Quantity */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        How many questions do you want in your quiz?
                    </label>
                    <input
                        ref={questionsRef}
                        type="number"
                        min={1}
                        value={questions_}
                        onChange={(e) => setQuestions_(parseInt(e.target.value) || "")}
                        className={`w-full border ${
                            errors.questions ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.questions && (
                        <p className="text-sm text-red-500 mt-1">{errors.questions}</p>
                    )}
                </div>

                {/* Generate Link Button */}
                <button
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer flex justify-center items-center"
                    onClick={handleGenerateLink}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            Loading{loadingDots}
                            <svg
                                className="animate-spin ml-2 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                                />
                            </svg>
                        </>
                    ) : (
                        "Generate Duel Link"
                    )}
                </button>
            </div>
        </div>
    );
}
