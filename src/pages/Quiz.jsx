// src/pages/Quiz.tsx
import { useEffect, useState } from "react";
import useSound from "use-sound";
import correctSfx from "/sounds/correct.mp3";
import wrongSfx from "/sounds/wrong.mp3";
import levelUpSfx from "/sounds/level-up.mp3";

const questions = [
    {
        question: "What is the capital of France?",
        options: ["Berlin", "Paris", "Rome", "Madrid"],
        answer: "Paris",
    },
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "22"],
        answer: "4",
    },
    // Add more questions here
];

export default function Quiz() {
    const [playCorrect] = useSound(correctSfx);
    const [playWrong] = useSound(wrongSfx);
    const [playLevelUp] = useSound(levelUpSfx);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [questionTimer, setQuestionTimer] = useState(15);

    const current = questions[currentIndex];

    useEffect(() => {
        if (questionTimer === 0) {
            handleSelect(null); // Time's up!
        }
        const interval = setInterval(() => {
            setQuestionTimer((t) => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [questionTimer]);

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
            const pointsEarned = baseScore + speedBonus;
            setScore((s) => s + pointsEarned);
            setStreak((s) => s + 1);

            if (streak + 1 === 3) {
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
                    className="px-6 py-2 bg-green-600 text-white rounded-xl mt-4 hover:bg-green-700"
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
                        className={`p-4 rounded-xl transition-all duration-300 text-lg font-semibold
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
