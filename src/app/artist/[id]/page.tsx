import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artist",
};

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>ArtistPage for {id}</div>;
}
