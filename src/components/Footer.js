// components/Footer.js
import { FaInstagram } from 'react-icons/fa'; // Import icons
import { SiX } from 'react-icons/si'; // Import the new Twitter (X) icon
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="py-10">
      {/* Top Section */}
      <div className="bg-gray-900 text-white p-6">
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Top Topics */}
          <div>
            <h3 className="font-bold mb-4">Top Topics</h3>
            <ul>
              <li><a href="#" className="hover:underline">2024 Elections ↗</a></li>
              <li><a href="#" className="hover:underline">Football ↗</a></li>
              <li><a href="#" className="hover:underline">Crime ↗</a></li>
              <li><a href="#" className="hover:underline">Markets ↗</a></li>
            </ul>
          </div>

          {/* Trending in U.S */}
          <div>
            <h3 className="font-bold mb-4">Trending in U.S</h3>
            <ul>
              <li><a href="#" className="hover:underline">2024 Elections ↗</a></li>
              <li><a href="#" className="hover:underline">Football ↗</a></li>
              <li><a href="#" className="hover:underline">Crime ↗</a></li>
              <li><a href="#" className="hover:underline">Markets ↗</a></li>
            </ul>
          </div>

          {/* World */}
          <div>
            <h3 className="font-bold mb-4">World</h3>
            <ul>
              <li><a href="#" className="hover:underline">Europe ↗</a></li>
              <li><a href="#" className="hover:underline">Asia ↗</a></li>
              <li><a href="#" className="hover:underline">Africa ↗</a></li>
              <li><a href="#" className="hover:underline">South America ↗</a></li>
            </ul>
          </div>

          {/* Sport */}
          <div>
            <h3 className="font-bold mb-4">Sport</h3>
            <ul>
              <li><a href="#" className="hover:underline">Football ↗</a></li>
              <li><a href="#" className="hover:underline">Hockey ↗</a></li>
              <li><a href="#" className="hover:underline">Baseball ↗</a></li>
              <li><a href="#" className="hover:underline">Basketball ↗</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-gray-200 p-6">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <Image src="/images/logo.png" alt="Logo" width={150} height={40} className="h-10 w-auto" />
            </Link>
          </div>

          {/* Middle Links */}
          <div className="flex space-x-6">
            <ul>
              <li><a href="#" className="font-bold hover:underline">My feed</a></li>
              <li><a href="#" className="font-bold hover:underline">Lopsided</a></li>
              <li><a href="#" className="font-bold hover:underline">Local news</a></li>
              <li><a href="#" className="font-bold hover:underline">Timelines</a></li>
            </ul>
          </div>

          <div className="flex space-x-6">
            <ul>
              <li><a href="#" className="font-bold hover:underline">About Us</a></li>
              <li><a href="#" className="font-bold hover:underline">Contact Us</a></li>
              <li><a href="#" className="font-bold hover:underline">FAQ</a></li>
            </ul>
          </div>

          {/* Social and Subscribe */}
          <div className="flex space-x-4 items-center justify-end">
            <a href="#" className="hover:underline"><SiX className="h-6 w-6 text-gray-800" /></a>
            <a href="#" className="hover:underline"><FaInstagram className="h-6 w-6 text-gray-800" /></a>
            <button className="bg-black text-white px-4 py-2 rounded">Subscribe</button>
          </div>
        </div>

        {/* Bottom Links with Copyright */}
        <div className="mt-4 container mx-auto flex justify-between items-center text-sm text-gray-600 px-4">
          <div>© {new Date().getFullYear()} All Rights Reserved</div>
          <div>
            <a href="#" className="mr-4 hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Use</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
