import { useState } from "react";
import { Link } from "react-router-dom";
import { UserButton, SignInButton, useUser } from "@clerk/clerk-react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const { isSignedIn } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold text-indigo-600">
                            CramMate
                        </Link>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link
                            to="/dashboard"
                            className="text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/about"
                            className="text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                        >
                            About
                        </Link>

                        {isSignedIn ? (
                            <UserButton afterSignOutUrl="/" />
                        ) : (
                            <SignInButton mode="modal">
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition cursor-pointer">
                                    Sign In
                                </button>
                            </SignInButton>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-indigo-600 focus:outline-none">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav Panel */}
            {isOpen && (
                <div className="md:hidden px-4 pb-4 space-y-2">
                    <Link
                        to="/dashboard"
                        className="block text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/about"
                        className="block text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                    >
                        About
                    </Link>

                    {isSignedIn ? (
                        <div className="pt-2">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    ) : (
                        <SignInButton mode="modal">
                            <button
                                className="w-full mt-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition cursor-pointer"
                                onClick={() => setIsOpen(false)}
                            >
                                Sign In
                            </button>
                        </SignInButton>
                    )}
                </div>
            )}
        </nav>
    );
}
