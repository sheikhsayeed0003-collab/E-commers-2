const input = "w-full border border-line bg-transparent px-3 py-2 text-sm";

export async function collectProductImages(fd: FormData) {
  const fromUrl = String(fd.get("images") || "")
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const uploaded: string[] = [];
  if (files.length) {
    const body = new FormData();
    files.forEach((file) => body.append("file", file));
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = await res.json();
    if (Array.isArray(data.urls)) uploaded.push(...data.urls);
  }

  return [...fromUrl, ...uploaded];
}

export function ProductImageFields({ defaultUrls = "" }: { defaultUrls?: string }) {
  return (
    <div className="md:col-span-2 grid gap-3 border border-line p-4">
      <p className="text-xs tracking-[0.2em] uppercase">Product images — URL or upload</p>
      <label className="text-sm text-muted">
        Image URL
        <textarea
          className={`${input} mt-1`}
          name="images"
          rows={3}
          defaultValue={defaultUrls}
          placeholder="https://... (one URL per line)"
        />
      </label>
      <label className="text-sm text-muted">
        Upload from computer
        <input className={`${input} mt-1`} type="file" name="files" accept="image/*" multiple />
      </label>
      <p className="text-xs text-muted">You can use both: paste URLs and also upload files. All images are saved together.</p>
    </div>
  );
}
