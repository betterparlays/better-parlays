'use client';
import Link from "next/link";

const decimalToAmerican = (decimal: number): string => {
  if (decimal >= 2.0) return `+${Math.floor((decimal - 1) * 100)}`;
  if (decimal > 1.0) return `-${Math.floor(100 / (decimal - 1))}`;
  return "N/A";
};

export default function OurPicks() {
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

      {/* Picks Content */}
      <div className="p-8 space-y-8">
        <h1 className="text-2xl font-bold">Our Picks</h1>
        <p className="text-sm text-gray-700">Explore our latest expert parlays across major leagues.</p>

        {/* NBA Parlay */}
        <section className="border border-black p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold">NBA Parlay</h2>
          <div className="text-left">
            <img src="/Jalen_Brunson.webp" alt="Jalen Brunson shooting" className="max-h-60 object-contain rounded mt-1 mb-3" />
          </div>
          <p className="text-sm">Our 3-leg NBA parlay for tonight features great value and matchups:</p>
          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
            <li><strong>New York Knicks</strong> to win over the Pacers at {decimalToAmerican(1.39)} odds.</li>
            <li><strong>Minnesota Timberwolves</strong> to upset the Thunder at {decimalToAmerican(2.22)} odds.</li>
            <li><strong>Jalen Brunson</strong> to score 25+ points. He’s averaged 27+ PPG over the last 5 games.</li>
          </ul>
          <p className="text-sm mt-2">
            Total Parlay Odds: <strong>{decimalToAmerican(4.3)}</strong>
          </p>
        </section>

        {/* MLB Parlay */}
        <section className="border border-black p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold">MLB Parlay</h2>
          <div className="text-left">
            <img src="/Cubs_Ace.webp" alt="Chicago Cubs pitcher" className="max-h-60 object-contain rounded mt-1 mb-3" />
          </div>
          <p className="text-sm">Our 3-leg MLB parlay targets smart moneyline picks for value:</p>
          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
            <li><strong>Baltimore Orioles</strong> to beat the Red Sox at {decimalToAmerican(1.62)} odds.</li>
            <li><strong>Chicago Cubs</strong> over the Reds at {decimalToAmerican(1.86)} odds.</li>
            <li><strong>Milwaukee Brewers</strong> to beat the Pirates at {decimalToAmerican(2.06)} odds.</li>
          </ul>
          <p className="text-sm mt-2">
            Total Parlay Odds: <strong>{decimalToAmerican(6.2)}</strong>
          </p>
        </section>

        {/* NHL Parlay */}
        <section className="border border-black p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold">NHL Parlay</h2>
          <div className="text-left">
            <img src="/Oilers.jpeg" alt="Edmonton Oilers player" className="max-h-60 object-contain rounded mt-1 mb-3" />
          </div>
          <p className="text-sm">This 2-leg NHL parlay leans on playoff momentum and goalie matchups:</p>
          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
            <li><strong>Edmonton Oilers</strong> to win over the Stars at {decimalToAmerican(1.95)} odds.</li>
            <li><strong>Florida Panthers</strong> to take down the Hurricanes at {decimalToAmerican(1.65)} odds.</li>
          </ul>
          <p className="text-sm mt-2">
            Total Parlay Odds: <strong>{decimalToAmerican(3.22)}</strong>
          </p>
        </section>
      </div>
      <footer className="w-full border-t border-black mt-10 py-10 px-4 bg-white flex justify-center">
        <div className="w-full max-w-screen-lg flex flex-col md:flex-row gap-8">

          {/* Disclaimer Section */}
          <aside className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-sm font-bold text-gray-500 mb-2">Disclaimer</h2>
            <p className="text-xs text-gray-600">
              Companies featured on this website may be our partners that compensate us if you sign up through our links. Must be 21+ and physically present in New Jersey to bet. If you or someone you know has a gambling problem and wants help, call <strong>1-800-GAMBLER</strong>. Please bet responsibly.
            </p>
          </aside>

          {/* Links Section */}
          <nav className="flex-1 flex flex-col items-center md:items-start text-xs gap-1">
            <h2 className="text-sm font-bold text-gray-500 mb-2">Quick Links</h2>
            <Link href="/promotions" className="hover:underline text-gray-700">Promotions</Link>
            <Link href="/our-picks" className="hover:underline text-gray-700">Our Picks</Link>
            <Link href="/sign-up" className="hover:underline text-gray-700">Sign Up</Link>
            <Link href="/disclaimer" className="hover:underline text-gray-700">Disclaimer</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
