import { WpPage } from "@/components/wp-page";
import { buildRouteMetadata } from "@/lib/wp-content";

export const metadata = buildRouteMetadata("people");

export default function PeoplePage() {
  return <WpPage slug="people" />;
}
