"use client"; // Ensure client-side rendering

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaClock, FaUser, FaMapMarkerAlt, FaBookmark, FaSearch } from 'react-icons/fa'; // Import icons
import { GiHamburgerMenu } from 'react-icons/gi'; // Import hamburger icon

export default function Header() {
  const [currentTime, setCurrentTime] = useState(null);
  const [isFeedDropdownOpen, setIsFeedDropdownOpen] = useState(false); // State for My Feed dropdown
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const [location, setLocation] = useState("New York"); // Default location

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(new Date());
    };

    updateCurrentTime(); // Set the initial time
    const timer = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(timer); // Cleanup timer on component unmount
  }, []);

  return (
    <header className="bg-gray-100 border-b border-gray-300 py-2">
      <div className="container mx-auto flex justify-between items-center px-4">
        
        {/* Hamburger Icon for Mobile */}
        <button className="md:hidden text-gray-800" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <GiHamburgerMenu size={24} />
        </button>
        
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={120}
              height={32}
              className="h-8 w-auto mr-2 cursor-pointer"
            />
            {/* <span className="text-lg font-bold">VTNews</span> */}
          </Link>
        </div>

        {/* Icons and Buttons on Mobile */}
        <div className="flex items-center space-x-4 md:hidden">
          <button className="text-gray-700">
            <FaUser />
          </button>
          <Link href="/signup" className="bg-black text-white px-4 py-2 rounded-lg">
            Try for free
          </Link>
        </div>

        {/* Desktop Navigation and Buttons */}
        <div className="hidden md:flex items-center justify-between w-full ml-6 pl-6">
          {/* Navigation */}
          <nav className="flex space-x-6 text-gray-800 font-medium">
            <Link href="/" className="hover:underline relative group">
              Home
              <div className="h-0.5 bg-black mt-1 absolute bottom-0 left-0 right-0 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>

            {/* My Feed with Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setIsFeedDropdownOpen(true)}
                onMouseLeave={() => setIsFeedDropdownOpen(false)}
                className="relative group hover:underline flex items-center space-x-1"
              >
                <span>My Feed</span>
                <span className="text-xs">&#x25BC;</span> {/* Down arrow for dropdown */}
              </button>
              {isFeedDropdownOpen && (
                <div
                  onMouseEnter={() => setIsFeedDropdownOpen(true)}
                  onMouseLeave={() => setIsFeedDropdownOpen(false)}
                  className="absolute left-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg"
                >
                  <Link href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Saved News</Link>
                  <Link href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Custom News</Link>
                </div>
              )}
            </div>

            <Link href="#" className="hover:underline relative group">
              Lopsided
              <div className="h-0.5 bg-black mt-1 absolute bottom-0 left-0 right-0 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
            <Link href="#" className="hover:underline relative group">
              Local News
              <div className="h-0.5 bg-black mt-1 absolute bottom-0 left-0 right-0 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
            <Link href="#" className="hover:underline relative group">
              Timelines
              <div className="h-0.5 bg-black mt-1 absolute bottom-0 left-0 right-0 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
          </nav>

          {/* Date, Time, and Location */}
          <div className="flex items-center text-sm text-gray-800 space-x-4">
            {currentTime && (
              <>
                <div className="flex items-center space-x-1">
                  <FaCalendarAlt />
                  <span>{currentTime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaClock />
                  <span>{currentTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-1 relative group">
                  <FaMapMarkerAlt />
                  <span>{location}</span>
                  <span className="text-xs ml-1">&#x25BC;</span> {/* Down arrow for location dropdown */}
                  {/* Location Dropdown */}
                  <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow-lg hidden group-hover:block">
                    <button onClick={() => setLocation("New York")} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">New York</button>
                    <button onClick={() => setLocation("Los Angeles")} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Los Angeles</button>
                    <button onClick={() => setLocation("Chicago")} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Chicago</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Icons and Buttons */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-700">
              <FaBookmark />
            </button>
            <button className="text-gray-700">
              <FaSearch />
            </button>
            <Link
              href="/login"
              className="flex items-center border border-gray-400 px-3 py-1 rounded text-gray-700 hover:bg-gray-200"
            >
              <FaUser className="mr-1" />
              Login
            </Link>
            <Link href="/signup" className="bg-black text-white px-4 py-2 rounded-lg">
              Try for free
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="bg-gray-100 p-4 md:hidden border-t border-gray-300">
          {/* Navigation Links */}
          <Link href="/" className="block py-2 text-gray-700">Home</Link>

          {/* My Feed with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFeedDropdownOpen(!isFeedDropdownOpen)}
              className="block py-2 text-gray-700 w-full text-left"
            >
              My Feed
              <span className="ml-2 text-xs">&#x25BC;</span>
            </button>
            {isFeedDropdownOpen && (
              <div className="ml-4 mt-1">
                <Link href="/news/saved" className="block py-2 text-gray-700">Saved News</Link>
                <Link href="/news/custom" className="block py-2 text-gray-700">Custom News</Link>
              </div>
            )}
          </div>

          <Link href="/lopsided" className="block py-2 text-gray-700">Lopsided</Link>
          <Link href="/local-news" className="block py-2 text-gray-700">Local News</Link>
          <Link href="/timelines" className="block py-2 text-gray-700">Timelines</Link>

          {/* Location Selector */}
          <div className="border-t pt-2 mt-2">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Location:</h3>
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700">
                {location}
              </button>
              <span className="ml-2 text-xs">&#x25BC;</span> {/* Down arrow for location dropdown */}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
