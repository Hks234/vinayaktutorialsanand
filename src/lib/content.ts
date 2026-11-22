import { prisma } from "@/lib/prisma";
import {
  aboutDefault,
  contactDefault,
  featuresDefault,
  footerDefault,
  heroDefault,
  methodsDefault,
  programsDefault,
  type AboutContent,
  type ContactContent,
  type Feature,
  type FooterContent,
  type HeroContent,
  type MethodStep,
  type Program,
} from "@/lib/defaults";

function readJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function getSetting(key: string, fallback: string) {
  const row = await prisma.websiteSetting.findUnique({ where: { key } });
  return row?.value || fallback;
}

export async function getHero(): Promise<HeroContent> {
  const row = await prisma.websiteSection.findUnique({ where: { key: "hero" } });
  const extra = readJson(row?.extra, heroDefault);
  return {
    ...heroDefault,
    ...extra,
    backgroundImage: extra.backgroundImage || "",
    image: extra.image || "",
    pills: extra.pills?.length ? extra.pills : heroDefault.pills,
  };
}

export async function getAbout(): Promise<AboutContent> {
  const row = await prisma.websiteSection.findUnique({ where: { key: "about" } });
  const extra = readJson(row?.extra, aboutDefault);
  return {
    ...aboutDefault,
    ...extra,
    title: row?.title || extra.title,
    body: row?.body || extra.body,
    eyebrow: row?.subtitle || extra.eyebrow,
  };
}

export async function getPrograms(): Promise<Program[]> {
  const row = await prisma.websiteSection.findUnique({ where: { key: "programs" } });
  return readJson(row?.extra, programsDefault);
}

export async function getFeatures(): Promise<Feature[]> {
  const row = await prisma.websiteSection.findUnique({ where: { key: "features" } });
  return readJson(row?.extra, featuresDefault);
}

export async function getMethods(): Promise<MethodStep[]> {
  const row = await prisma.websiteSection.findUnique({ where: { key: "methods" } });
  return readJson(row?.extra, methodsDefault);
}

export async function getContact(): Promise<ContactContent> {
  const row = await prisma.websiteSetting.findUnique({ where: { key: "contact" } });
  return readJson(row?.value, contactDefault);
}

export async function getFooter(): Promise<FooterContent> {
  const row = await prisma.websiteSetting.findUnique({ where: { key: "footer" } });
  return readJson(row?.value, footerDefault);
}

export async function getLogo() {
  return getSetting("logo", "/brand/mark.svg");
}

export async function activeBanners() {
  const now = new Date();
  return prisma.promotionalBanner.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
}
