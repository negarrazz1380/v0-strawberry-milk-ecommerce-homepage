"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, User, ChevronDown, X, Menu } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { createClient } from "@/lib/supabase/client"

type NavLink = {
  label: string
  href: string
  dropdown?: Array<{ label: string; href: string; vibeSubmenu?: Array<{ label: string; href: string }> }> | "devices"
  category?: string
}

const staticNavLinks: NavLink[] = [
  {
    label: "iPhone Cases",
    href: "/iphone",
    dropdown: [
      { label: "iPhone 17 Pro Max", href: "/iphone/iphone_17_pro_max" },
      { label: "iPhone 17 Pro", href: "/iphone/iphone_17_pro" },
      { label: "iPhone 17", href: "/iphone/iphone_17" },
      { label: "iPhone 16 Pro Max", href: "/iphone/iphone_16_pro_max" },
      { label: "iPhone 16 Pro", href: "/iphone/iphone_16_pro" },
      { label: "iPhone 16", href: "/iphone/iphone_16" },
      { label: "iPhone 15 Pro Max", href: "/iphone/iphone_15_pro_max" },
      { label: "iPhone 15 Pro", href: "/iphone/iphone_15_pro" },
      { label: "iPhone 15", href: "/iphone/iphone_15" },
      { label: "iPhone 14 series", href: "/iphone/iphone_14" },
      { label: "iPhone 13 series", href: "/iphone/iphone_13" },
      { label: "iPhone 12 series", href: "/iphone/iphone_12" },
    ],
  },
  {
    label: "Shop by Category",
    href: "/shop",
    dropdown: [
      { label: "Best Sellers", href: "/shop/best-sellers" },
      { label: "Last Chance", href: "/shop/last-chance" },
      { 
        label: "Shop by Vibe", 
        href: "/", 
        vibeSubmenu: [
          { label: "Pink Cases", href: "/category/pink" },
          { label: "Aesthetic Cases", href: "/category/aesthetic" },
          { label: "Minimal Cases", href: "/category/minimal" },
        ]
      },
      { label: "Shop All", href: "/shop-all" },
    ],
  },
  {
    label: "AirPods Cases",
    href: "/category/airpods",
    category: "airpods",
    dropdown: "devices",
  },
  { label: "Accessories", href: "/category/accessories" },
  { label: "Contact", href: "/contact" },
]

