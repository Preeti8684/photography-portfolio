"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import dynamic from "next/dynamic";
const LightGallery = dynamic(() => import("lightgallery/react"), { ssr: false });
import lgZoom from "lg-zoom";
import lgThumbnail from "lg-thumbnail";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

type Photo = {
  id: string;
  src: string;
  width: number;
  height: number;
  category: "oceans" | "forests" | "people" | "all";
  alt?: string;
};

// Reserve for future local fallback
const ALL_PHOTOS: Photo[] = [] as Photo[];

const CATEGORIES = [
  { key: "all", label: "ALL" },
  { key: "oceans", label: "OCEANS" },
  { key: "forests", label: "FORESTS" },
  { key: "people", label: "PEOPLE" },
] as const;

export default function Home() {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]["key"]>("all");

  const [remote, setRemote] = useState<Photo[]>([]);

  // Fetch photos from our API when category changes
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/photos?category=${active}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setRemote(data.photos ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, [active]);

  const filtered = useMemo(() => remote, [remote]);

  const breakpoints = { default: 3, 1100: 3, 768: 2, 480: 1 };

  return (
    <div className="min-h-screen page-bg text-white">
      <header className="flex items-center justify-between px-8 py-6">
        <h1 className="text-sm tracking-[0.2em]">PHOTOGRAPHY PORTFOLIO</h1>
        <a href="#contact" className="rounded-full bg-white text-black px-5 py-2 text-sm">Get in touch</a>
      </header>

      <nav className="flex gap-8 px-8 pb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={active === c.key ? "tab-active" : "tab-inactive"}
          >
            {c.label}
          </button>
        ))}
      </nav>

      <section className="px-8 pb-16">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <LightGallery speed={300} plugins={[lgZoom as unknown as any, lgThumbnail as unknown as any]} elementClassNames="block">
          <Masonry breakpointCols={breakpoints} className="flex w-auto grid-gap" columnClassName="bg-transparent">
            {filtered.map((photo) => (
              <a key={photo.id} href={photo.src} data-lg-size={`${photo.width}-${photo.height}`} className="block mb-4 overflow-hidden rounded">
                <Image src={photo.src} alt={photo.alt ?? "photo"} width={photo.width} height={photo.height} className="w-full h-auto object-cover" />
              </a>
            ))}
          </Masonry>
        </LightGallery>
      </section>
    </div>
  );
}
