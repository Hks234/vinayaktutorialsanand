import type { Metadata } from "next";
import { GalleryBoard } from "@/components/site/GalleryBoard";
import { PageHero } from "@/components/site/PageHero";
import { SiteFrame } from "@/components/site/SiteFrame";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({
    where: { deletedAt: null },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
  return (
    <SiteFrame>
      <PageHero eyebrow="Campus" title="Classrooms, events and student moments." text="Photographs uploaded from the admin portal." />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <GalleryBoard images={images} />
      </section>
    </SiteFrame>
  );
}
