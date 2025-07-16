"use client"

import { useState } from "react"
import Image from "next/image"
import { Palette, Sparkles, Crown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

const customizationCategories = [
  {
    id: "dress",
    name: "Custom Dress",
    basePrice: 899,
    image: "/placeholder.svg?height=400&width=300",
    options: {
      colors: ["Black", "Navy", "Burgundy", "Rose Gold", "Emerald", "Ivory"],
      fabrics: ["Silk", "Satin", "Chiffon", "Velvet", "Crepe"],
      lengths: ["Mini", "Midi", "Full Length", "Tea Length"],
      necklines: ["V-Neck", "Round Neck", "Off-Shoulder", "Halter", "Strapless"],
      sleeves: ["Sleeveless", "Cap Sleeve", "3/4 Sleeve", "Long Sleeve", "Bell Sleeve"],
    },
  },
  {
    id: "bag",
    name: "Custom Bag",
    basePrice: 450,
    image: "/placeholder.svg?height=400&width=300",
    options: {
      colors: ["Black", "Brown", "Tan", "Navy", "Burgundy", "Rose Gold"],
      materials: ["Leather", "Suede", "Canvas", "Vegan Leather"],
      sizes: ["Small", "Medium", "Large", "Extra Large"],
      straps: ["Chain", "Leather", "Fabric", "Adjustable", "Fixed"],
      hardware: ["Gold", "Silver", "Rose Gold", "Antique Brass", "Black"],
    },
  },
  {
    id: "blazer",
    name: "Custom Blazer",
    basePrice: 750,
    image: "/placeholder.svg?height=400&width=300",
    options: {
      colors: ["Navy", "Black", "Camel", "Gray", "Burgundy", "Cream"],
      fabrics: ["Wool", "Cashmere", "Linen", "Cotton Blend", "Tweed"],
      fits: ["Slim", "Regular", "Relaxed", "Oversized"],
      lapels: ["Notched", "Peak", "Shawl", "No Lapel"],
      buttons: ["Single Breasted", "Double Breasted", "No Buttons"],
    },
  },
]

export default function CustomDesignPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [customizations, setCustomizations] = useState<Record<string, string>>({})
  const [specialRequests, setSpecialRequests] = useState("")

  const selectedItem = customizationCategories.find((item) => item.id === selectedCategory)

  const calculatePrice = () => {
    if (!selectedItem) return 0
    const basePrice = selectedItem.basePrice
    const customizationFee = Object.keys(customizations).length * 25
    return basePrice + customizationFee + 150 // Base customization fee
  }

  const handleCustomizationChange = (option: string, value: string) => {
    setCustomizations((prev) => ({
      ...prev,
      [option]: value,
    }))
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Palette className="h-8 w-8 text-rosegold" />
          <h1 className="text-4xl font-light text-navy">Custom Design Studio</h1>
        </div>
        <p className="text-lg text-navy/70 max-w-2xl mx-auto">
          Create your perfect piece with our luxury customization service. Every detail crafted to your vision.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Category Selection */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-light text-navy mb-6">Choose Your Base Item</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {customizationCategories.map((category) => (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedCategory === category.id ? "ring-2 ring-rosegold shadow-lg" : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        width={300}
                        height={400}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      {selectedCategory === category.id && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-rosegold text-ivory">
                            <Crown className="w-3 h-3 mr-1" />
                            Selected
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-navy mb-2">{category.name}</h3>
                      <p className="text-sm text-navy/60 mb-3">Starting from ${category.basePrice}</p>
                      <Button
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                      >
                        {selectedCategory === category.id ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Customization Options */}
          {selectedItem && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light text-navy">Customize Your {selectedItem.name}</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(selectedItem.options).map(([optionType, values]) => (
                  <div key={optionType} className="space-y-3">
                    <Label className="text-base font-medium capitalize">
                      {optionType.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <Select
                      value={customizations[optionType] || ""}
                      onValueChange={(value) => handleCustomizationChange(optionType, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${optionType}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {values.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Special Requests</Label>
                <Textarea
                  placeholder="Any special requests or modifications you'd like to make..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-rosegold" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItem ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Base Item:</span>
                      <span>{selectedItem.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span>${selectedItem.basePrice}</span>
                    </div>

                    {Object.keys(customizations).length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="font-medium text-sm">Customizations:</p>
                          {Object.entries(customizations).map(([option, value]) => (
                            <div key={option} className="flex justify-between text-sm">
                              <span className="capitalize">{option}:</span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Customization Fee:</span>
                          <span>${Object.keys(customizations).length * 25}</span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between text-sm">
                      <span>Design Service:</span>
                      <span>$150</span>
                    </div>

                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total:</span>
                      <span>${calculatePrice()}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-navy/60">* Custom items require 2-3 weeks for production</p>
                    <Button
                      className="w-full bg-burgundy hover:bg-burgundy/90 text-ivory"
                      disabled={Object.keys(customizations).length === 0}
                    >
                      Add to Cart
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-navy text-navy hover:bg-navy hover:text-ivory bg-transparent"
                    >
                      Save Design
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-navy/60">
                  <Palette className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a base item to start customizing</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Process Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custom Design Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-rosegold text-ivory rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Design Selection</p>
                    <p className="text-xs text-navy/60">Choose your base item and customizations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-rosegold text-ivory rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Design Review</p>
                    <p className="text-xs text-navy/60">Our team reviews and confirms your design</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-rosegold text-ivory rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Crafting</p>
                    <p className="text-xs text-navy/60">Handcrafted by our skilled artisans</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-rosegold text-ivory rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-sm">Delivery</p>
                    <p className="text-xs text-navy/60">Delivered in luxury packaging</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
