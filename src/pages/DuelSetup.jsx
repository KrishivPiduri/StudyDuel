import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const WEBSOCKET_URL = "wss://0qv6ptdpdh.execute-api.us-east-1.amazonaws.com/production/";

export default function DuelSetup() {
    const [topic, setTopic] = useState("");
    const [timer, setTimer] = useState(15);
    const [duelLink, setDuelLink] = useState(null);
    const [questions, setQuestions] = useState(10);
    const [errors, setErrors] = useState({});

    const topicRef = useRef(null);
    const questionsRef = useRef(null);
    const socketRef = useRef(null);
    const navigate = useNavigate();

    const connectWebSocket = () => {
        socketRef.current = new WebSocket(WEBSOCKET_URL);

        socketRef.current.onopen = () => {
            console.log("WebSocket connection established.");
            socketRef.current.send(
                JSON.stringify({
                    action: "createRoom",
                    topic: topic,
                    studyTime: timer,
                    questions: questions,
                })
            );
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "roomCreated") {
                setDuelLink(`${window.location.origin}/study?code=${data.roomCode}`);
            }
        };

        socketRef.current.onclose = () => {
            console.log("WebSocket connection closed.");
        };
    };

    const handleGenerateLink = () => {
        const newErrors = {};

        if (!topic.trim()) {
            newErrors.topic = "Please enter a topic.";
        }

        if (!questions || isNaN(questions) || questions < 1) {
            newErrors.questions = "Please enter a valid number of questions.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            if (newErrors.topic) topicRef.current.focus();
            else if (newErrors.questions) questionsRef.current.focus();
            return;
        }

        connectWebSocket();
        socketRef.current.send(JSON.stringify({
            action: "createRoom",
            topic: topic,
            studyTime: timer,
            questions: questions,
        }));
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
                        className={`w-full placeholder-gray-400 border ${
                            errors.topic ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.topic && (
                        <p className="text-sm text-red-500 mt-1">{errors.topic}</p>
                    )}
                </div>

                {/* Questions Quantity */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        How many questions do you want in your quiz?
                    </label>
                    <input
                        ref={questionsRef}
                        type="number"
                        value={questions}
                        onChange={(e) => setQuestions(parseInt(e.target.value))}
                        className={`w-full placeholder-gray-400 border ${
                            errors.questions ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.questions && (
                        <p className="text-sm text-red-500 mt-1">{errors.questions}</p>
                    )}
                </div>

                {/* Timer Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Study Time (minutes)
                    </label>
                    <select
                        value={timer}
                        onChange={(e) => setTimer(parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                        {[10, 15, 20, 25, 30].map((min) => (
                            <option key={min} value={min}>
                                {min} minutes
                            </option>
                        ))}
                    </select>
                </div>

                {/* Generate Link */}
                <button
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                    onClick={handleGenerateLink}
                >
                    Generate Duel Link
                </button>

                {/* Shareable Link Display */}
                {duelLink && (
                    <div className="bg-gray-50 p-4 border border-gray-300 rounded-lg text-center">
                        <p className="mb-2 text-gray-700 font-medium">Share this link with your friend:</p>
                        <input
                            type="text"
                            readOnly
                            value={duelLink}
                            className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                            onClick={(e) => e.target.select()}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
