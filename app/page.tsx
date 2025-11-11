import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles, Palette, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import hero from '@/public/shopping-centre.jpg'
import clothes from '@/public/clothing.jpg'
import shoes from '@/public/footwear.jpg'

export default function HomePage() {
  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center luxury-gradient">
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy/90 to-transparent z-10" />
        <Image
          src={hero}
          alt="Luxury Fashion Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 container text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-light tracking-wider text-ivory">IMPRESSA</h1>
          <p className="text-xl md:text-2xl text-ivory/90 font-light max-w-2xl mx-auto leading-relaxed">
            Where luxury meets personalization. Craft your signature style with our exclusive collection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-burgundy hover:bg-burgundy/90 text-ivory px-8 py-6 text-lg font-light"
              asChild
            >
              <Link href="/products">
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {/* <Button
              size="lg"
              variant="outline"
              className="border-navy text-navy hover:bg-navy hover:text-ivory px-8 py-6 text-lg font-light bg-transparent"
              asChild
            >
              <Link href="/custom">Custom Design</Link>
            </Button> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-ivory">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-light text-navy">The Impressa Experience</h2>
            <p className="text-lg text-navy/70 max-w-2xl mx-auto">
              Discover what makes our luxury fashion truly exceptional
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-warmgray/30 bg-ivory hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-rosegold/10 rounded-full flex items-center justify-center mx-auto">
                  <Crown className="h-8 w-8 text-rosegold" />
                </div>
                <h3 className="text-xl font-medium text-navy">Premium Quality</h3>
                <p className="text-navy/70 leading-relaxed">
                  Handcrafted with the finest materials and attention to every detail for lasting luxury.
                </p>
              </CardContent>
            </Card>

            <Card className="border-warmgray/30 bg-ivory hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-rosegold/10 rounded-full flex items-center justify-center mx-auto">
                  <Palette className="h-8 w-8 text-rosegold" />
                </div>
                <h3 className="text-xl font-medium text-navy">Custom Design</h3>
                <p className="text-navy/70 leading-relaxed">
                  Personalize every piece to reflect your unique style and preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="border-warmgray/30 bg-ivory hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-rosegold/10 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-rosegold" />
                </div>
                <h3 className="text-xl font-medium text-navy">Exclusive Collection</h3>
                <p className="text-navy/70 leading-relaxed">
                  Limited edition pieces that ensure your style remains uniquely yours.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-warmgray/20">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-light text-navy">Featured Collections</h2>
            <p className="text-lg text-navy/70">Discover our signature pieces in clothing and accessories</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Clothing Category */}
            <div className="group relative overflow-hidden rounded-lg">
              <Image
                src={clothes}
                alt="Luxury Clothing Collection"
                width={800}
                height={600}
                className="object-cover w-full h-96 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
              <div className="absolute bottom-8 left-8 text-ivory">
                <h3 className="text-3xl font-light mb-2">Clothing</h3>
                <p className="text-ivory/90 mb-4">Elegant wears crafted for sophistication</p>
                <Button
                  variant="outline"
                  className="border-ivory text-ivory hover:bg-ivory hover:text-navy bg-transparent"
                  asChild
                >
                  <Link href="/products?category=clothing">
                    Shop Clothing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Bags Category */}
            <div className="group relative overflow-hidden rounded-lg">
              <Image
                src={shoes}
                alt="Luxury Bags Collection"
                width={800}
                height={600}
                className="object-cover w-full h-96 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
              <div className="absolute bottom-8 left-8 text-ivory">
                <h3 className="text-3xl font-light mb-2">Bags</h3>
                <p className="text-ivory/90 mb-4">Handcrafted accessories for every occasion</p>
                <Button
                  variant="outline"
                  className="border-ivory text-ivory hover:bg-ivory hover:text-navy bg-transparent"
                  asChild
                >
                  <Link href="/products?category=bags">
                    Shop Bags
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-navy">
        <div className="container text-center space-y-8">
          <h2 className="text-4xl font-light text-ivory">Ready to Create Your Signature Look?</h2>
          <p className="text-xl text-ivory/80 max-w-2xl mx-auto">
            Join the exclusive world of personalized luxury fashion
          </p>
          <Button
            size="lg"
            className="bg-burgundy hover:bg-burgundy/90 text-ivory px-8 py-6 text-lg font-light"
            asChild
          >
            <Link href="/custom">
              Start Customizing
              <Sparkles className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
