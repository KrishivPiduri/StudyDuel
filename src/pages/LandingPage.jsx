import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-600 to-indigo-700 flex flex-col justify-center items-center px-6 py-12 text-white">
            {/* Hero Section */}
            <header className="max-w-3xl text-center mb-12">
                <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
                    Duel Your Brain! 🧠⚔️
                </h1>
                <p className="text-lg md:text-xl text-blue-100 mb-8">
                    Turn study sessions into quick, fun, and competitive duels with friends.
                    Customize topics, scope, and quiz length to fit your pace.
                </p>
                <button
                    onClick={() => navigate("/duel")}
                    className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-blue-50 transition cursor-pointer"
                >
                    Set Up a Duel Now
                </button>
            </header>

            {/* Features Section */}
            <section className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-10 text-center text-black">
                <div className="bg-white bg-opacity-20 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-bold mb-3">🎯 Focused Topics</h2>
                    <p>
                        Choose specific topics like “Manifest Destiny” for targeted, effective learning.
                    </p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-bold mb-3">⏱️ Quick Sessions</h2>
                    <p>
                        Customize study time between 10 and 30 minutes for fast, engaging duels.
                    </p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-bold mb-3">🤝 Challenge Friends</h2>
                    <p>
                        Invite friends to compete and boost your learning through friendly competition.
                    </p>
                </div>
            </section>

            {/* Footer / CTA reminder */}
            <footer className="mt-16 text-blue-200 text-center text-sm">
                <p>
                    Ready to challenge yourself?{" "}
                    <button
                        onClick={() => navigate("/duel-setup")}
                        className="underline font-semibold hover:text-white"
                    >
                        Start a duel now!
                    </button>
                </p>
            </footer>
        </div>
    );
}
