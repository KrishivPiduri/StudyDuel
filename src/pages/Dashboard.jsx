import { useUser } from "@clerk/clerk-react";

export default function Dashboard() {
    const { user } = useUser();

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">
                        Welcome, {user?.firstName || "Duelist"} 👋
                    </h1>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transitionc cursor-pointer"
                        onClick={() => window.location.href = "/duel"}
                    >
                        + Create Duel
                    </button>
                </header>

                {/* Active Duels */}
                <section className="bg-white p-6 rounded-2xl shadow">
                    <h2 className="text-xl font-semibold mb-2">Active Duels</h2>
                    <p className="text-gray-600">You don’t have any active duels right now.</p>
                </section>

                {/* Past Performance */}
                <section className="bg-white p-6 rounded-2xl shadow">
                    <h2 className="text-xl font-semibold mb-2">Past Performance</h2>
                    <p className="text-gray-600">Your quiz history will show up here.</p>
                </section>

                {/* Badge Collection */}
                <section className="bg-white p-6 rounded-2xl shadow">
                    <h2 className="text-xl font-semibold mb-2">Badge Collection</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {/* Sample badge placeholder */}
                        <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 text-center">
                            🏆 No badges yet!
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
