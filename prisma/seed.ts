import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { brochureToppers } from "../src/lib/brochure-toppers";
import {
  aboutDefault,
  classSeed,
  contactDefault,
  facultySeed,
  featuresDefault,
  footerDefault,
  heroDefault,
  methodsDefault,
  programsDefault,
  subjectSeed,
} from "../src/lib/defaults";
import { slugUser } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  const userId = process.env.ADMIN_USER_ID || "user-PVIANYAK@33445566";
  const password = process.env.ADMIN_PASSWORD || "ViNAYAKtuTOrials";
  const name = process.env.ADMIN_NAME || "Vinayak Admin";
  const existingAdmin = await prisma.admin.findUnique({ where: { userId } });
  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        userId,
        name,
        passwordHash: await bcrypt.hash(password, 12),
        mustChangePassword: true,
      },
    });
    console.log("Created bootstrap admin. Change this password at first sign-in.");
  }

  for (const item of classSeed) {
    await prisma.classGroup.upsert({
      where: { name: item.name },
      update: { sortOrder: item.sortOrder, deletedAt: null },
      create: item,
    });
  }

  const classes = await prisma.classGroup.findMany();
  for (const classGroup of classes) {
    const batch = await prisma.batch.findFirst({ where: { classId: classGroup.id, name: "Batch A" } });
    if (!batch) {
      await prisma.batch.create({ data: { classId: classGroup.id, name: "Batch A", capacity: 30 } });
    }
  }

  for (const subject of subjectSeed) {
    await prisma.subject.upsert({
      where: { name: subject.name },
      update: { code: subject.code, band: subject.band },
      create: subject,
    });
  }

  const subjects = await prisma.subject.findMany();
  let facultyIndex = await prisma.faculty.count();
  const facultyPassword = process.env.FACULTY_PASSWORD || "VinayakFac1";
  const facultyHash = await bcrypt.hash(facultyPassword, 12);
  for (const member of facultySeed) {
    const existing = await prisma.faculty.findFirst({ where: { name: member.name, deletedAt: null } });
    const faculty =
      existing ??
      (await prisma.faculty.create({
        data: {
          facultyCode: `VT-F-${String(++facultyIndex).padStart(4, "0")}`,
          name: member.name,
          description: member.description,
          displayOrder: member.order,
          visibleOnWebsite: true,
          status: "active",
        },
      }));
    for (const subjectName of member.subjects) {
      const subject = subjects.find((item) => item.name === subjectName);
      if (!subject) continue;
      await prisma.facultySubjectAssignment.upsert({
        where: { facultyId_subjectId: { facultyId: faculty.id, subjectId: subject.id } },
        update: {},
        create: { facultyId: faculty.id, subjectId: subject.id },
      });
    }
    const senior = member.subjects.some((subjectName) => ["Physics", "Chemistry", "Biology"].includes(subjectName));
    const classNames = senior ? ["Standard 11", "Standard 12"] : ["Standard 6", "Standard 7", "Standard 8", "Standard 9", "Standard 10"];
    for (const className of classNames) {
      const classGroup = classes.find((item) => item.name === className);
      if (!classGroup) continue;
      const linked = await prisma.facultyClassAssignment.findFirst({
        where: { facultyId: faculty.id, classId: classGroup.id, batchId: null },
      });
      if (!linked) {
        await prisma.facultyClassAssignment.create({ data: { facultyId: faculty.id, classId: classGroup.id } });
      }
    }
    if (!faculty.userId || !faculty.passwordHash) {
      const userId = faculty.userId || `fac.${slugUser(member.name)}`;
      await prisma.faculty.update({
        where: { id: faculty.id },
        data: {
          userId,
          passwordHash: faculty.passwordHash || facultyHash,
          mustChangePassword: true,
        },
      });
    }
  }

  const years = ["2024-25", "2025-26", "2026-27"];
  for (const year of years) {
    await prisma.academicYear.upsert({
      where: { name: year },
      update: {},
      create: { name: year, isCurrent: year === "2026-27" },
    });
  }

  await prisma.websiteSection.upsert({
    where: { key: "hero" },
    update: {},
    create: { key: "hero", title: heroDefault.heading, subtitle: "Hero", body: heroDefault.description, extra: JSON.stringify(heroDefault) },
  });
  await prisma.websiteSection.upsert({
    where: { key: "about" },
    update: {},
    create: {
      key: "about",
      title: aboutDefault.title,
      subtitle: aboutDefault.eyebrow,
      body: aboutDefault.body,
      extra: JSON.stringify(aboutDefault),
    },
  });
  await prisma.websiteSection.upsert({
    where: { key: "programs" },
    update: {},
    create: { key: "programs", title: "Academic programs", extra: JSON.stringify(programsDefault) },
  });
  await prisma.websiteSection.upsert({
    where: { key: "features" },
    update: {},
    create: { key: "features", title: "Why choose us", extra: JSON.stringify(featuresDefault) },
  });
  await prisma.websiteSection.upsert({
    where: { key: "methods" },
    update: {},
    create: { key: "methods", title: "Teaching methodology", extra: JSON.stringify(methodsDefault) },
  });
  await prisma.websiteSetting.upsert({
    where: { key: "contact" },
    update: {},
    create: { key: "contact", value: JSON.stringify(contactDefault) },
  });
  await prisma.websiteSetting.upsert({
    where: { key: "footer" },
    update: {},
    create: { key: "footer", value: JSON.stringify(footerDefault) },
  });
  await prisma.websiteSetting.upsert({
    where: { key: "logo" },
    update: {},
    create: { key: "logo", value: "/media/logo.png" },
  });
  const logo = await prisma.websiteSetting.findUnique({ where: { key: "logo" } });
  if (!logo || logo.value === "/brand/mark.svg") {
    await prisma.websiteSetting.upsert({
      where: { key: "logo" },
      update: { value: "/media/logo.png" },
      create: { key: "logo", value: "/media/logo.png" },
    });
  }

  const hero = await prisma.websiteSection.findUnique({ where: { key: "hero" } });
  if (hero?.extra) {
    const extra = JSON.parse(hero.extra) as { image?: string; backgroundImage?: string };
    if (!extra.image || !extra.backgroundImage) {
      extra.image = extra.image || "/media/classroom.jpg";
      extra.backgroundImage = extra.backgroundImage || "/media/brochure-cover.jpg";
      await prisma.websiteSection.update({ where: { key: "hero" }, data: { extra: JSON.stringify(extra) } });
    }
  }

  const bannerCount = await prisma.promotionalBanner.count();
  if (bannerCount === 0) {
    await prisma.promotionalBanner.create({
      data: {
        imagePath: "/media/classroom.jpg",
        heading: "Admissions open for English-medium batches",
        subtitle: "Standards 6 to 12 · GSEB & CBSE · Personal group tuition in Anand",
        ctaText: "Enquire Now",
        ctaHref: "/admission-enquiry",
        displayOrder: 1,
        active: true,
      },
    });
  }

  const noticeCount = await prisma.notice.count();
  if (noticeCount === 0) {
    await prisma.notice.createMany({
      data: [
        {
          title: "Admissions open",
          description:
            "Vinayak Tutorials is accepting admission enquiries for English-medium personal group tuition. Standards 6 to 10, and Science (PCM and PCB) for Standards 11 and 12. GSEB and CBSE.",
          category: "Admission",
          audience: "everyone",
          priority: "important",
          published: true,
          publishAt: new Date(),
        },
        {
          title: "Classes run Monday to Saturday",
          description:
            "Teaching is held six days a week, Monday to Saturday. Batch timings are shared at the time of admission. Each batch has a maximum of 30 students.",
          category: "Academic",
          audience: "everyone",
          priority: "normal",
          published: true,
          publishAt: new Date(),
        },
      ],
    });
  }

  const topperCount = await prisma.topper.count();
  if (topperCount === 0) {
    await prisma.topper.createMany({
      data: brochureToppers.map((item, index) => ({
        name: item.name,
        photoPath: null,
        standard: item.standard,
        percentage: item.percentage,
        school: item.school,
        academicYear: "2024-25",
        description: item.suffix,
        featured: item.featured,
        displayOrder: index + 1,
      })),
    });
  }

  const galleryCount = await prisma.galleryImage.count();
  if (galleryCount === 0) {
    await prisma.galleryImage.createMany({
      data: [
        { imagePath: "/media/classroom.jpg", title: "A class at Vinayak Tutorials", category: "Classroom", displayOrder: 1 },
        { imagePath: "/media/brochure-cover.jpg", title: "Institute brochure", category: "Institute", displayOrder: 2 },
      ],
    });
  }

  if ((await prisma.student.count()) === 0) {
    const classGroup = classes.find((item) => item.name === "Standard 8");
    const batch = classGroup ? await prisma.batch.findFirst({ where: { classId: classGroup.id, deletedAt: null } }) : null;
    const password = process.env.DEMO_STUDENT_PASSWORD || "VinayakStu1";
    await prisma.student.create({
      data: {
        studentCode: "VT-S-0001",
        userId: "stu.demo",
        passwordHash: await bcrypt.hash(password, 12),
        mustChangePassword: true,
        fullName: "Demo Student",
        classId: classGroup?.id,
        batchId: batch?.id,
        board: "GSEB",
        status: "active",
      },
    });
    console.log("Created demo student login stu.demo. Change this password at first sign-in.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
