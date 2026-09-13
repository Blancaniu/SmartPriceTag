import Link from "next/link";
import type { ProcessedFoodItem } from "@/app/lib/pricingEngine";

export default function BusinessInventory({ items }: { items: ProcessedFoodItem[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <caption className="sr-only">Inventory with freshness, expiry dates, and current pricing</caption>
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>{["Product", "Expiry / status", "Freshness", "Original price", "Current price", "Action"].map(label => <th key={label} scope="col" className="p-4">{label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="p-4"><span className="block font-bold text-[#203B2A]">{item.name}</span><span className="text-xs text-slate-500">{item.category}{item.brand ? ` · ${item.brand}` : ""}</span></td>
              <td className="p-4"><span className="block">{item.expiryDate}</span><span className={`text-xs font-semibold ${item.daysUntilExpiry < 0 ? "text-red-700" : item.daysUntilExpiry <= 2 ? "text-amber-700" : "text-green-700"}`}>{item.daysUntilExpiry < 0 ? "Expired — review listing" : item.daysUntilExpiry === 0 ? "Expires today" : `${item.daysUntilExpiry} days remaining`}</span></td>
              <td className="p-4"><span className="font-semibold">{item.freshnessScore}%</span><span className="block text-xs text-slate-500">{item.freshnessLabel}</span></td>
              <td className="p-4">${item.originalPrice.toFixed(2)}<span className="block text-xs text-slate-500">per {item.unit}</span></td>
              <td className="p-4 font-bold">${item.discountedPrice.toFixed(2)}<span className="block text-xs font-normal text-slate-500">{item.discountPercentage}% markdown</span></td>
              <td className="p-4"><Link className="font-semibold text-[#2D7545] underline underline-offset-4" href={`/product/${item.id}?mode=business`} aria-label={`Manage ${item.name}`}>Manage</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
