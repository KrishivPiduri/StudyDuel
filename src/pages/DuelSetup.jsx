import { useRef, useState } from "react";
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

    const topicRef = useRef(null);
    const questionsRef = useRef(null);
    const scopeRef = useRef(null);
    const timerRef = useRef(null);

    const { connect, send, socketRef, roomCodeRef, questions } = useWebSocket();
    const navigate = useNavigate();
    const { user } = useUser();

    const connectWebSocket = () => {
        connect();

        socketRef.current.onopen = () => {
            console.log("WebSocket connection established.");
            send({
                action: "createRoom",
                topic,
                scope,
                studyTime: timer,
                questions,
                hostId: user.id,
            });
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "roomCreated") {
                const { roomCode } = data;
                roomCodeRef.current = roomCode;
                navigate(`/study?code=${roomCode}`);
            }
        };

        socketRef.current.onclose = () => {
            console.log("WebSocket connection closed.");
        };
    };

    const handleGenerateLink = () => {
        setLoading(true);
        const newErrors = {};

        if (!topic.trim()) newErrors.topic = "Please enter a topic.";
        if (!scope.trim() || scope.trim().length < 20)
            newErrors.scope = "Please describe the scope in more detail (at least 20 characters).";
        if (!questions_ || isNaN(questions_) || questions_ < 1)
            newErrors.questions = "Please enter a valid number of questions.";
        if (!timer || isNaN(timer) || timer < 10)
            newErrors.timer = "Please select a valid study time.";

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
                        } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                        placeholder="Include chapters, subtopics, learning goals, or specific concepts..."
                        value={scope}
                        onChange={(e) => setScope(e.target.value)}
                        rows={5}
                        className={`w-full border ${
                            errors.scope ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.scope && <p className="text-sm text-red-500 mt-1">{errors.scope}</p>}
                </div>

                {/* Study Time Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        How much study time do you want?
                    </label>
                    <select
                        ref={timerRef}
                        value={timer}
                        onChange={(e) => setTimer(parseInt(e.target.value))}
                        className={`w-full border ${
                            errors.timer ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                        {[10, 15, 20, 25, 30].map((min) => (
                            <option key={min} value={min}>
                                {min} minutes
                            </option>
                        ))}
                    </select>
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
                        value={questions_}
                        onChange={(e) => setQuestions_(parseInt(e.target.value))}
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
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                    onClick={handleGenerateLink}
                >
                    {loading ? "Loading..." : "Generate Duel Link"}
                </button>
            </div>
        </div>
    );
}
