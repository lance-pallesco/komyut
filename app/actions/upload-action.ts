"use server";

import fs from "fs/promises";
import path from "path";

export async function uploadImageAction(formData: FormData, type: "avatar" | "cover") {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    // 1. Cloud Deployment Strategy (Cloudinary CDN REST API for Vercel / Railway / Render)
    if (cloudName && uploadPreset) {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      cloudinaryFormData.append("upload_preset", uploadPreset);
      cloudinaryFormData.append("folder", `komyut/${type}s`);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: cloudinaryFormData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Cloudinary upload error:", errorData);
        return { success: false, error: "Cloud storage upload failed" };
      }

      const data = await res.json();
      return { success: true, url: data.secure_url };
    }

    // 2. Local Development Strategy (Saves to /public/uploads/ ignored by .gitignore)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const folder = type === "avatar" ? "avatars" : "covers";
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const extension = file.name.split(".").pop() || "png";
    const filename = `${type}-${Date.now()}.${extension}`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${folder}/${filename}`;
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error("Error saving image file:", error);
    return { success: false, error: "Failed to upload file to storage" };
  }
}
