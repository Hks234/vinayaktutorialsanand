export type Feature = { title: string; description: string };
export type MethodStep = { step: string; title: string; description: string };
export type Program = { title: string; subjects: string[]; board: string; blurb: string; enquire: string };
export type HeroContent = {
  heading: string;
  description: string;
  backgroundImage: string;
  image: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  pills: string[];
};
export type AboutContent = {
  eyebrow: string;
  title: string;
  body: string;
  mission: string;
  vision: string;
  philosophy: string;
  commitment: string;
};
export type ContactContent = {
  address: string;
  phone: string;
  hours: string;
  mapQuery: string;
  email: string;
};
export type FooterContent = {
  name: string;
  tagline: string;
  statement: string;
};

export const heroDefault: HeroContent = {
  heading: "Building Bright Futures Through Quality Education.",
  description:
    "Personal Group Tuition for English Medium Students. Dedicated Faculty, Individual Attention and a Learning Environment That Inspires Success.",
  backgroundImage: "",
  image: "",
  primaryCtaText: "Enquire for Admission",
  primaryCtaHref: "/admission-enquiry",
  secondaryCtaText: "Explore Our Institute",
  secondaryCtaHref: "/about",
  pills: ["Established Since 2003", "GSEB & CBSE", "Standards 6–12", "Experienced Faculty"],
};

export const aboutDefault: AboutContent = {
  eyebrow: "Trusted Educational Institute Since 2003",
  title: "English-medium personal group tuition, with attention for every learner.",
  body: "Vinayak Tutorials is an English-medium personal group tuition institute in Anand, Gujarat. Since 2003, the institute has focused on academic clarity and individual attention for GSEB and CBSE students from Standard 6 to 10, and for Science stream students in Standards 11 and 12.",
  mission:
    "To help every student build strong fundamentals through personal attention, regular practice and a disciplined learning routine.",
  vision:
    "To remain a trusted neighbourhood institute where students gain confidence, clarity and consistent academic progress.",
  philosophy:
    "Teach daily, practice daily, test regularly and solve doubts individually — in English, with Hindi explanations when a student needs them.",
  commitment:
    "Small batches of up to 30 students, six days of teaching from Monday to Saturday, and a faculty team that stays close to each learner's progress.",
};

export const programsDefault: Program[] = [
  {
    title: "Standard 6–10",
    subjects: ["Mathematics", "Science", "Social Science", "English"],
    board: "GSEB & CBSE",
    blurb: "Personal group tuition across the core school subjects, with daily practice and regular testing.",
    enquire: "/admission-enquiry?standard=Standard%208",
  },
  {
    title: "Standard 11–12 PCM",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    board: "Science stream",
    blurb: "Physics, Chemistry and Mathematics for English-medium science students preparing for board examinations.",
    enquire: "/admission-enquiry?standard=Standard%2011&stream=PCM",
  },
  {
    title: "Standard 11–12 PCB",
    subjects: ["Physics", "Chemistry", "Biology"],
    board: "Science stream",
    blurb: "Physics, Chemistry and Biology for English-medium science students, taught in small batches.",
    enquire: "/admission-enquiry?standard=Standard%2011&stream=PCB",
  },
];

export const featuresDefault: Feature[] = [
  { title: "Six Days of Teaching – Monday to Saturday", description: "Classes run six days a week so the syllabus stays on a steady rhythm." },
  { title: "Personal Group Tuition", description: "Students learn in a group small enough for the teacher to know each learner." },
  { title: "Experienced Subject Teachers", description: "Each subject is handled by a teacher who teaches that subject." },
  { title: "Daily Homework and Practice", description: "Practice is given with the day's teaching, not left until the chapter ends." },
  { title: "Regular A.G.W. Tests", description: "A.G.W. tests are part of the weekly routine." },
  { title: "Individual Doubt Solving", description: "Doubts are taken up with the student, not left for the end of the year." },
  { title: "Chapter Tests", description: "A chapter test follows once that chapter has been taught and practised." },
  { title: "Monthly Cluster Tests", description: "Monthly cluster tests review a group of chapters together." },
  { title: "Student Performance Analysis", description: "Test and homework records are used to see where a student needs more work." },
  { title: "Learning Materials Provided in Class", description: "Materials for the lesson are given in class." },
  { title: "Maximum 30 Students Per Batch", description: "A batch is kept to a maximum of 30 students." },
  { title: "English-medium teaching with Hindi explanations when required", description: "Teaching is in English. Hindi is used when a student needs a point explained again." },
];

