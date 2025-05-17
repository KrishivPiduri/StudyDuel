import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useWebSocket } from "../../context/WebSocketContext"; // adjust as needed

export default function StudyRoom() {
    const [searchParams] = useSearchParams();
    const topic = searchParams.get("topic") || "Unknown Topic";
    const time = parseInt(searchParams.get("time")) || 15;
    const roomCode = searchParams.get("code");

    const [isHost, setIsHost] = useState(false);
    const [guestStatus, setGuestStatus] = useState("waiting");

    const [youReady, setYouReady] = useState(false);
    const [opponentReady, setOpponentReady] = useState(false);
    const [studyStarted, setStudyStarted] = useState(false);
    const [countdown, setCountdown] = useState(time * 60);

    const navigate = useNavigate();
    const { user } = useUser();
    const { socketRef, connect, send } = useWebSocket();

    const getTimerColor = () => {
        if (countdown > 60) return "text-green-600";
        if (countdown > 20) return "text-yellow-500";
        return "text-red-600 animate-pulse";
    };

    // Join room on mount (or when user/roomCode changes)
    useEffect(() => {
        if (!user?.id) return;
        connect();

        const socket = socketRef.current;
        const handleOpen = () => {
            console.log("handleOpen");
            send({
                action: "joinRoom",
                userId: user.id,
                roomCode,
            });
        };

        // If already open, send immediately; otherwise wait for open
        if (socket?.readyState === WebSocket.OPEN) {
            handleOpen();
        } else if (socket) {
            socket.addEventListener("open", handleOpen);
            return () => {
                socket.removeEventListener("open", handleOpen);
            };
        }
    }, [user, roomCode, send, connect, socketRef]);

    // Handle incoming WebSocket messages
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case "alrHost":
                    setIsHost(true);
                    break;
                case "joinSucc":
                    setGuestStatus("connected");
                    break;
                case "guestReady":
                    if (isHost) setOpponentReady(true);
                    break;
                case "hostReady":
                    if (!isHost) setOpponentReady(true);
                    break;
                default:
                    break;
            }
        };

        socket.addEventListener("message", handleMessage);
        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socketRef, isHost]);

    // Start countdown when both are ready
    useEffect(() => {
        if (youReady && opponentReady) {
            setStudyStarted(true);
        }
    }, [youReady, opponentReady]);

    // Countdown timer
    useEffect(() => {
        if (!studyStarted || countdown <= 0) return;
        const timerId = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [studyStarted, countdown]);

    // Redirect to quiz when time’s up
    useEffect(() => {
        if (countdown === 0) {
            navigate("/quiz");
        }
    }, [countdown, navigate]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const handleReady = () => {
        setYouReady(true);
        if (isHost) {
            send({ action: "hostReady", roomCode });
        } else {
            setGuestStatus("ready");
            send({ action: "guestReady", roomCode });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
            <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 space-y-6">
                {/* Header */}
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
                            {opponentReady
                                ? "Ready ✅"
                                : guestStatus === "connected"
                                    ? "Connected 🔗"
                                    : "Waiting..."}
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

                {/* Countdown */}
                {studyStarted && (
                    <div className={`text-center text-3xl font-mono font-bold mt-4 ${getTimerColor()}`}>
                        Study Time Left: {formatTime(countdown)}
                    </div>
                )}

                {/* Shareable Link */}
                <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Share this room link with your friend:
                    </label>
                    <div className="flex items-center gap-2 justify-center">
                        <input
                            type="text"
                            readOnly
                            value={window.location.href}
                            className="w-full max-w-md p-2 border border-gray-300 rounded-lg text-sm bg-white"
                            onClick={(e) => e.target.select()}
                        />
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Link copied to clipboard!");
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
