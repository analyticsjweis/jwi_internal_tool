"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NewMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function cleanFilename(filename: string): string {
  return filename
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9.-]/g, '') // Remove special characters except dots and hyphens
    .toLowerCase();                 // Convert to lowercase
}

export function NewMediaModal({ isOpen, onClose }: NewMediaModalProps) {
  const router = useRouter();
  const createMedia = useMutation(api.media.create);
  const getUploadUrl = useMutation(api.media.getCloudflareUploadUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "image" as "image" | "video",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      console.log("🚀 About to call getUploadUrl with:");
      console.log("- fileName:", cleanFilename(selectedFile.name));
      console.log("- contentType:", selectedFile.type);
      console.log("- file size:", selectedFile.size, "bytes");
      
      // Get the upload URL from Cloudflare
      const { signedUrl, publicUrl } = await getUploadUrl({
        fileName: cleanFilename(selectedFile.name),
        contentType: selectedFile.type,
      });

      console.log("✅ Received response from Convex:");
      console.log("- signedUrl length:", signedUrl.length);
      console.log("- signedUrl preview:", signedUrl.substring(0, 100) + "...");
      console.log("- publicUrl:", publicUrl);

      // Upload the file to Cloudflare
      const response = await fetch(signedUrl, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
        }
      });

      console.log("🔄 Starting upload to Cloudflare R2...");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Upload failed:");
        console.error("- Status:", response.status, response.statusText);
        console.error("- Response:", errorText);
        console.error("- Headers:", Object.fromEntries(response.headers.entries()));
        throw new Error(`Failed to upload file: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log("✅ Upload successful!");
      console.log("- Status:", response.status);
      console.log("- Headers:", Object.fromEntries(response.headers.entries()));

      // Create the media record in the database
      await createMedia({
        ...formData,
        url: publicUrl,
      });

      onClose();
      router.refresh();
    } catch (error) {
      console.error("Failed to upload media:", error);
      alert("Failed to upload media. Please try again.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Set the type based on the file's MIME type
      const type = file.type.startsWith("image/") ? "image" : "video";
      setFormData((prev) => ({ ...prev, type }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload New Media</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              required
            />
            {selectedFile && (
              <p className="text-sm text-gray-500">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Upload Media"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 