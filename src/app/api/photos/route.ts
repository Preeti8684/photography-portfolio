import { NextResponse } from "next/server";
import { createApi } from "unsplash-js";

export const revalidate = 3600; // ISR-like caching for 1 hour

type PhotoDto = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt?: string | null;
};

const unsplash = createApi({ accessKey: process.env.UNSPLASH_ACCESS_KEY ?? "" });

const CATEGORY_QUERY: Record<string, string> = {
  all: "nature",
  oceans: "ocean sea water waves",
  forests: "forest trees woods nature",
  people: "people portrait street",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = (searchParams.get("category") || "all").toLowerCase();
  const query = CATEGORY_QUERY[category] ?? CATEGORY_QUERY.all;

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      { error: "Missing UNSPLASH_ACCESS_KEY environment variable" },
      { status: 500 }
    );
  }

  try {
    const res = await unsplash.search.getPhotos({
      query,
      perPage: 24,
      orientation: "portrait",
    });

    if (res.type !== "success") {
      return NextResponse.json({ error: "Unsplash error" }, { status: 502 });
    }

    const photos: PhotoDto[] = res.response.results.map((p) => ({
      id: p.id,
      src: p.urls.regular,
      width: p.width,
      height: p.height,
      alt: p.alt_description,
    }));

    return NextResponse.json({ photos });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}


