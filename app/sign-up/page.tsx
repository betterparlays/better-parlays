'use client';
import Link from "next/link";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navbar */}
        <nav className="flex justify-between items-center px-4 sm:px-6 md:px-8 py-6 border-b border-black">
            <div className="w-40 h-16 sm:w-48 sm:h-20">
            <Link href="/">
                <svg viewBox="-10 0 340 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full cursor-pointer">
                <text x="16" y="42" fontSize="50" fontWeight="1000" fill="#d1d5db" transform="skewX(-25)">
                    BETTER
                </text>
                <text x="31" y="94" fontSize="50" fontWeight="1000" fill="#d1d5db" transform="skewX(-25)">
                    PARLAYS
                </text>
                </svg>
            </Link>
            </div>
            <ul className="flex flex-nowrap justify-end gap-x-4 sm:gap-x-6 text-xs sm:text-sm font-medium text-black">
            <li className="whitespace-nowrap">
                <Link href="/promotions" className="hover:underline">Promotions</Link>
            </li>
            <li className="whitespace-nowrap">
                <Link href="/our-picks" className="hover:underline">Our Picks</Link>
            </li>
            <li className="whitespace-nowrap">
                <Link href="/sign-up" className="hover:underline">Sign Up</Link>
            </li>
            </ul>
        </nav>

      {/* Sign Up Form */}
      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        <p className="mb-6 text-sm text-gray-700">Maximize your Winnings with Better Parlays!</p>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Your Name"
              className="w-full border border-black rounded px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full border border-black rounded px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="********"
              className="w-full border border-black rounded px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 text-sm font-semibold"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
