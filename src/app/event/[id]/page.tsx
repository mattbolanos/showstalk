import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event",
};

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>EventPage for {id}</div>;
}
