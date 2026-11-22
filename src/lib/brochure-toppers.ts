export type BrochureTopper = {
  name: string;
  photo: string;
  standard: string;
  percentage: number;
  suffix: "PR" | "%";
  school: string;
  featured: boolean;
};

/** 2024–25 results printed on the institute brochure, in brochure order. */
export const brochureToppers: BrochureTopper[] = [
  { name: "Vraj H. Pandya", photo: "/media/toppers/01.jpg", standard: "12", percentage: 98.52, suffix: "PR", school: "J.P. Thakkar", featured: true },
  { name: "Khushi S. Patel", photo: "/media/toppers/02.jpg", standard: "12", percentage: 98.48, suffix: "PR", school: "J.P. Thakkar", featured: true },
  { name: "Dhyana M. Patel", photo: "/media/toppers/03.jpg", standard: "12", percentage: 84, suffix: "%", school: "D.P.S. School", featured: false },
  { name: "Sanvi P. Shah", photo: "/media/toppers/04.jpg", standard: "12", percentage: 91, suffix: "%", school: "R.P.T.P.", featured: false },
  { name: "Ohm Robin", photo: "/media/toppers/05.jpg", standard: "11", percentage: 97, suffix: "%", school: "Podar School", featured: true },
  { name: "Paramveersinh Raj", photo: "/media/toppers/06.jpg", standard: "11", percentage: 90, suffix: "%", school: "J.P. Thakkar", featured: false },
  { name: "Deep S. Meghani", photo: "/media/toppers/07.jpg", standard: "10", percentage: 99.35, suffix: "PR", school: "J.P. Thakkar", featured: true },
  { name: "Viraj P. Thakkar", photo: "/media/toppers/08.jpg", standard: "10", percentage: 97.99, suffix: "PR", school: "J.P. Thakkar", featured: true },
  { name: "Nishit K. Israni", photo: "/media/toppers/09.jpg", standard: "10", percentage: 96.89, suffix: "PR", school: "J.P. Thakkar", featured: true },
  { name: "Param B. Ka Patel", photo: "/media/toppers/10.jpg", standard: "10", percentage: 96.36, suffix: "PR", school: "I.B. Patel", featured: true },
  { name: "Siddhi V. Navlani", photo: "/media/toppers/11.jpg", standard: "10", percentage: 95.64, suffix: "PR", school: "J.P. Thakkar", featured: true },
  { name: "Bhakti V. Mehta", photo: "/media/toppers/12.jpg", standard: "10", percentage: 94.56, suffix: "PR", school: "C.E.M.S.", featured: false },
  { name: "Aaliya R. Vohra", photo: "/media/toppers/13.jpg", standard: "10", percentage: 93.41, suffix: "PR", school: "I.B. Patel", featured: false },
  { name: "Ishaan K. Vyas", photo: "/media/toppers/14.jpg", standard: "10", percentage: 88.44, suffix: "PR", school: "J.P. Thakkar", featured: false },
  { name: "Prachet S. Modi", photo: "/media/toppers/15.jpg", standard: "10", percentage: 87.38, suffix: "PR", school: "J.P. Thakkar", featured: false },
  { name: "Laurel D. Macwan", photo: "/media/toppers/16.jpg", standard: "10", percentage: 85.39, suffix: "PR", school: "St. Xavier", featured: false },
  { name: "Ishika G. Badi", photo: "/media/toppers/17.jpg", standard: "10", percentage: 85.5, suffix: "PR", school: "Podar School", featured: false },
  { name: "Liza Vohra", photo: "/media/toppers/18.jpg", standard: "10", percentage: 84.94, suffix: "PR", school: "I.B. Patel", featured: false },
  { name: "Kavya K. Mistry", photo: "/media/toppers/19.jpg", standard: "9", percentage: 91.75, suffix: "%", school: "C.E.M.S.", featured: false },
  { name: "Nitya M. Patel", photo: "/media/toppers/20.jpg", standard: "9", percentage: 85.25, suffix: "%", school: "J.P. Thakkar", featured: false },
  { name: "Isha A. Patel", photo: "/media/toppers/21.jpg", standard: "9", percentage: 82.75, suffix: "%", school: "J.P. Thakkar", featured: false },
  { name: "Vrund R. Dalwadi", photo: "/media/toppers/22.jpg", standard: "9", percentage: 81.75, suffix: "%", school: "J.P. Thakkar", featured: false },
  { name: "Bhavya D. Desai", photo: "/media/toppers/23.jpg", standard: "8", percentage: 94, suffix: "%", school: "J.P. Thakkar", featured: false },
  { name: "Tisha A. Patel", photo: "/media/toppers/24.jpg", standard: "8", percentage: 90.75, suffix: "%", school: "J.P. Thakkar", featured: false },
  { name: "Priyansh Rawal", photo: "/media/toppers/25.jpg", standard: "8", percentage: 89.5, suffix: "%", school: "J.P. Thakkar", featured: false },
  { name: "Aastha J. Gajjar", photo: "/media/toppers/26.jpg", standard: "8", percentage: 89, suffix: "%", school: "J.P. Thakkar", featured: false },
  { name: "Disha S. Contractor", photo: "/media/toppers/27.jpg", standard: "7", percentage: 93.5, suffix: "%", school: "C.E.M.S.", featured: false },
  { name: "Mishti N. Gajera", photo: "/media/toppers/28.jpg", standard: "7", percentage: 93.5, suffix: "%", school: "C.E.M.S.", featured: false },
  { name: "Chaitree K. Shelal", photo: "/media/toppers/29.jpg", standard: "7", percentage: 92.25, suffix: "%", school: "C.E.M.S.", featured: false },
  { name: "Kirti V. Navlani", photo: "/media/toppers/30.jpg", standard: "7", percentage: 86, suffix: "%", school: "J.P. Thakkar", featured: false },
];

export function formatScore(percentage: number) {
  if (!Number.isFinite(percentage)) return "—";
  const rounded = Math.round((percentage + Number.EPSILON) * 100) / 100;
  return rounded.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function scoreLabel(percentage: number, description?: string | null) {
  const value = formatScore(percentage);
  return description === "PR" ? `${value} PR` : `${value}%`;
}
