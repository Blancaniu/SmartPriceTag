import Link from "next/link";
import { ArrowLeft, FileText, Info } from "lucide-react";
import { ProcessedFoodItem } from "@/app/lib/pricingEngine";

export default function PersonalProductInfo({ product }: { product: ProcessedFoodItem }) {
  return (
    <main className="min-h-screen bg-[#FAFDF9] text-[#304721]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold hover:border-[#3C9F47]">
          <ArrowLeft className="h-4 w-4" />Back to products
        </Link>
        <h1 className="mb-6 text-3xl font-black">{product.name}</h1>
        <section className="mb-4 rounded-2xl border border-slate-200/90 bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold"><FileText className="h-4 w-4 text-[#3C9F47]" />Ingredients</h2>
          <p className="text-sm leading-relaxed text-slate-600">{product.ingredients || "Ingredients are not available. Check the product packaging for the full list."}</p>
        </section>
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold"><Info className="h-4 w-4 text-[#3C9F47]" />If you buy now…</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
            <li>Follow the storage instructions on the packaging, including any refrigeration requirements.</li>
            <li>Check the date label on the packaging before buying and plan when you will use it.</li>
            <li>After opening, follow the package instructions for storage and how soon to use the product.</li>
          </ul>
          <button type="button" className="mt-5 rounded-xl bg-[#304721] px-4 py-2 text-sm font-bold text-white hover:bg-[#3C9F47] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#304721]">Further advice</button>
        </section>
      </div>
    </main>
  );
}
