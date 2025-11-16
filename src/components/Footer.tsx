import { Instagram, Facebook, Twitter } from 'lucide-react';
import { Ghost } from 'lucide-react';
import { CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Customer Care */}
          <div>
            <h3 className="text-sm tracking-widest uppercase mb-6 font-semibold">
              Customer Care
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm tracking-wider hover:opacity-60 transition-opacity"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm tracking-wider hover:opacity-60 transition-opacity"
                >
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm tracking-wider hover:opacity-60 transition-opacity"
                >
                  Size Guide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm tracking-wider hover:opacity-60 transition-opacity"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-sm tracking-widest uppercase mb-6 font-semibold">
              Follow Us
            </h3>
            <div className="flex space-x-3 mb-6">
              <a
                href="#"
                className="group p-3 border border-black hover:bg-black transition-all duration-300 rounded-full"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                className="group p-3 border border-black hover:bg-black transition-all duration-300 rounded-full"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                className="group p-3 border border-black hover:bg-black transition-all duration-300 rounded-full"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                className="group p-3 border border-black hover:bg-black transition-all duration-300 rounded-full"
                aria-label="Snapchat"
              >
                <Ghost className="w-5 h-5 group-hover:text-white transition-colors" />
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