export function Header() {
  const { items, drawerOpen, setDrawerOpen } = useCart()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [vibeSubmenuOpen, setVibeSubmenuOpen] = useState(false)
  const [devicesByCategory, setDevicesByCategory] = useState<{ [key: string]: Array<{ label: string; href: string }> }>({})
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch device models for iPhone and AirPods
  useEffect(() => {
    const fetchDevices = async () => {
      const supabase = createClient()
      
      // Fetch iPhone devices
      const { data: iPhoneProducts } = await supabase
        .from("products")
        .select("device_models")
        .eq("category", "iphone")
        .not("device_models", "is", null)
      
      // Fetch AirPods devices
      const { data: airPodsProducts } = await supabase
        .from("products")
        .select("device_models")
        .eq("category", "airpods")
        .not("device_models", "is", null)

      // Flatten arrays and get unique devices
      const iPhoneDevices = [...new Set(iPhoneProducts?.flatMap(p => p.device_models || []) || [])]
      const airPodsDevices = [...new Set(airPodsProducts?.flatMap(p => p.device_models || []) || [])]

      setDevicesByCategory({
        iphone: iPhoneDevices.map(device => ({
          label: device?.replace(/_/g, " ").toUpperCase() || "Unknown",
          href: `/category/iphone?device=${device}`
        })),
        airpods: airPodsDevices.map(device => ({
          label: device?.replace(/_/g, " ").toUpperCase() || "Unknown",
          href: `/category/airpods?device=${device}`
        }))
      })
    }

    fetchDevices()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  return (
    <>
      <header className="w-full bg-transparent">
        {/* Top Row: Logo centered with icons on the right */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-0 gap-4">
          {/* Left spacer */}
          <div className="w-16 shrink-0" aria-hidden="true" />

          {/* Centered Logo Text */}
          <div className="flex-1 flex justify-center overflow-visible">
            <Link href="/" aria-label="CaseKisses home" className="flex flex-col items-center gap-0">
              <span
                className="text-8xl sm:text-9xl font-bold select-none"
                style={{
                  background: "linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fbcfe8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontFamily: "var(--font-dancing), cursive",
                  letterSpacing: "0.02em",
                  lineHeight: "1.4",
                  padding: "0.2em 0.3em",
                  display: "inline-block",
                  fontWeight: "700",
                }}
              >
                CaseKisses
              </span>
              <span
                className="text-xs sm:text-sm font-bold tracking-widest uppercase"
                style={{
                  color: "#ec4899",
                  fontFamily: "'Fredoka', 'Quicksand', sans-serif",
                  letterSpacing: "0.1em",
                  marginTop: "-1.5rem",
                }}
              >
                cute cases. cute prices.
              </span>
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3 justify-end w-16 shrink-0">
            <Link
              href="/account"
              aria-label="Account"
              className="p-2 rounded-full text-foreground/70 hover:text-primary hover:bg-accent transition-colors"
            >
              <User size={20} />
            </Link>
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label="Open cart"
              className="relative p-2 rounded-full text-foreground/70 hover:text-primary hover:bg-accent transition-colors"
            >
              <ShoppingBag size={20} />
              {items.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-full text-foreground/70 hover:text-primary hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Bottom Row: Navigation centered */}
        <nav ref={dropdownRef} className="hidden md:flex justify-center items-center gap-1 pb-3 px-4">
          {staticNavLinks.map((link) =>
            link.dropdown ? (
              <div key={link.label} className="relative">
                <button
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary rounded-xl transition-colors"
                  onMouseEnter={() => setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                  onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                  aria-expanded={openDropdown === link.label}
                >
                  {link.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${openDropdown === link.label ? "rotate-180" : ""}`}
                  />
                </button>
                {openDropdown === link.label && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1 min-w-[200px] bg-card rounded-2xl shadow-lg py-2 z-50"
                    onMouseEnter={() => setOpenDropdown(link.label)}
                    onMouseLeave={() => {
                      setOpenDropdown(null)
                      setVibeSubmenuOpen(false)
                    }}
                  >
                    {link.dropdown === "devices" && link.category ? (
                      // Dynamic device dropdown
                      devicesByCategory[link.category]?.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-accent rounded-xl mx-1 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))
                    ) : (
                      // Static dropdown (Shop by Category)
                      (link.dropdown as any[]).map((item) => 
                        item.vibeSubmenu ? (
                          // Shop by Vibe with submenu
                          <div
                            key={item.label}
                            className="relative"
                            onMouseEnter={() => setVibeSubmenuOpen(true)}
                            onMouseLeave={() => setVibeSubmenuOpen(false)}
                          >
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-accent rounded-xl mx-1 transition-colors flex items-center justify-between"
                            >
                              {item.label}
                              <ChevronDown size={12} className={`transition-transform ${vibeSubmenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {vibeSubmenuOpen && (
                              <div className="absolute left-full top-0 ml-1 min-w-[180px] bg-card rounded-2xl shadow-lg py-2 z-50">
                                {item.vibeSubmenu.map((vibe: any) => (
                                  <Link
                                    key={vibe.label}
                                    href={vibe.href}
                                    className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-accent rounded-xl mx-1 transition-colors"
                                  >
                                    {vibe.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Regular dropdown items
                          <Link
                            key={item.label}
                            href={item.href}
                            className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-accent rounded-xl mx-1 transition-colors"
                          >
                            {item.label}
                          </Link>
                        )
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary rounded-xl transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-transparent px-4 py-3 flex flex-col gap-1 border-t border-foreground/10">
            {staticNavLinks.map((link) => (
              <div key={link.label}>
                <Link
                  href={link.href}
                  className="block py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
                {link.dropdown && (
                  <div className="pl-4 flex flex-col gap-1 mb-1">
                    {link.dropdown === "devices" && link.category ? (
                      // Dynamic device dropdown for mobile
                      devicesByCategory[link.category]?.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="py-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))
                    ) : (
                      // Static dropdown for mobile
                      (link.dropdown as any[]).map((item) =>
                        item.vibeSubmenu ? (
                          <div key={item.label} className="py-1">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">{item.label}</p>
                            {item.vibeSubmenu.map((vibe: any) => (
                              <Link
                                key={vibe.label}
                                href={vibe.href}
                                className="block py-1 text-xs text-muted-foreground hover:text-primary transition-colors pl-2"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {vibe.label}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="py-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        )
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}
      </header>
    </>
  )
}
