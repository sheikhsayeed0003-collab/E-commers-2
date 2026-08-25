import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const files = form.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return NextResponse.json({ error: "No file" }, { status: 400 });

  const urls: string[] = [];
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  if (cloud && key && secret) {
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({ cloud_name: cloud, api_key: key, api_secret: secret });
    for (const file of files) {
      const buf = Buffer.from(await file.arrayBuffer());
      const dataUri = `data:${file.type || "image/jpeg"};base64,${buf.toString("base64")}`;
      const uploaded = await cloudinary.uploader.upload(dataUri, { folder: "maison-atelier" });
      urls.push(uploaded.secure_url);
    }
  } else {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    for (const file of files) {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `${Date.now()}-${safe}`;
      await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
      urls.push(`/uploads/${filename}`);
    }
  }

  return NextResponse.json({ urls, url: urls[0] });
}