export const methodsDefault: MethodStep[] = [
  { step: "01", title: "Daily Subject-wise Teaching", description: "Each subject is taught in a planned daily routine." },
  { step: "02", title: "Daily Homework and Practice", description: "Practice work is given so the lesson is used the same day." },
  { step: "03", title: "A.G.W. Test", description: "Regular A.G.W. tests check what has been understood." },
  { step: "04", title: "Homework Checking", description: "Submitted work is checked and mistakes are corrected." },
  { step: "05", title: "Chapter Completion", description: "A chapter is closed only after teaching and practice." },
  { step: "06", title: "Chapter Test", description: "A test is conducted when the chapter is complete." },
  { step: "07", title: "Performance Report", description: "Results and remarks show the student what to improve." },
  { step: "08", title: "Monthly Cluster Test", description: "A monthly cluster test reviews several chapters together." },
];

export const contactDefault: ContactContent = {
  address: "204, 205, Radha Swami Sumit, Gopi Cinema Road, Anand, Gujarat, India.",
  phone: "+91 98252 57153",
  hours: "Monday to Saturday. Exact batch timings are shared at the time of admission.",
  mapQuery: "204, 205, Radha Swami Sumit, Gopi Cinema Road, Anand, Gujarat, India",
  email: "",
};

export const footerDefault: FooterContent = {
  name: "VINAYAK TUTORIALS",
  tagline: "Educate Your Knowledge",
  statement: "A Trusted Name in Educational Institute Since 2003.",
};

export const classSeed = [
  { name: "Standard 6", sortOrder: 6 },
  { name: "Standard 7", sortOrder: 7 },
  { name: "Standard 8", sortOrder: 8 },
  { name: "Standard 9", sortOrder: 9 },
  { name: "Standard 10", sortOrder: 10 },
  { name: "Standard 11", sortOrder: 11 },
  { name: "Standard 12", sortOrder: 12 },
];

export const subjectSeed = [
  { name: "Mathematics", code: "MATH", band: "6-10" },
  { name: "Science", code: "SCI", band: "6-10" },
  { name: "Social Science", code: "SST", band: "6-10" },
  { name: "English", code: "ENG", band: "6-10" },
  { name: "Physics", code: "PHY", band: "11-12" },
  { name: "Chemistry", code: "CHEM", band: "11-12" },
  { name: "Biology", code: "BIO", band: "11-12" },
];

export const facultySeed = [
  { name: "Robin Sir", subjects: ["Mathematics", "Science"], description: "Mathematics and Science.", order: 1 },
  { name: "Seema Madam", subjects: ["Social Science", "English"], description: "Social Science and English.", order: 2 },
  { name: "Sameer Sir", subjects: ["Physics", "Chemistry"], description: "Physics and Chemistry.", order: 3 },
  { name: "Kinjal Madam", subjects: ["Chemistry"], description: "Chemistry.", order: 4 },
  { name: "Pooja Madam", subjects: ["Biology"], description: "Biology.", order: 5 },
];

export const galleryCategories = ["Classroom", "Institute", "Events", "Student Achievements", "Activities"] as const;
export const noticeCategories = ["General", "Examination", "Holiday", "Admission", "Academic"] as const;
export const enquiryStatuses = ["New", "Contacted", "Interested", "Admitted", "Rejected"] as const;
export const standards = classSeed.map((c) => c.name);
export const boards = ["GSEB", "CBSE"] as const;
export const streams = ["PCM", "PCB"] as const;
