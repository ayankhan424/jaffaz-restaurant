import { formatPrice, restaurant } from "../config/restaurant.js";

export function buildWhatsAppOrderMessage({ cart, customer, orderType, deliveryZone, subtotal, deliveryFee }) {
  const items = cart.map((line) => {
    const note = line.instructions ? `\n  Special instructions: ${line.instructions}` : "";
    const variant = line.variant ? ` (${line.variant})` : "";
    return `• ${line.name}${variant} × ${line.quantity} — ${formatPrice(line.price * line.quantity)}${note}`;
  }).join("\n");
  const delivery = deliveryFee == null ? "To confirm with restaurant" : formatPrice(deliveryFee);
  const total = deliveryFee == null ? `${formatPrice(subtotal)} + delivery fee to confirm` : formatPrice(subtotal + deliveryFee);
  const deliveryDetails = orderType === "Delivery"
    ? `\nDelivery Address: ${customer.address}\nDelivery Area: ${deliveryZone === "within" ? "Within 5 km" : "Beyond 5 km — please confirm delivery availability and fee"}`
    : "";
  return `${restaurant.name} Order\n\nCustomer Name: ${customer.name}\nPhone: ${customer.phone}\nOrder Type: ${orderType}${deliveryDetails}\n\nItems:\n${items}\n\nSubtotal: ${formatPrice(subtotal)}\nDelivery Fee: ${delivery}\nDiscount: ${formatPrice(0)}\nTotal: ${total}\n\nPlease confirm my order.`;
}
