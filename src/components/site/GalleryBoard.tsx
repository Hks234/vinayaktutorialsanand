"use client";

import { useState } from "react";
import { galleryCategories } from "@/lib/defaults";

export function GalleryBoard({ images }: { images: { id: string; imagePath: string; title: string | null; category: string }[] }) {
  const [category, setCategory] = useState("All");
  const shown = category === "All" ? images : images.filter((image) => image.category === category);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {["All", ...galleryCategories].map((item) => (
          <button key={item} type="button" className={`chip ${category === item ? "bg-royal text-white" : ""}`} onClick={() => setCategory(item)}>{item}</button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((image) => (
          <figure key={image.id} className="card overflow-hidden">
            <img src={image.imagePath} alt={image.title || image.category} className="h-56 w-full object-cover" />
            <figcaption className="p-4 text-sm">
              <span className="font-semibold">{image.title || image.category}</span>
              <span className="mt-1 block text-slate-500">{image.category}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {!shown.length ? <p className="mt-6 text-sm text-slate-500">No photographs in this category yet.</p> : null}
    </div>
  );
}
