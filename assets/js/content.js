/* ==========================================================================
   WARRIOR OF GOD TACTICAL — Central Content Store
   All text, links, and data live here. Mirrors a WP ACF/CPT data layer.
   ========================================================================== */

const SITE_CONTENT = {

  site: {
    name: "Warrior of God Tactical",
    shortName: "WOG Tactical",
    tagline: "Equipped for Every Battle",
    subTagline: "Premium tactical gear, firearms, optics & hunting supplies — for those who stand ready.",
    phone: "(555) 867-5309",
    email: "info@warriorofgodtactical.com",
    address: "123 Freedom Way, Liberty, TX 77575",
    hours: "Mon–Fri: 9AM–6PM | Sat: 9AM–4PM",
    logoSrc: "assets/images/logo.png",   // ← replace with actual logo file
    logoAlt: "Warrior of God Tactical Logo",
    cartLink: "/shop/cart",
    ageGate: {
      heading: "Age Verification Required",
      body: "You must be 18 years of age or older to enter this site. This site contains products and content related to firearms and tactical equipment regulated by federal and state law.",
      confirmBtn: "I Am 18 or Older — Enter",
      denyBtn: "I Am Under 18 — Exit",
      redirectUrl: "https://google.com",
      cookieName: "wog_age_verified",
      cookieDays: 7,
    },
  },

  nav: {
    links: [
      { label: "Home",     href: "#hero" },
      { label: "Shop",     href: "#shop",     hasDropdown: true },
      { label: "Deals",    href: "#deals" },
      { label: "About Us", href: "#about" },
      { label: "Contact",  href: "#contact" },
    ],
    shopDropdown: [
      { label: "Handguns",          href: "#",  icon: "🔫" },
      { label: "Rifles",            href: "#",  icon: "🎯" },
      { label: "Shotguns",          href: "#",  icon: "🎯" },
      { label: "Ammunition",        href: "#",  icon: "⚡" },
      { label: "Optics",            href: "#",  icon: "🔭" },
      { label: "Reloading Supplies",href: "#",  icon: "🔧" },
      { label: "Hunting & Camping", href: "#",  icon: "🏕️" },
      { label: "Clothing & Apparel",href: "#",  icon: "👕" },
    ],
  },

  hero: {
    eyebrow: "Faith • Freedom • Firepower",
    heading: "Equipped for Every Battle",
    subheading: "Premium tactical firearms, optics, ammunition, and hunting gear. Serving patriots, hunters, and defenders of freedom.",
    cta1: { label: "Shop Now",    href: "#shop"  },
    cta2: { label: "View Deals",  href: "#deals" },
    backgroundImage: "assets/images/hero-bg.webp",
    scrollLabel: "Explore Our Arsenal",
  },


  deals: {
    heading: "This Week's Deals",
    subheading: "Limited-time savings on top brands. Check back weekly.",
    banner: {
      label: "DEAL OF THE WEEK",
      heading: "Up to 30% Off Select Optics",
      body: "Clearance on Bushnell, Vortex, and Pulsar optics. While supplies last.",
      cta: { label: "Shop Optics Deals", href: "#" },
      image: "https://placehold.co/900x400/091525/0ea5e9?text=Optics+Deals&font=oswald",
    },
  },

  about: {
    eyebrow: "Our Mission",
    heading: "Built on Faith. Built for Freedom.",
    paragraphs: [
      "Warrior of God Tactical was founded on the belief that the right to keep and bear arms is both a constitutional right and a God-given responsibility. We serve law-abiding citizens, hunters, competitive shooters, and those who choose to protect their families and communities.",
      "We carry only the products we believe in — sourced from trusted manufacturers, priced fairly, and backed by people who actually use them. Every member of our team is a shooter, hunter, or tactical enthusiast.",
      "Whether you're building your first defensive setup or upgrading your competition rig, we're here to help you get it right.",
    ],
    values: [
      { icon: "✝️", title: "Faith",     body: "Rooted in Christian values of service, integrity, and responsibility." },
      { icon: "🇺🇸", title: "Freedom",  body: "Committed to defending constitutional rights for every law-abiding citizen." },
      { icon: "🎯", title: "Quality",   body: "We carry only gear we stand behind — tested, vetted, and trusted." },
      { icon: "🛡️", title: "Community", body: "Serving hunters, competitors, and defenders across the country." },
    ],
    image: "https://placehold.co/700x500/0a1628/0ea5e9?text=Our+Team&font=oswald",
  },

  trust: {
    badges: [
      { icon: "🔒", label: "Secure Checkout",       sub: "SSL encrypted & PCI compliant" },
      { icon: "📦", label: "Fast Shipping",          sub: "FFL transfer & direct ship available" },
      { icon: "✅", label: "FFL Licensed",           sub: "Fully licensed federal firearms dealer" },
      { icon: "📞", label: "Expert Support",         sub: "Talk to a real shooter, not a bot" },
    ],
  },

  newsletter: {
    heading: "Join the WOG Community",
    subheading: "Get exclusive deals, new arrivals, and tactical tips delivered to your inbox.",
    placeholder: "Enter your email address",
    cta: "Subscribe",
    disclaimer: "No spam. Unsubscribe anytime. We hate spam too.",
  },

  footer: {
    tagline: "Equipped for Every Battle.",
    columns: [
      {
        heading: "Quick Links",
        links: [
          { label: "Home",        href: "#hero" },
          { label: "Shop",        href: "#shop" },
          { label: "Deals",       href: "#deals" },
          { label: "About Us",    href: "#about" },
          { label: "Contact",     href: "#contact" },
        ],
      },
      {
        heading: "Categories",
        links: [
          { label: "Handguns",          href: "#" },
          { label: "Rifles",            href: "#" },
          { label: "Shotguns",          href: "#" },
          { label: "Ammunition",        href: "#" },
          { label: "Optics",            href: "#" },
          { label: "Hunting & Camping", href: "#" },
        ],
      },
      {
        heading: "Support",
        links: [
          { label: "FAQ",               href: "#" },
          { label: "Shipping Policy",   href: "#" },
          { label: "Returns",           href: "#" },
          { label: "FFL Transfer Info", href: "#" },
          { label: "Privacy Policy",    href: "#" },
          { label: "Terms of Service",  href: "#" },
        ],
      },
    ],
    social: [
      { platform: "Facebook",  href: "#", icon: "fb" },
      { platform: "Instagram", href: "#", icon: "ig" },
      { platform: "YouTube",   href: "#", icon: "yt" },
      { platform: "X",         href: "#", icon: "x"  },
    ],
    legal: [
      "All firearms sales comply with federal and state law.",
      "FFL transfers required for shipped firearms.",
      "Must be 18+ for long guns, 21+ for handguns.",
    ],
    copyright: `© ${new Date().getFullYear()} Warrior of God Tactical. All rights reserved.`,
  },

};

// Freeze to prevent accidental mutation
Object.freeze(SITE_CONTENT);
