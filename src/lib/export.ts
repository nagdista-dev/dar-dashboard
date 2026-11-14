import { productById, type Order } from "./data";
import { statusLabel, type Lang } from "./i18n";

// CSV with a UTF-8 BOM and CRLF line endings opens correctly in Excel,
// including Arabic text, without an xlsx dependency.
export function exportOrdersCsv(orders: Order[], lang: Lang) {
  const head =
    lang === "ar"
      ? ["رقم الطلب", "التاريخ", "العميل", "الموبايل", "المدينة", "المنتجات", "الإجمالي", "الحالة", "الدفع"]
      : ["Order", "Date", "Customer", "Phone", "City", "Items", "Total", "Status", "Payment"];
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = orders.map((o) => [
    o.id,
    o.date,
    o.customer[lang],
    o.phone,
    o.city[lang],
    o.items.map((it) => `${productById(it.productId).name[lang]} ×${it.qty}`).join(" | "),
    o.total,
    statusLabel[lang][o.status],
    o.payment === "cod" ? (lang === "ar" ? "عند الاستلام" : "Cash on delivery") : lang === "ar" ? "كارت" : "Card",
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `dar-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
