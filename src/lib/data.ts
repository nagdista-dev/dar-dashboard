// Deterministic demo data: same seed → same orders on every device, so screenshots and
// the live demo always match. Nothing here is real customer data.

export type Status = "new" | "processing" | "shipped" | "delivered" | "returned" | "cancelled";
export type Bi = { ar: string; en: string };

export type Product = { id: string; name: Bi; price: number; category: Bi };
export type Order = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  customer: Bi;
  phone: string;
  city: Bi;
  items: { productId: string; qty: number }[];
  total: number;
  status: Status;
  payment: "cod" | "card";
};

export const STATUSES: Status[] = ["new", "processing", "shipped", "delivered", "returned", "cancelled"];

export const CITIES: Bi[] = [
  { ar: "القاهرة", en: "Cairo" },
  { ar: "الجيزة", en: "Giza" },
  { ar: "الإسكندرية", en: "Alexandria" },
  { ar: "المنصورة", en: "Mansoura" },
  { ar: "طنطا", en: "Tanta" },
  { ar: "أسيوط", en: "Assiut" },
];

export const PRODUCTS: Product[] = [
  { id: "P-101", name: { ar: "طقم أكواب فخار", en: "Clay mug set" }, price: 420, category: { ar: "مطبخ", en: "Kitchen" } },
  { id: "P-102", name: { ar: "مفرش كتان", en: "Linen tablecloth" }, price: 650, category: { ar: "مفروشات", en: "Textiles" } },
  { id: "P-103", name: { ar: "شمعة معطرة", en: "Scented candle" }, price: 180, category: { ar: "ديكور", en: "Decor" } },
  { id: "P-104", name: { ar: "سلة خوص", en: "Wicker basket" }, price: 310, category: { ar: "ديكور", en: "Decor" } },
  { id: "P-105", name: { ar: "طبق تقديم خشب", en: "Wooden serving board" }, price: 540, category: { ar: "مطبخ", en: "Kitchen" } },
  { id: "P-106", name: { ar: "خدادية مطرزة", en: "Embroidered cushion" }, price: 380, category: { ar: "مفروشات", en: "Textiles" } },
  { id: "P-107", name: { ar: "فازة زجاج", en: "Glass vase" }, price: 290, category: { ar: "ديكور", en: "Decor" } },
  { id: "P-108", name: { ar: "إبريق شاي نحاس", en: "Copper teapot" }, price: 890, category: { ar: "مطبخ", en: "Kitchen" } },
];

const FIRST: Bi[] = [
  { ar: "أحمد", en: "Ahmed" }, { ar: "مريم", en: "Mariam" }, { ar: "يوسف", en: "Youssef" },
  { ar: "سلمى", en: "Salma" }, { ar: "عمر", en: "Omar" }, { ar: "نور", en: "Nour" },
  { ar: "كريم", en: "Karim" }, { ar: "هبة", en: "Heba" }, { ar: "مصطفى", en: "Mostafa" },
  { ar: "ياسمين", en: "Yasmin" }, { ar: "خالد", en: "Khaled" }, { ar: "دينا", en: "Dina" },
];
const LAST: Bi[] = [
  { ar: "حسن", en: "Hassan" }, { ar: "إبراهيم", en: "Ibrahim" }, { ar: "سعيد", en: "Saeed" },
  { ar: "فؤاد", en: "Fouad" }, { ar: "منصور", en: "Mansour" }, { ar: "عادل", en: "Adel" },
  { ar: "شريف", en: "Sherif" }, { ar: "رمضان", en: "Ramadan" },
];

// Small seeded PRNG (mulberry32).
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const TODAY = new Date(Date.UTC(2026, 10, 14)); // fixed anchor for the demo
export const DAYS = 90;

function isoDay(offset: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() - offset);
  return d.toISOString().slice(0, 10);
}

function build(): Order[] {
  const r = rng(20261114);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];
  const orders: Order[] = [];
  let n = 1000;
  for (let day = DAYS - 1; day >= 0; day--) {
    // Gentle growth over the quarter plus weekend bumps.
    const base = 3 + ((DAYS - day) / DAYS) * 5;
    const weekday = new Date(isoDay(day)).getUTCDay();
    const count = Math.round(base + r() * 4 + (weekday === 4 || weekday === 5 ? 3 : 0));
    for (let i = 0; i < count; i++) {
      const items = Array.from({ length: 1 + Math.floor(r() * 3) }, () => ({
        productId: pick(PRODUCTS).id,
        qty: 1 + Math.floor(r() * 2),
      }));
      const total = items.reduce((s, it) => s + PRODUCTS.find((p) => p.id === it.productId)!.price * it.qty, 0) + 50;
      const f = pick(FIRST);
      const l = pick(LAST);
      let status: Status;
      const x = r();
      if (day <= 1) status = x < 0.6 ? "new" : "processing";
      else if (day <= 4) status = x < 0.25 ? "processing" : x < 0.9 ? "shipped" : "cancelled";
      else status = x < 0.86 ? "delivered" : x < 0.93 ? "returned" : "cancelled";
      orders.push({
        id: `#${++n}`,
        date: isoDay(day),
        customer: { ar: `${f.ar} ${l.ar}`, en: `${f.en} ${l.en}` },
        phone: `01${pick(["0", "1", "2", "5"])}${String(Math.floor(r() * 1e8)).padStart(8, "0")}`,
        city: pick(CITIES),
        items,
        total,
        status,
        payment: r() < 0.68 ? "cod" : "card",
      });
    }
  }
  return orders.reverse(); // newest first
}

export const ORDERS: Order[] = build();

export function productById(id: string) {
  return PRODUCTS.find((p) => p.id === id)!;
}
export { isoDay };
