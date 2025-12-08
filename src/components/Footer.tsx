import { Instagram, Facebook, Twitter, Ghost, Mail, Phone, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Customer Care */}
          <div>
            <h3 className="text-sm tracking-widest uppercase mb-6 font-semibold">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:info@pluggedby212.com"
                  className="flex items-center gap-3 text-sm tracking-wider hover:opacity-60 transition-opacity group"
                >
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span>info@pluggedby212.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+2341234567890"
                  className="flex items-center gap-3 text-sm tracking-wider hover:opacity-60 transition-opacity group"
                >
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span>+234 123 456 7890</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm tracking-widest uppercase mb-6 font-semibold">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/track-order"
                  className="flex items-center gap-3 text-sm tracking-wider hover:opacity-60 transition-opacity"
                >
                  <Package className="w-5 h-5 flex-shrink-0" />
                  <span>Track Your Order</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-sm tracking-wider hover:opacity-60 transition-opacity"
                >
                  Shop All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-sm tracking-widest uppercase mb-4 font-semibold">
              Follow Us
            </h3>
            <div className="flex space-x-2 mb-5">
              <a
                href="#"
                className="group p-2 border border-black hover:bg-black transition-all duration-300 rounded-full"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                className="group p-2 border border-black hover:bg-black transition-all duration-300 rounded-full"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                className="group p-2 border border-black hover:bg-black transition-all duration-300 rounded-full"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                className="group p-2 border border-black hover:bg-black transition-all duration-300 rounded-full"
                aria-label="Snapchat"
              >
                <Ghost className="w-4 h-4 group-hover:text-white transition-colors" />
              </a>
            </div>

            {/* Payment Methods */}
            <div>
              <p className="text-xs tracking-wider uppercase mb-3 text-gray-600">
                We Accept
              </p>
              <div className="flex items-center gap-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
                  alt="Visa"
                  className="h-6 object-contain"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
                  alt="Mastercard"
                  className="h-6 object-contain"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/2560px-PayPal.svg.png"
                  alt="PayPal"
                  className="h-5 object-contain"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/2560px-American_Express_logo_%282018%29.svg.png"
                  alt="American Express"
                  className="h-6 object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs tracking-wider text-gray-600">
              © 2024 PLUGGED BY 212. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-xs tracking-wider text-gray-600 hover:text-black transition-colors"
              >
                Nigeria
              </a>
              <span className="text-gray-400">|</span>
              <a
                href="#"
                className="text-xs tracking-wider text-gray-600 hover:text-black transition-colors"
              >
                English
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
