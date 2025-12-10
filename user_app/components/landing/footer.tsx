import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">✓</span>
              </div>
              <span className="font-bold text-xl">Zytra Bus</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your trusted partner for comfortable and reliable bus travel across the nation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Book Tickets
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Routes
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary" />
                <span>+1 (800) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                <span>support@zytrabus.com</span>
              </li>
              <li className="flex items-center gap-2 mt-4">
                <div className="flex gap-3">
                  <Facebook size={18} className="hover:text-primary cursor-pointer transition-colors" />
                  <Twitter size={18} className="hover:text-primary cursor-pointer transition-colors" />
                  <Instagram size={18} className="hover:text-primary cursor-pointer transition-colors" />
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>&copy; 2025 Zytra Bus. All rights reserved.</p>
            <p>Made with ❤️ for seamless travel</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
