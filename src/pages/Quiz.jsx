import { useEffect, useState } from "react";
import useSound from "use-sound";
import correctSfx from "/sounds/correct.mp3";
import wrongSfx from "/sounds/wrong.mp3";
import levelUpSfx from "/sounds/level-up.mp3";
import useWebSocket from "react-use-websocket";

export default function Quiz() {
    const [playCorrect] = useSound(correctSfx);
    const [playWrong] = useSound(wrongSfx);
    const [playLevelUp] = useSound(levelUpSfx);

    const [topicName, setTopicName] = useState("");
    const [scopeDescription, setScopeDescription] = useState("");
    const [hasSubmittedDescription, setHasSubmittedDescription] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [questionTimer, setQuestionTimer] = useState(15);
    const {questions} = useWebSocket();

    const current = questions[currentIndex];

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

        const correct = option === current.answer;
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

    if (!hasSubmittedDescription) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-black text-white px-4 text-center">
                <h1 className="text-3xl font-bold mb-4">Set Up Your Custom Quiz</h1>
                <p className="text-md text-gray-300 mb-6 max-w-xl">
                    Tell us what you're studying and describe the full scope of what you need to know.
                    Include chapter names, key topics, concepts, or any details from your course.
                    The more detailed you are, the better your questions will be.
                </p>

                <input
                    type="text"
                    className="w-full max-w-xl p-4 text-black rounded-lg mb-4"
                    placeholder="Enter your topic (e.g., Biology 101, World War II)"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                />

                <textarea
                    className="w-full max-w-xl h-40 p-4 text-black rounded-lg resize-none mb-4"
                    placeholder="Describe the scope of your topic in detail (e.g., cell biology, photosynthesis, evolution...)"
                    value={scopeDescription}
                    onChange={(e) => setScopeDescription(e.target.value)}
                />

                <button
                    disabled={topicName.trim().length < 3 || scopeDescription.trim().length < 20}
                    onClick={() => setHasSubmittedDescription(true)}
                    className={`px-6 py-3 rounded-xl text-white font-bold transition-all ${
                        topicName.trim().length < 3 || scopeDescription.trim().length < 20
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                    Start Quiz
                </button>
            </div>
        );
    }

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
        <div className="min-h-screen w-screen bg-gray-900 text-white flex flex-col justify-center items-center overflow-hidden px-4">
            <div className="text-3xl font-bold mb-6 text-center">{current.question}</div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                {current.options.map((opt) => (
                    <button
                        key={opt}
                        disabled={!!selected}
                        onClick={() => handleSelect(opt)}
                        className={`p-4 rounded-xl transition-all duration-300 text-lg font-semibold cursor-pointer
                            ${selected
                            ? opt === current.answer
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

            <div className="flex gap-12 mb-6 text-2xl font-bold text-center">
                <div className="text-blue-400">
                    Time:{" "}
                    <span className={`${questionTimer <= 5 ? "text-red-500 font-extrabold" : "text-white"} text-3xl`}>
                        {questionTimer}s
                    </span>
                </div>
                <div className="text-green-400">
                    Score: <span className="text-white text-3xl">{score}</span>
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
