'use client';

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function DisclaimerPage() {
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
            <li><Link href="/promotions" className="hover:underline">Promotions</Link></li>
            <li><Link href="/our-picks" className="hover:underline">Our Picks</Link></li>
            <li><Link href="/sign-up" className="hover:underline">Sign Up</Link></li>
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

      {/* Disclaimer Content */}
      <main className="w-full max-w-screen-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">Disclaimer</h1>
        <p className="text-sm text-gray-700 leading-relaxed">
          By using the Better Parlays website or any data provided through our platform, you acknowledge that you are solely responsible for your betting decisions, including understanding the wagers you place, their potential outcomes, and the terms and conditions set by the sportsbooks you choose to use.
          <br /><br />
          All content and data on Better Parlays is intended for informational and entertainment purposes only. We do not guarantee outcomes or accuracy, and we do not offer betting advice that guarantees winnings. You place bets at your own risk, and Better Parlays and its operators are not liable for any financial losses, damages, or consequences resulting from reliance on our content or tools.
          <br /><br />
          By accessing and using this site, you agree to these terms and accept full responsibility for your actions related to sports betting.
        </p>
      </main>

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
