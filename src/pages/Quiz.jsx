import { useEffect, useState } from "react";
import useSound from "use-sound";
import correctSfx from "/sounds/correct.mp3";
import wrongSfx from "/sounds/wrong.mp3";
import levelUpSfx from "/sounds/level-up.mp3";
import { useWebSocket } from "../../context/WebSocketContext.jsx";
import {useUser} from "@clerk/clerk-react";

export default function Quiz() {
    const [playCorrect] = useSound(correctSfx);
    const [playWrong] = useSound(wrongSfx);
    const [playLevelUp] = useSound(levelUpSfx);

    const [topicName, setTopicName] = useState("");
    const [scopeDescription, setScopeDescription] = useState("");
    const [hasSubmittedDescription, setHasSubmittedDescription] = useState(false);
    const [oppScore, setOppScore] = useState(0);
    const [wasLeading, setWasLeading] = useState(true); // assume user starts ahead
    const [leadChanged, setLeadChanged] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [questionTimer, setQuestionTimer] = useState(15);
    const {questions, send, roomCodeRef, socketRef, connect} = useWebSocket();
    const socketStuff = useWebSocket();
    console.log("socketStuff", socketStuff);
    const { user } = useUser();

    useEffect(() => {
        connect();
        const socket = socketRef.current;
        if (!socket) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type==="scoreUpdate") {
                setOppScore(data.score);
            }
        };

        socket.addEventListener("message", handleMessage);
        return () => socket.removeEventListener("message", handleMessage);
    }, [socketRef]);

    useEffect(() => {
        const currentlyLeading = score >= oppScore;
        if (currentlyLeading !== wasLeading) {
            setLeadChanged(true);
            setWasLeading(currentlyLeading);

            // Reset animation flag after a moment
            setTimeout(() => {
                setLeadChanged(false);
            }, 1500);
        }
    }, [score, oppScore]);

    useEffect(() => {
        if (currentIndex >= questions.length || !hasSubmittedDescription) return;

        if (questionTimer === 0) {
            handleSelect(null);
        }

        const interval = setInterval(() => {
            setQuestionTimer((t) => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [questionTimer, hasSubmittedDescription]);

    const handleSelect = (option) => {
        if (selected) return;
        setSelected(option);

        const correct = option === questions[currentIndex].answer;
        setIsCorrect(correct);
        setShowFeedback(true);

        if (correct) {
            playCorrect();
            const baseScore = 1000;
            const speedBonus = Math.floor((questionTimer / 15) * 100);
            const nextStreak = streak + 1;
            const streakMultiplier = 1 + nextStreak * 0.1;
            const pointsEarned = Math.floor((baseScore + speedBonus) * streakMultiplier);

            setScore((s) => s + pointsEarned);
            send({
                action: "score",
                roomCode: roomCodeRef.current,
                userId: user.id,
                score: score
            })
            setStreak(nextStreak);

            if (nextStreak === 3) {
                playLevelUp();
            }
        } else {
            playWrong();
            setStreak(0);
        }

        setTimeout(() => {
            setSelected(null);
            setShowFeedback(false);
            setQuestionTimer(15);
            setCurrentIndex((i) => i + 1);
        }, 1500);
    };

    if (currentIndex >= questions.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-black text-white text-center space-y-4 px-4">
                <h1 className="text-4xl font-bold">Quiz Complete!</h1>
                <p className="text-2xl">Final Score: <span className="text-green-400 font-bold">{score}</span></p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-green-600 text-white rounded-xl mt-4 hover:bg-green-700 cursor-pointer"
                >
                    Play Again
                </button>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen w-screen bg-gray-900 text-white flex flex-col justify-center items-center overflow-hidden px-4">
            <div className="text-3xl font-bold mb-6 text-center">{questions[currentIndex].question}</div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                {questions[currentIndex].options.map((opt) => (
                    <button
                        key={opt}
                        disabled={!!selected}
                        onClick={() => handleSelect(opt)}
                        className={`p-4 rounded-xl transition-all duration-300 text-lg font-semibold cursor-pointer
                            ${selected
                            ? opt === questions[currentIndex].answer
                                ? "bg-green-500 text-white"
                                : opt === selected
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-700"
                            : "bg-gray-800 hover:bg-gray-700"}
                            ${selected && opt === selected ? "animate-shake" : ""}
                        `}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-6 text-2xl font-bold text-center items-center">
                <div className="text-blue-400">
                    Time:{" "}
                    <span className={`${questionTimer <= 5 ? "text-red-500 font-extrabold" : "text-white"} text-3xl`}>
            {questionTimer}s
        </span>
                </div>

                <div className="text-green-400">
                    Your Score:{" "}
                    <span className="text-white text-3xl">{score}</span>
                </div>
                <div className="text-yellow-400">
                    Streak: <span className="text-white text-3xl">{streak}</span>
                </div>
            </div>

            {showFeedback && (
                <div className={`mt-4 text-2xl font-bold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                    {isCorrect ? "✅ Correct!" : "❌ Oops! Try the next one."}
                </div>
            )}
        </div>
    );
}
