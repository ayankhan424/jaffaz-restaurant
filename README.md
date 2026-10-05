# Jaffa’z Food Lounge website

A customer-facing React website for the Jaffa’z Food Lounge menu in Vehari. Orders are assembled in the browser and opened in WhatsApp for the customer to review and send. This first version has no database or POS connection.

## Run the website

1. Install Node.js 20.19 or newer on your computer if it is not already installed.
2. Open a terminal in this folder.
3. Run `npm install` once.
4. Run `npm run dev`.
5. Open the local address Vite prints in your browser.

To make a deployable copy, run `npm run build`. Upload the contents of the generated `dist` folder to a static website host. The site does not need a backend to display its menu or prepare a WhatsApp order.

## Update restaurant settings

Edit `src/config/restaurant.js`. It contains the WhatsApp number, call number, address, map link, opening hours, social link, delivery radius, delivery fee, and free-delivery minimum. The WhatsApp value must use the international country code and digits only. For example, Pakistan’s `0301-1060005` is stored as `923011060005`.

Opening hours and a precise map pin were not supplied, so hours are not shown as facts. The Maps button searches the printed address; add a direct place link in `googleMapsUrl` when one is available.

## Update the menu

Edit `src/data/menu.js`. Each item has an `id`, `name`, `category`, `description`, `price`, and `image`. Items with size choices have a `sizes` list, with each size and its price. Keep prices in whole Pakistani rupees. If an item has no confirmed price yet, use `askPrice: true` and `sizes: []`; the site will offer a WhatsApp price enquiry instead of adding a guessed price to the basket.

Each menu item uses its own optimized image at `public/images/dishes/<item-id>.webp`. Replace that file to change an item’s image. See `public/images/dishes/PHOTO-CREDITS.md` for the stock-image source searches and license note. These are illustrative photos, not verified Jaffaz servings; the site says so beside the menu.

## Ordering and future POS connection

The cart is stored in the customer’s browser. Checkout creates a formatted WhatsApp message containing the order, customer contact details, delivery or pickup choice, notes, and totals. The customer still reviews and sends the message in WhatsApp. A backend can later replace the WhatsApp handoff with a secure order API and connect that API to the existing POS; this website does not modify or connect to the POS.
