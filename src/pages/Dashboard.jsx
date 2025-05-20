import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {useNavigate} from "react-router-dom";

function Button({ children, className, ...props }) {
    return (
        <button
            className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const [createdCount, setCreatedCount] = useState(0);
    const [joinedCount, setJoinedCount] = useState(0);
    const navigate= useNavigate();

    useEffect(() => {
        if (isLoaded && user) {
            // Pull from publicMetadata, fallback to 0 if missing
            setCreatedCount(user.publicMetadata?.roomsCreated ?? 0);
            setJoinedCount(user.publicMetadata?.roomsJoined ?? 0);
        }
    }, [isLoaded, user]);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
            <h1 className="text-4xl font-bold mb-6">Your Duel Dashboard</h1>

            <div className="grid gap-6 mb-8 text-center">
                <div className="bg-gray-800 p-6 rounded-xl shadow-md">
                    <p className="text-lg text-gray-400">Duels Created</p>
                    <p className="text-3xl font-bold text-green-400">{createdCount}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl shadow-md">
                    <p className="text-lg text-gray-400">Duels Joined</p>
                    <p className="text-3xl font-bold text-blue-400">{joinedCount}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl shadow-md">
                    <p className="text-lg text-gray-400">Maximum Allowed</p>
                    <p className="text-3xl font-bold text-yellow-400">∞</p>
                    <p className="text-sm text-gray-500 mt-1">Limits coming soon</p>
                </div>
            </div>

            <Button
                className="text-xl px-8 py-3 bg-green-600 hover:bg-green-700 rounded-xl cursor-pointer"
                onClick={() => {
                    // Logic to create a duel
                    navigate("/duel");
                }}
            >
                ➕ Create Duel
            </Button>
        </div>
    );
}
