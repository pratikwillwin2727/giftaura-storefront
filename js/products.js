/**
 * GiftAura (@gifts.aura_) - Real Product Catalog Seed Data
 * Handcrafted in Kalyan, Maharashtra
 */

const INITIAL_PRODUCTS = [
  {
    id: "GA-BR-01",
    name: "Aurelia Crystal Vine Bracelet - Emerald Green",
    category: "Bracelets",
    price: 110,
    originalPrice: 199,
    badge: "Bestseller",
    badgeType: "bestseller",
    colorHex: "#1B5E20",
    colorName: "Emerald Green",
    image: "assets/images/bracelet-emerald.jpeg",
    inStock: true,
    isVariantSeries: true,
    variantSeriesId: "aurelia-vine",
    description: "An ethereal vine of emerald green faceted crystals woven into a dainty 18k gold-finish adjustable chain. Inspires calm, prosperity, and royal elegance. Anti-tarnish & skin-friendly.",
    details: [
      "18K Gold Plated over hypoallergenic alloy",
      "Adjustable sliding clasp fits wrist sizes 5.5\" to 8\"",
      "Deep royal emerald cut glass crystals",
      "Free Signature GiftAura satin pouch & note card"
    ]
  },
  {
    id: "GA-BR-02",
    name: "Aurelia Crystal Vine Bracelet - Rose Quartz Pink",
    category: "Bracelets",
    price: 110,
    originalPrice: 199,
    badge: "Trending",
    badgeType: "trending",
    colorHex: "#F48FB1",
    colorName: "Rose Quartz Pink",
    image: "assets/images/bracelet-pink.jpeg",
    inStock: true,
    isVariantSeries: true,
    variantSeriesId: "aurelia-vine",
    description: "Soft blush pink crystals that glisten gently in the sunlight. Designed to evoke romantic poetry and soft-girl aesthetics. Looks breathtaking when stacked or worn solo.",
    details: [
      "Dainty blush pink faceted crystal beads",
      "Anti-tarnish protective lacquer coating",
      "Adjustable fit with delicate dangling droplet",
      "Gift-ready keepsake packaging"
    ]
  },
  {
    id: "GA-BR-03",
    name: "Aurelia Crystal Vine Bracelet - Amethyst Lavender",
    category: "Bracelets",
    price: 110,
    originalPrice: 199,
    badge: "New",
    badgeType: "new",
    colorHex: "#CE93D8",
    colorName: "Amethyst Lavender",
    image: "assets/images/bracelet-lavender.jpeg",
    inStock: true,
    isVariantSeries: true,
    variantSeriesId: "aurelia-vine",
    description: "A dreamy lilac lavender hue reminiscent of blooming lavender fields at dusk. Adds a quiet, sophisticated aura to college fits, brunch dates, and ethnic wear.",
    details: [
      "Gleaming pastel lavender crystal blossoms",
      "Micro-plated golden accents with lasting luster",
      "Lightweight, featherlight wrist feel (under 12g)",
      "Includes personalized handwritten note"
    ]
  },
  {
    id: "GA-BR-04",
    name: "Aurelia Crystal Vine Bracelet - Crimson Ruby",
    category: "Bracelets",
    price: 110,
    originalPrice: 199,
    badge: "Festive Pick",
    badgeType: "festive",
    colorHex: "#B71C1C",
    colorName: "Crimson Ruby",
    image: "assets/images/bracelet-ruby.jpeg",
    inStock: true,
    isVariantSeries: true,
    variantSeriesId: "aurelia-vine",
    description: "Bold, passionate crimson ruby droplets set against shimmering gold. The quintessential festive accessory for Diwali celebrations, weddings, and memorable date nights.",
    details: [
      "Vibrant ruby-red multifaceted crystal vine",
      "Rich warm gold tones that complement Indian skin tones",
      "Secure lobster closure with 2-inch extender chain",
      "Handcrafted in small batches in Kalyan"
    ]
  },
  {
    id: "GA-BR-05",
    name: "Aurelia Crystal Vine Bracelet - Diamond Clear",
    category: "Bracelets",
    price: 110,
    originalPrice: 199,
    badge: "Classic",
    badgeType: "classic",
    colorHex: "#E0E0E0",
    colorName: "Diamond Clear",
    image: "assets/images/bracelet-clear.jpeg",
    inStock: true,
    isVariantSeries: true,
    variantSeriesId: "aurelia-vine",
    description: "Crystal-clear prismatic crystals capturing every angle of light like morning dew drops. The ultimate timeless essential that effortlessly pairs with every outfit in your wardrobe.",
    details: [
      "Ultra-clear diamond-simulated glass crystals",
      "18K gold-tone polished link structure",
      "Hypoallergenic, nickel-free & lead-free",
      "Ready to gift inside signature packaging"
    ]
  },
  {
    id: "GA-BR-06",
    name: "Aurelia Crystal Vine Bracelet - Midnight Onyx",
    category: "Bracelets",
    price: 110,
    originalPrice: 199,
    badge: "Statement",
    badgeType: "statement",
    colorHex: "#212121",
    colorName: "Midnight Onyx",
    image: "assets/images/bracelet-black.jpeg",
    inStock: true,
    isVariantSeries: true,
    variantSeriesId: "aurelia-vine",
    description: "Jet-black crystal teardrops crafted for the modern muse who loves chic, edgy, monochromatic glamour. Pairs wonderfully with black dresses, power blazers, and evening wear.",
    details: [
      "Midnight black faceted crystal drops",
      "Luxurious gold-dipped chain frame",
      "Sturdy daily-wear construction",
      "Complimentary gift wrap with wax seal touch"
    ]
  },
  {
    id: "GA-NK-01",
    name: "Coquette Gold Bow Snake-Chain Necklace",
    category: "Necklaces",
    price: 249,
    originalPrice: 399,
    badge: "Most Loved",
    badgeType: "loved",
    image: "assets/images/necklace-bow.jpeg",
    inStock: true,
    description: "A viral coquette aesthetic masterpiece! Featuring a sculptural 3D polished gold bow suspended from a silky, liquid-finish herringbone snake chain. Sits gracefully on the collarbone.",
    details: [
      "Liquid-gold herringbone snake chain (16\" + 2\" extender)",
      "Sculpted dainty bow charm with mirror finish",
      "Anti-tarnish PVD coating - water resistant",
      "Perfect anniversary, birthday or friendship gift"
    ]
  },
  {
    id: "GA-NK-02",
    name: "Vintage Rose Embossed Gold Oval Pendant",
    category: "Necklaces",
    price: 249,
    originalPrice: 399,
    badge: "Gift Ready",
    badgeType: "gift",
    image: "assets/images/necklace-rose.jpeg",
    inStock: true,
    description: "An heirloom-inspired vintage medallion pendant featuring an intricately embossed blooming rose surrounded by a beaded milgrain halo. Comes on a shimmering box chain.",
    details: [
      "Embossed botanical rose cameo design",
      "Delicate 18-inch gold box chain with secure clasp",
      "Tarnish-resistant warm antique golden sheen",
      "Includes a handwritten wax-sealed love card"
    ]
  }
];

// Helper to get active products from storage or defaults
function getGiftAuraProducts() {
  if (window.StorageService) {
    return window.StorageService.getProducts();
  }
  return INITIAL_PRODUCTS;
}

window.INITIAL_PRODUCTS = INITIAL_PRODUCTS;
window.getGiftAuraProducts = getGiftAuraProducts;
