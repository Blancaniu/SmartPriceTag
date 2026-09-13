import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark">S</span>
        <span>SmartPriceTag</span>
      </Link>
      <nav>
        <Link href="/business">Business dashboard</Link>
        <Link href="/customer">Customer display</Link>
      </nav>
    </header>
  );
}
