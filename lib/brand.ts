/**
 * Single source of truth for brand identity. Import from here rather than
 * hardcoding the name so a rename is a one-line change.
 */
export const BRAND = {
  name: "HathSeMade",
  tagline: "Handmade with love",
  description:
    "Handcrafted bouquets, resin art, keychains and personalized gifts. Made to order, made for you.",
  instagramHandle: "@hathsemade",
  instagramUrl: "https://instagram.com/hathsemade",
  // TODO(anchal): confirm the real inbox before launch.
  contactEmail: "hello@hathsemade.com",
} as const;
