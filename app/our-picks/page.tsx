"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function OurPicks() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navbar */}
      <nav className="flex flex-col px-4 sm:px-6 md:px-8 py-6 border-b border-black">
        <div className="flex justify-between items-center">
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

          {/* Desktop Links */}
          <ul className="hidden md:flex flex-nowrap justify-end gap-x-6 text-sm font-medium text-black">
            <li>
              <Link href="/promotions" className="hover:underline">Promotions</Link>
            </li>
            <li>
              <Link href="/our-picks" className="hover:underline">Our Picks</Link>
            </li>
            <li>
              <Link href="/sign-up" className="hover:underline">Sign Up</Link>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-black focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"
          } md:hidden`}
        >
          <ul className="flex flex-col items-center gap-y-4 text-sm font-medium text-black">
            <li>
              <Link href="/promotions" onClick={() => setIsMobileMenuOpen(false)} className="hover:underline">
                Promotions
              </Link>
            </li>
            <li>
              <Link href="/our-picks" onClick={() => setIsMobileMenuOpen(false)} className="hover:underline">
                Our Picks
              </Link>
            </li>
            <li>
              <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)} className="hover:underline">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Picks Content */}
      <div className="p-8 space-y-8">
        <h1 className="text-2xl font-bold">Our Picks</h1>
        <p className="text-sm text-gray-700 mb-6">We&apos;re absolutely loving these parlays that are featured on the <strong>Sportsbook Parlay Place</strong></p>


        <div className="flex flex-col md:flex-row gap-6">
          {/* First Parlay Box */}
          <section className="border border-black p-4 rounded-md shadow-sm w-full md:w-1/2">
            <h2 className="text-xl font-semibold mb-4">Highlighted 6-Leg Parlay</h2>
            <ul className="list-disc list-inside text-sm space-y-2">
              <p><strong>Ronald Acuna Jr.</strong> to record 2+ total bases</p>
              <p><strong>Austin Riley</strong> to record 2+ total bases</p>
              <p><strong>Trea Turner</strong> to record 2+ total bases</p>
              <p><strong>Kyle Schwarber</strong> to record 2+ total bases</p>
              <p><strong>Nick Castellanos</strong> to record 2+ total bases</p>
              <p><strong>Matt Olson</strong> to record 2+ total bases</p>
            </ul>
            <p className="mt-4 text-sm font-semibold">
              Total Odds: <span className="text-green-600">+3789</span>
            </p>
            <p className="text-sm text-gray-600">A $10 wager would return $378.96</p>
            <div className="mt-6">
              <a
                href="https://www.example.com"
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="inline-block px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800"
              >
                Click here to place this bet on Sportsbook
              </a>
            </div>
          </section>

          {/* Second Parlay Box */}
          <section className="border border-black p-4 rounded-md shadow-sm w-full md:w-1/2">
            <h2 className="text-xl font-semibold mb-4">Featured RBI & Hit Parlay</h2>
            <ul className="list-disc list-inside text-sm space-y-2">
              <p><strong>Christian Moore</strong> to record an RBI</p>
              <p><strong>Jo Adell</strong> to record a hit</p>
              <p><strong>James Wood</strong> to record an RBI</p>
              <p><strong>C.J. Abrams</strong> to record a hit</p>
            </ul>
            <p className="mt-4 text-sm font-semibold">
              Total Odds: <span className="text-green-600">+1357</span>
            </p>
            <p className="text-sm text-gray-600">A $10 wager would return $135.77</p>
            <div className="mt-6">
              <a
                href="https://www.example.com"
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="inline-block px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800"
              >
                Click here to place this bet on Sportsbook
              </a>
            </div>
          </section>
        </div>


      </div>

      {/* Footer */}
      <footer className="w-full border-t border-black mt-10 py-10 px-4 bg-white flex justify-center">
        <div className="w-full max-w-screen-lg flex flex-col md:flex-row gap-8">
          <aside className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-sm font-bold text-gray-500 mb-2">Disclaimer</h2>
            <p className="text-xs text-gray-600">
            Companies featured on this website may be our partners that compensate us if you sign up through our links. Must be 21+ and physically present in a legal betting state to bet. If you or someone you know has a gambling problem and wants help, call <strong>1-800-GAMBLER</strong>. Please bet responsibly.
            </p>
          </aside>
          <nav className="flex-1 flex flex-col items-center md:items-start text-xs gap-1">
            <h2 className="text-sm font-bold text-gray-500 mb-2">Quick Links</h2>
            <Link href="/promotions" className="hover:underline text-gray-700">Promotions</Link>
            <Link href="/our-picks" className="hover:underline text-gray-700">Our Picks</Link>
            <Link href="/sign-up" className="hover:underline text-gray-700">Sign Up</Link>
            <Link href="/disclaimer" className="hover:underline text-gray-700">Disclaimer</Link>
            <Link href="/terms-and-privacy-policy" className="hover:underline text-gray-700">Terms and Privacy Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
