import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useWebSocket } from "../../context/WebSocketContext"; // adjust as needed

export default function StudyRoom() {
    const [searchParams] = useSearchParams();
    const [topic, setTopic] = useState("Unknown Topic");
    const [time, setTime] = useState(15);
    const [loading, setLoading] = useState(true);
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
            console.log(data);
            console.log(data.type==="oppJoined");
            if (data.type === "oppJoined") {
                setGuestStatus("connected");
            } else {
                const room = data.room || {};

                if (room) {
                    setTopic(room.topic || "Unknown Topic");
                    setTime(room.studyTime || 15);
                    setCountdown((room.studyTime || 15) * 60);

                    // Set role
                    const isCurrentHost = room.hostId === user.id;
                    setIsHost(isCurrentHost);

                    // Set opponent readiness
                    const opponentIsReady = isCurrentHost ? room.guestReady : room.hostReady;
                    setOpponentReady(opponentIsReady);

                    // ✅ Set loading to false after we get room data
                    setLoading(false);
                }

                switch (data.type) {
                    case "alrHost":
                        setIsHost(true);
                        break;
                    case "joinSucc":
                        // All room info is handled above
                        break;
                    case "opponentReady":
                        setOpponentReady(true);
                        break;
                    case "startGame":
                        setStudyStarted(true);
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
            }
        };

        socket.addEventListener("message", handleMessage);
        return () => socket.removeEventListener("message", handleMessage);
    }, [socketRef, user, isHost]);


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
        send({
            action: "ready",
            roomCode,
            userId: user.id,
        });
    };
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-700 text-xl font-semibold animate-pulse">
                    Joining room...
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
            <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Study Duel: {topic}</h1>
                    <p className="text-gray-600">Study Time: {time} minutes</p>
                    <p className="text-sm text-gray-500 mt-1">
                        You are the <span className="font-semibold">{isHost ? "Host" : "Guest"}</span>
                    </p>
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
                        <p className="font-semibold">{isHost ? "Opponent" : "Host"}</p>
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
                    </div>
                </div>
            </div>
        </div>
    );
}
