import { WpPage } from "@/components/wp-page";
import { buildRouteMetadata } from "@/lib/wp-content";

export const metadata = buildRouteMetadata("home");

export default function HomePage() {
  return <WpPage slug="home" />;
}
