import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-navy text-ivory">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-light tracking-wider">IMPRESSA</h3>
            <p className="text-ivory/80 text-sm leading-relaxed">
              Crafting luxury fashion with personalized elegance. Every piece tells your unique story.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="font-medium text-rosegold">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-ivory/80 hover:text-rosegold transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-ivory/80 hover:text-rosegold transition-colors"
                >
                  Clothing
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-ivory/80 hover:text-rosegold transition-colors">
                  Bags
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-ivory/80 hover:text-rosegold transition-colors">
                  Shoes
                </Link>
              </li>
              <li>
                <Link href="/custom" className="text-ivory/80 hover:text-rosegold transition-colors">
                  Custom Design
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-medium text-rosegold">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-ivory/80 hover:text-rosegold transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-ivory/80 hover:text-rosegold transition-colors">
                  Size Guide
                </Link>
              </li>
              {/* <li>
                <Link href="/shipping" className="text-ivory/80 hover:text-rosegold transition-colors">
                  Shipping Info
                </Link>
              </li> */}
              {/* <li>
                <Link href="/returns" className="text-ivory/80 hover:text-rosegold transition-colors">
                  Returns
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="font-medium text-rosegold">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-ivory/80 hover:text-rosegold transition-colors">
                  Instagram
                </Link>
              </li>
              {/* <li>
                <Link href="#" className="text-ivory/80 hover:text-rosegold transition-colors">
                  Pinterest
                </Link>
              </li> */}
              <li>
                <Link href="#" className="text-ivory/80 hover:text-rosegold transition-colors">
                  Email
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ivory/20 mt-12 pt-8 text-center">
          <p className="text-ivory/60 text-sm">© 2024 Impressa. All rights reserved. Crafted with luxury in mind.</p>
        </div>
      </div>
    </footer>
  )
}
