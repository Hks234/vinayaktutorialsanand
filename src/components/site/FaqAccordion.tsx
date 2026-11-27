"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Why should a student join Vinayak Tutorials?",
    a: "The institute has taught English-medium students in Anand since 2003, in small personal groups of up to 30. Each subject has a dedicated teacher, daily practice, and regular tests so doubts are solved while the chapter is still fresh.",
  },
  {
    q: "Which boards and standards are taught?",
    a: "GSEB and CBSE from Standard 6 to 10, and Science stream PCM or PCB for Standards 11 and 12. Teaching is in English, with Hindi explanations when a student needs them.",
  },
  {
    q: "How does the weekly teaching routine work?",
    a: "Classes run Monday to Saturday. A typical cycle is daily teaching, homework, A.G.W. tests, chapter tests after a chapter is complete, and a monthly cluster test that reviews several chapters together.",
  },
  {
    q: "Does this website take fees or reserve a seat?",
    a: "No. An enquiry only tells the institute your standard, board and phone number. The office will call you. Seats and fees are handled at the institute, not online.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState(0);
  return (
    <div className="grid gap-3">
      {faqs.map((item, index) => {
        const active = open === index;
        return (
          <article key={item.q} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-white"
              onClick={() => setOpen(active ? -1 : index)}
              aria-expanded={active}
            >
              <span className="font-semibold">{item.q}</span>
              <ChevronDown size={18} className={`shrink-0 text-orange transition ${active ? "rotate-180" : ""}`} />
            </button>
            {active ? <p className="px-5 pb-5 text-sm leading-7 text-white/70">{item.a}</p> : null}
          </article>
        );
      })}
    </div>
  );
}
