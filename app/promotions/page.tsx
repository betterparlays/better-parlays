import Link from "next/link";

// pages/promotions.tsx
export default function Promotions() {
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
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Promotions</h1>
        <ul className="space-y-4">
          <li className="border border-black p-4 rounded-md shadow-sm flex justify-between items-center">
            <div>
              <img src="/caesers.avif" alt="Caesars Logo" className="h-10 mb-2" />
              <h2 className="text-xl font-semibold">Caesars Sportsbook</h2>
              <p className="mt-1">Bet $50 and get a $250 bonus bet. Terms and conditions apply. New users only.</p>
            </div>
            <a href="#" className="ml-4 px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800">Visit Caesars Sportsbook</a>
          </li>
          <li className="border border-black p-4 rounded-md shadow-sm flex justify-between items-center">
            <div>
              <img src="/Tropicana_Entertainment_logo.png" alt="Tropicana Logo" className="h-14 mb-2" />
              <h2 className="text-xl font-semibold">Tropicana Sportsbook</h2>
              <p className="mt-1">Deposit and bet $10 to receive $100 in bonus bets. Offer valid this month only.</p>
            </div>
            <a href="#" className="ml-4 px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800">Visit Tropicana Sportsbook</a>
          </li>
          <li className="border border-black p-4 rounded-md shadow-sm flex justify-between items-center">
            <div>
              <img src="/betparx.png" alt="Bet Parx Logo" className="h-10 mb-2" />
              <h2 className="text-xl font-semibold">Bet Parx</h2>
              <p className="mt-1">Get a 100% deposit match up to $250 on your first bet. Use promo code PARX100.</p>
            </div>
            <a href="#" className="ml-4 px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800">Visit Bet Parx Sportsbook</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
