import { WpPage } from "@/components/wp-page";
import { buildRouteMetadata } from "@/lib/wp-content";

export const metadata = buildRouteMetadata("about-us");

export default function AboutUsPage() {
  return <WpPage slug="about-us" />;
}
