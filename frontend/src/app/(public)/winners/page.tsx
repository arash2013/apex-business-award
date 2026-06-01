import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { QUALIFIED_BUSINESSES } from "@/lib/seed-data";
import { WinnersClient } from "./WinnersClient";

export const metadata: Metadata = {
  title: `${brand.year} Winners`,
  description: `Browse ${brand.year} ${brand.name} winners in ${brand.city}, ${brand.state}`,
};

export default function WinnersPage() {
  return <WinnersClient businesses={QUALIFIED_BUSINESSES} />;
}
