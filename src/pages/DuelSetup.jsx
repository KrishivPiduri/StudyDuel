import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DuelSetup() {
    const [topic, setTopic] = useState("");
    const [timer, setTimer] = useState(15);
    const [duelLink, setDuelLink] = useState(null);
    const navigate = useNavigate();

    const handleGenerateLink = () => {
        if (!topic) return alert("Please enter a topic.");

        // In real use, you'd call your backend to create a duel session
        const link = `${window.location.origin}/study?topic=${encodeURIComponent(
            topic
        )}&time=${timer}`;
        setDuelLink(link);
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
                        type="text"
                        placeholder="e.g. The French Revolution"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
