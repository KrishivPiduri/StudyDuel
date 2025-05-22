import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../../context/WebSocketContext.jsx";
import { useUser } from "@clerk/clerk-react";

export default function ClaimInfinite() {
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingDots, setLoadingDots] = useState("");

    const usernameRef = useRef(null);
    const { connect, send, socketRef } = useWebSocket();
    const { user } = useUser();

    useEffect(() => {
        if (!loading) {
            setLoadingDots("");
            return;
        }

        let count = 0;
        const interval = setInterval(() => {
            count = (count + 1) % 4;
            setLoadingDots(".".repeat(count));
        }, 400);

        return () => clearInterval(interval);
    }, [loading]);

    const connectWebSocket = () => {
        connect();

        socketRef.current.onopen = () => {
            send({
                username,
                userId: user.id,
            });
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case "claim_success":
                    setMessage("✅ Access to infinite mode granted.");
                    break;
                case "already_infinite":
                    setMessage("✔️ You've already claimed infinite mode.");
                    break;
                case "not_commented":
                    setMessage("⚠️ It looks like you haven't commented yet.");
                    break;
                case "error":
                case "internal_error":
                    setMessage("❌ " + data.message);
                    break;
                default:
                    setMessage("❌ Unexpected response from server.");
            }

            setLoading(false);
        };

        socketRef.current.onerror = () => {
            setMessage("❌ Connection error. Please try again.");
            setLoading(false);
        };
    };

    const handleClaim = () => {
        setMessage("");
        setLoading(true);

        if (!username.trim()) {
            setMessage("⚠️ Please enter your Reddit username.");
            usernameRef.current?.focus();
            setLoading(false);
            return;
        }

        if (!user?.id) {
            setMessage("❌ You must be logged in to claim access.");
            setLoading(false);
            return;
        }

        connectWebSocket();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4 py-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-xl space-y-6">
                <h1 className="text-2xl font-bold text-center">Claim Infinite Mode ♾️</h1>

                <p className="text-sm text-gray-600">
                    To unlock infinite mode, comment on{" "}
                    <a
                        href="https://www.reddit.com/r/YourSubreddit/comments/your_post"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                    >
                        this Reddit thread
                    </a>{" "}
                    and enter your Reddit username below.
                </p>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reddit Username
                    </label>
                    <input
                        ref={usernameRef}
                        type="text"
                        placeholder="e.g. u/yourname"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    />
                </div>

                <button
                    onClick={handleClaim}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition flex justify-center items-center"
                >
                    {loading ? (
                        <>
                            Claiming{loadingDots}
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
                        "Claim Access"
                    )}
                </button>

                {message && (
                    <div className="text-sm text-gray-800 border border-gray-200 p-3 rounded-md bg-gray-50">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
