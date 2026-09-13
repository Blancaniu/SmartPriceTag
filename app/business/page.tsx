import Dashboard from "@/app/components/Dashboard";
import BusinessGate from "@/app/components/BusinessGate";

export default function BusinessPage() {
  return <BusinessGate><Dashboard business /></BusinessGate>;
}
