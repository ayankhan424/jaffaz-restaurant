// Keep real restaurant contact and service settings in one place.
export const restaurant = {
  name: "Jaffaz Restaurant",
  menuBrand: "Jaffa’z Food Lounge",
  shortName: "Jaffa’z",
  tagline: "Where Hungry Happens",
  whatsappNumber: "923011060005", // International format, digits only
  phoneNumber: "067-3366305",
  phoneDialNumber: "+9267336305",
  email: "glitchstark4@gmail.com",
  openingHours: "10:00 AM – 4:00 AM",
  address: "195/6, Faisal Town, People’s Colony Road, Opposite Kachi Mandi Ground, Vehari",
  googleMapsUrl: "", // Add a direct place link when one is available
  socialLinks: { instagram: "https://www.instagram.com/JaffazFoodLounge" },
  serviceRadiusKm: 5,
  deliveryFee: 50,
  freeDeliveryMinimum: 500,
  currency: "Rs.",
  socialHandle: "@JaffazFoodLounge",
};

export const formatPrice = (amount) => `${restaurant.currency} ${Number(amount).toLocaleString("en-PK")}`;

export const whatsappLink = (message) =>
  `https://wa.me/${restaurant.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const restaurantMapLink = () => restaurant.googleMapsUrl ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`;
