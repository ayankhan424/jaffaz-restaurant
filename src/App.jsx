import { useEffect, useMemo, useState } from "react";
import { categories, menuItems } from "./data/menu.js";
import { buildWhatsAppOrderMessage } from "./data/orderMessage.js";
import { formatPrice, restaurant, restaurantMapLink, whatsappLink } from "./config/restaurant.js";

const icons = {
  basket: <><path d="M5 8h14l-1.2 12H6.2L5 8Z"/><path d="m8 8 4-5 4 5M9 12v4M15 12v4"/></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
  arrow: <><path d="M4 12h15M13 5l7 7-7 7"/></>,
  pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
};
function Icon({ name, size = 20 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>; }
const readCart = () => { try { return JSON.parse(localStorage.getItem("jaffaz-cart") || "[]"); } catch { return []; } };
const priceText = (price) => price == null ? "Ask for price" : formatPrice(price);

function App() {
  const [cart, setCart] = useState(readCart);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState(null);
  const [basketOpen, setBasketOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [orderType, setOrderType] = useState("Delivery");
  const [deliveryZone, setDeliveryZone] = useState("within");
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [orderError, setOrderError] = useState("");

  useEffect(() => localStorage.setItem("jaffaz-cart", JSON.stringify(cart)), [cart]);
  useEffect(() => {
    const script = document.createElement("script");
    script.id = "restaurant-structured-data";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: restaurant.name,
      telephone: restaurant.phoneNumber,
      address: { "@type": "PostalAddress", streetAddress: restaurant.address, addressLocality: "Vehari", addressCountry: "PK" },
      sameAs: Object.values(restaurant.socialLinks),
      hasMenu: `${window.location.origin}/#menu`,
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, []);
  useEffect(() => { document.body.classList.toggle("no-scroll", Boolean(selected || basketOpen)); return () => document.body.classList.remove("no-scroll"); }, [selected, basketOpen]);

  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const deliveryFee = orderType !== "Delivery" || subtotal === 0 ? 0 : deliveryZone === "beyond" ? null : subtotal < restaurant.freeDeliveryMinimum ? restaurant.deliveryFee : 0;
  const total = subtotal + (deliveryFee ?? 0);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const visibleItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = menuItems.filter((item) => {
      const matchesCategory = filter === "All" || item.category === filter;
      return matchesCategory && (!term || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(term));
    });
    if (sort === "price-low") list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === "price-high") list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    return list;
  }, [filter, query, sort]);

  const addToCart = (item, choice, quantity, instructions = "") => {
    const lineId = `${item.id}${choice?.size ? `-${choice.size}` : ""}`;
    const price = choice?.price ?? item.price;
    if (price == null) return;
    setCart((prev) => {
      const found = prev.find((line) => line.lineId === lineId && line.instructions === instructions);
      if (found) return prev.map((line) => line === found ? { ...line, quantity: line.quantity + quantity } : line);
      return [...prev, { cartKey: `${lineId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, lineId, itemId: item.id, name: item.name, variant: choice?.size || "", price, quantity, instructions, image: item.image }];
    });
    setSelected(null);
  };
  const changeQuantity = (cartKey, amount) => setCart((prev) => prev.map((line) => line.cartKey === cartKey ? { ...line, quantity: line.quantity + amount } : line).filter((line) => line.quantity > 0));
  const removeLine = (cartKey) => setCart((prev) => prev.filter((line) => line.cartKey !== cartKey));
  const updateNote = (cartKey, instructions) => setCart((prev) => prev.map((line) => line.cartKey === cartKey ? { ...line, instructions } : line));

  const placeOrder = () => {
    if (!customer.name.trim() || !customer.phone.trim() || (orderType === "Delivery" && !customer.address.trim())) {
      setOrderError("Please fill in your name, phone number and required address."); return;
    }
    setOrderError("");
    const message = buildWhatsAppOrderMessage({ cart, customer, orderType, deliveryZone, subtotal, deliveryFee });
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  };
  const openCart = (forCheckout = false) => { setBasketOpen(true); if (forCheckout) setCheckout(true); };

  return <>
    <div className="topline"><span>Good food, good company</span><span>Vehari, Pakistan <i>•</i> Free delivery within 5 km on orders of Rs. 500+</span></div>
    <header className="header">
      <a className="brand" href="#home" aria-label="Jaffaz Restaurant home"><span className="brand-mark">J<span>’</span></span><span className="brand-name">JAFFA’Z<small>FOOD LOUNGE</small></span></a>
      <button className="mobile-menu" aria-label={mobileNav ? "Close navigation" : "Open navigation"} onClick={() => setMobileNav(!mobileNav)}><span/><span/></button>
      <nav className={mobileNav ? "nav nav-open" : "nav"} aria-label="Main navigation">
        {[['Home','#home'],['Menu','#menu'],['About','#about'],['Contact','#contact']].map(([label, href]) => <a key={href} href={href} onClick={() => setMobileNav(false)}>{label}</a>)}
        <a href={whatsappLink(`Hello ${restaurant.name}, I would like to know more about your menu.`)} target="_blank" rel="noreferrer" onClick={() => setMobileNav(false)}>WhatsApp</a>
      </nav>
      <div className="header-actions"><button className="cart-trigger" aria-label={`Open cart, ${cartCount} items`} onClick={() => openCart()}><Icon name="basket"/><span className="cart-count">{cartCount}</span></button><a className="button button-dark header-order" href="#menu">Order Now <Icon name="arrow" size={17}/></a></div>
    </header>

    <main>
      <section className="hero" id="home">
        <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/> MADE FOR YOUR MOMENTS</div><h1>Good food.<br/><em>Made to share.</em></h1><p>From pizza to the burger you’ve been thinking about, find your next favourite at Jaffaz Restaurant.</p><div className="hero-buttons"><a className="button button-yellow" href="#menu">Explore the menu <Icon name="arrow" size={18}/></a><a className="text-link" href={whatsappLink(`Hello ${restaurant.name}, I would like to know more about your menu.`)} target="_blank" rel="noreferrer">Chat on WhatsApp <Icon name="arrow" size={16}/></a></div><div className="hero-meta"><span><b>01</b> Made for sharing</span><span><b>02</b> Easy WhatsApp ordering</span></div></div>
        <div className="hero-visual"><img src="/images/hero.webp" alt="Pizza pictured on the restaurant’s menu cover" fetchPriority="high" loading="eager" decoding="async"/><div className="hero-stamp"><span>JAFFA’Z</span><small>GOOD FOOD<br/>GOOD MOOD</small></div><div className="hero-caption"><span className="caption-dot"/> A table worth gathering around</div></div>
      </section>

      <section className="feature-strip" aria-label="Ordering information"><div><span className="feature-number">01</span><strong>A menu for sharing</strong><small>Pizza, burgers and more</small></div><div><span className="feature-number">02</span><strong>Delivery or pickup</strong><small>Choose what suits you</small></div><div><span className="feature-number">03</span><strong>Order on WhatsApp</strong><small>Simple, direct ordering</small></div><div><span className="feature-number">04</span><strong>Family dining</strong><small>Gather around good food</small></div></section>

      <section className="menu-section section-wrap" id="menu"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> SOMETHING FOR EVERY CRAVING</div><h2>Find your <em>favourite.</em></h2></div><p>Browse the menu and add something delicious to your order.</p></div>
        <div className="menu-tools"><div className="search-box"><Icon name="search"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the menu" aria-label="Search the menu"/><kbd>⌕</kbd></div><div className="sort-wrap"><label htmlFor="menu-sort">Sort</label><select id="menu-sort" value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div></div>
        <div className="category-row" role="group" aria-label="Filter menu by category">{categories.map((cat) => <button key={cat} className={filter === cat ? "category-chip active" : "category-chip"} onClick={() => setFilter(cat)}>{cat}</button>)}</div>
        <div className="menu-help"><span>Need help with your order?</span><a href={whatsappLink(`Hello ${restaurant.name}, I have a question about the menu.`)} target="_blank" rel="noreferrer">Ask us on WhatsApp <Icon name="arrow" size={15}/></a></div>
        <p className="photo-note">Menu photos are illustrative stock images. Jaffaz’s actual ingredients and presentation may differ.</p>
        {filter === "Pizza Deals" && <p className="menu-note">Pizza deal exclusions: Lazania, Behari Kebab, Split (Special), Bonfire and Jaffa’z Special.</p>}
        <div className="menu-results"><span>{visibleItems.length} items</span><span>{filter === "All" ? "The full menu" : filter}</span></div>
        {visibleItems.length ? <div className="menu-grid">{visibleItems.map((item) => <article className="food-card" key={item.id}><button className="food-image-button" aria-label={`View ${item.name} details`} onClick={() => setSelected(item)}><img src={item.image} alt="" loading="lazy" decoding="async"/><span className="food-category">{item.category}</span></button><div className="food-info"><h3>{item.name}</h3><p>{item.description}</p><div className="food-bottom"><strong>{item.sizes?.length ? `From ${formatPrice(item.price)}` : priceText(item.price)}</strong>{item.askPrice ? <a className="mini-add ask" href={whatsappLink(`Hello ${restaurant.name}, please tell me the price for Split Pizza.`)} target="_blank" rel="noreferrer" aria-label="Ask for Split Pizza price">Ask <Icon name="arrow" size={16}/></a> : <button className="mini-add" aria-label={`Choose ${item.name}`} onClick={() => setSelected(item)}><span>+</span><span className="sr-only">Choose</span></button>}</div></div></article>)}</div> : <div className="empty-results"><span>Nothing on this plate yet</span><p>Try another search or category.</p><button className="text-link" onClick={() => { setQuery(""); setFilter("All"); }}>Show the full menu <Icon name="arrow" size={16}/></button></div>}
      </section>

      <section className="about-section" id="about"><div className="about-image"><img src="/images/menu-cover.webp" alt="Jaffaz Restaurant menu cover" loading="lazy"/><div className="about-image-label"><span>JAFFA’Z FOOD LOUNGE</span><small>VEHARI</small></div></div><div className="about-copy"><div className="eyebrow"><span className="eyebrow-line"/> A PLACE TO COME TOGETHER</div><h2>Food tastes better<br/>when <em>shared.</em></h2><p>Jaffaz Restaurant brings people together around familiar favourites and something new to try. Explore our menu, find what you’re craving, and place your order the easy way.</p><p>Planning a birthday or get-together? The menu welcomes gatherings in the family dining hall.</p><a className="button button-dark" href="#contact">Find us in Vehari <Icon name="arrow" size={17}/></a><div className="about-note"><span>Good food, good mood.</span><span>— Jaffa’z Food Lounge</span></div></div></section>

      <section className="delivery-band"><div className="delivery-icon">✳</div><div><div className="eyebrow"><span className="eyebrow-line"/> MADE SIMPLE</div><h2>Your table, <em>your way.</em></h2><p>Order for delivery or pickup. Orders of Rs. 500 and above get free delivery within 5 km.</p></div><button className="button button-yellow" onClick={() => openCart(true)}>Start an order <Icon name="arrow" size={17}/></button><span className="band-ornament">J</span></section>

      <section className="contact-section section-wrap" id="contact"><div className="contact-copy"><div className="eyebrow"><span className="eyebrow-line"/> COME SAY HELLO</div><h2>We’re in <em>Vehari.</em></h2><p>Drop by, give us a call, or send a message to ask about your order.</p><div className="contact-actions"><a className="button button-dark" href={`tel:${restaurant.phoneDialNumber}`}>Call Now <Icon name="arrow" size={17}/></a><a className="button button-outline" href={whatsappLink(`Hello ${restaurant.name}, I have a question.`)} target="_blank" rel="noreferrer">Message on WhatsApp</a></div></div><div className="address-card"><div className="address-card-top"><span className="pin-icon"><Icon name="pin"/></span><span>VISIT US</span></div><h3>{restaurant.name}</h3><p>{restaurant.address}</p><div className="address-divider"/><a href={restaurantMapLink()} target="_blank" rel="noreferrer" className="address-link">Open this address in Maps <Icon name="arrow" size={17}/></a><small>{restaurant.googleMapsUrl ? "Open the restaurant’s location in Maps." : "Map search uses the printed address; a precise pin can be added later."}</small></div></section>
    </main>

    <footer className="footer"><div className="footer-main"><a className="brand footer-brand" href="#home"><span className="brand-mark">J<span>’</span></span><span className="brand-name">JAFFA’Z<small>FOOD LOUNGE</small></span></a><p>Where Hungry Happens.<br/>Made for good food and good company.</p><a className="footer-social" href={restaurant.socialLinks.instagram} target="_blank" rel="noreferrer">Instagram {restaurant.socialHandle} <Icon name="arrow" size={15}/></a></div><div className="footer-column"><b>Explore</b><a href="#home">Home</a><a href="#menu">Menu</a><a href="#about">About</a><a href="#contact">Contact</a></div><div className="footer-column"><b>Get in touch</b><a href={`tel:${restaurant.phoneDialNumber}`}>{restaurant.phoneNumber}</a><a href={whatsappLink(`Hello ${restaurant.name}, I have a question.`)} target="_blank" rel="noreferrer">WhatsApp us</a><span>Vehari, Pakistan</span></div><div className="footer-end"><span>© {new Date().getFullYear()} Jaffaz Restaurant</span><span>Good food, good mood.</span></div></footer>
    <a className="floating-whatsapp" href={whatsappLink(`Hello ${restaurant.name}, I would like to know more about your menu.`)} target="_blank" rel="noreferrer" aria-label="Chat with Jaffa’z on WhatsApp"><span className="wa-mark">◉</span><span>Chat with us</span></a>

    {selected && <ProductDialog item={selected} onClose={() => setSelected(null)} onAdd={addToCart}/>}
    {basketOpen && <CartDrawer cart={cart} count={cartCount} subtotal={subtotal} deliveryFee={deliveryFee} total={total} orderType={orderType} setOrderType={setOrderType} deliveryZone={deliveryZone} setDeliveryZone={setDeliveryZone} customer={customer} setCustomer={setCustomer} checkout={checkout} setCheckout={setCheckout} error={orderError} onPlace={placeOrder} onClose={() => { setBasketOpen(false); setCheckout(false); }} onChangeQuantity={changeQuantity} onRemove={removeLine} onUpdateNote={updateNote} onBrowse={() => { setBasketOpen(false); setCheckout(false); document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth" }); }}/ >}
  </>;
}

function ProductDialog({ item, onClose, onAdd }) {
  const [sizeIndex, setSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");
  const selectedSize = item.sizes?.[sizeIndex];
  const price = selectedSize?.price ?? item.price;
  useEffect(() => { const close = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [onClose]);
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="product-title"><button className="icon-close" onClick={onClose} aria-label="Close item details"><Icon name="close"/></button><img className="dialog-image" src={item.image} alt={`Illustrative stock photo for ${item.name}`}/><div className="dialog-copy"><span className="dialog-category">{item.category}</span><h2 id="product-title">{item.name}</h2><p>{item.description}</p>{item.sizes?.length > 0 && <fieldset className="size-options"><legend>Choose size</legend><div>{item.sizes.map((size, index) => <button type="button" key={size.size} className={sizeIndex === index ? "size-choice chosen" : "size-choice"} onClick={() => setSizeIndex(index)}><span>{size.size}</span><b>{formatPrice(size.price)}</b></button>)}</div></fieldset>}<label className="instruction-label" htmlFor="item-note">Special instructions <small>optional</small></label><textarea id="item-note" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="For example: no onions, less spicy" maxLength={160}/><div className="dialog-bottom"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}>+</button></div><button className="button button-dark add-to-cart" onClick={() => onAdd(item, selectedSize, quantity, instructions)}><span>Add to order</span><b>{formatPrice(price * quantity)}</b></button></div></div></section></div>;
}

function CartDrawer({ cart, count, subtotal, deliveryFee, total, orderType, setOrderType, deliveryZone, setDeliveryZone, customer, setCustomer, checkout, setCheckout, error, onPlace, onClose, onChangeQuantity, onRemove, onUpdateNote, onBrowse }) {
  useEffect(() => { const close = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [onClose]);
  return <div className="drawer-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Your order"><div className="drawer-head"><div><span className="eyebrow"><span className="eyebrow-line"/> YOUR ORDER</span><h2>{checkout ? "Checkout" : `Your basket`} <small>{!checkout && `(${count})`}</small></h2></div><button className="icon-close" onClick={onClose} aria-label="Close cart"><Icon name="close"/></button></div>
    {!cart.length ? <div className="cart-empty"><span className="empty-plate">✳</span><h3>Your basket is waiting.</h3><p>Find something you love from the menu.</p><button className="button button-dark" onClick={onBrowse}>Explore the menu <Icon name="arrow" size={17}/></button></div> : <>
      {!checkout ? <div className="cart-lines">{cart.map((line) => <div className="cart-line" key={line.cartKey}><img src={line.image} alt=""/><div className="cart-line-main"><div className="cart-line-title"><div><h3>{line.name}</h3>{line.variant && <small>{line.variant}</small>}</div><button className="remove-line" onClick={() => onRemove(line.cartKey)} aria-label={`Remove ${line.name}`}>Remove</button></div><strong>{formatPrice(line.price * line.quantity)}</strong><textarea aria-label={`Special instructions for ${line.name}`} placeholder="Add a note (optional)" value={line.instructions} maxLength={160} onChange={(e) => onUpdateNote(line.cartKey, e.target.value)}/><div className="quantity-control small-quantity"><button aria-label={`Decrease ${line.name} quantity`} onClick={() => onChangeQuantity(line.cartKey, -1)}>−</button><span>{line.quantity}</span><button aria-label={`Increase ${line.name} quantity`} onClick={() => onChangeQuantity(line.cartKey, 1)}>+</button></div></div></div>)}</div> : <div className="checkout-form"><div className="order-type"><button className={orderType === "Delivery" ? "selected" : ""} onClick={() => setOrderType("Delivery")}>Delivery</button><button className={orderType === "Pickup" ? "selected" : ""} onClick={() => setOrderType("Pickup")}>Pickup</button></div><label>Full name<input autoComplete="name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Your name"/></label><label>Phone number<input autoComplete="tel" type="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="03xx-xxxxxxx"/></label>{orderType === "Delivery" ? <><label>Delivery address<textarea autoComplete="street-address" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} placeholder="House, street, area in Vehari"/></label><fieldset className="delivery-zone"><legend>Delivery area</legend><button type="button" className={deliveryZone === "within" ? "active" : ""} onClick={() => setDeliveryZone("within")}>Within 5 km</button><button type="button" className={deliveryZone === "beyond" ? "active" : ""} onClick={() => setDeliveryZone("beyond")}>Beyond 5 km</button></fieldset><div className="delivery-rule">{deliveryZone === "within" ? "Within 5 km: free delivery on orders of Rs. 500 or more. Orders below Rs. 500 have a Rs. 50 delivery fee." : "Beyond 5 km: add your order and ask the restaurant to confirm delivery availability and fee on WhatsApp."}</div></> : <div className="delivery-rule">Pickup selected. Please contact the restaurant if you need pickup details.</div>}<div className="review-heading">Order review</div>{cart.map((line) => <div className="review-line" key={line.cartKey}><span>{line.name}{line.variant ? ` (${line.variant})` : ""} × {line.quantity}</span><b>{formatPrice(line.price * line.quantity)}</b>{line.instructions && <small>Note: {line.instructions}</small>}</div>)}</div>}
      <div className="drawer-summary"><div><span>Subtotal</span><b>{formatPrice(subtotal)}</b></div><div><span>Delivery fee</span><b>{deliveryFee == null ? "Confirm with restaurant" : formatPrice(deliveryFee)}</b></div>{orderType === "Delivery" && <small>{deliveryZone === "beyond" ? "Beyond 5 km: fee and availability need confirmation" : subtotal >= restaurant.freeDeliveryMinimum ? "Free delivery applied within 5 km" : `Add ${formatPrice(restaurant.freeDeliveryMinimum - subtotal)} to get free delivery within 5 km`}</small>}<div className="summary-total"><span>Total</span><b>{deliveryFee == null ? `${formatPrice(subtotal)} + delivery` : formatPrice(total)}</b></div>{error && <p className="form-error" role="alert">{error}</p>}{checkout ? <><button className="button button-whatsapp checkout-submit" onClick={onPlace}>Order on WhatsApp <span>↗</span></button><button className="back-to-cart" onClick={() => setCheckout(false)}>← Back to your basket</button></> : <button className="button button-dark checkout-submit" onClick={() => setCheckout(true)}>Continue to checkout <Icon name="arrow" size={17}/></button>}</div>
    </>}
  </aside></div>;
}

export default App;
