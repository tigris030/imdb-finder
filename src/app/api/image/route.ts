import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".cache", "images");
const ALLOWED_SIZES = ["w200", "w300", "w500", "original"];

export async function GET(req: NextRequest) {
  const tmdbPath = req.nextUrl.searchParams.get("path");
  const size = req.nextUrl.searchParams.get("size") || "w500";

  if (!tmdbPath || !tmdbPath.startsWith("/") || !ALLOWED_SIZES.includes(size)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const safeFilename = `${size}${tmdbPath.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const cachedPath = path.join(CACHE_DIR, safeFilename);

  // Serve from cache
  try {
    const file = await fs.readFile(cachedPath);
    const ext = path.extname(tmdbPath).slice(1) || "jpg";
    return new NextResponse(file, {
      headers: {
        "Content-Type": `image/${ext}`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    // not cached yet
  }

  // Fetch from TMDB
  const url = `https://image.tmdb.org/t/p/${size}${tmdbPath}`;
  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  // Cache to disk
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(cachedPath, buffer);
  } catch {
    // cache write failed, still serve the image
  }

  const ext = path.extname(tmdbPath).slice(1) || "jpg";
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": `image/${ext}`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
