"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: Id<"ads">;
}

export function EditAdModal({ isOpen, onClose, adId }: EditAdModalProps) {
  const router = useRouter();
  const updateAd = useMutation(api.ads.update);
  const ad = useQuery(api.ads.get, { id: adId });
  const companies = useQuery(api.companies.list, {});
  const mediaItems = useQuery(api.media.list, {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mediaId: "",
    companyId: "",
    assignedToCompanyIds: [] as Id<"companies">[],
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (ad) {
      setFormData({
        mediaId: ad.mediaId ?? "",
        companyId: ad.companyId ?? "",
        assignedToCompanyIds: ad.assignedToCompanyIds ?? [],
        startDate: new Date(ad.startDate).toISOString().split("T")[0],
        endDate: new Date(ad.endDate).toISOString().split("T")[0],
      });
    }
  }, [ad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateAd({
        id: adId,
        mediaId: formData.mediaId as Id<"mediaItems">,
        companyId: formData.companyId as Id<"companies">,
        assignedToCompanyIds: formData.assignedToCompanyIds,
        startDate: formData.startDate,
        endDate: formData.endDate,
        name: "",
        budget: 0
      });

      onClose();
      router.refresh();
    } catch (error) {
      console.error("Failed to update ad:", error);
      alert("Failed to update ad. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!ad) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Ad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mediaId">Media</Label>
            <Select
              value={formData.mediaId}
              onValueChange={(value: string) => handleSelectChange("mediaId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select media" />
              </SelectTrigger>
              <SelectContent>
                {mediaItems?.map((media) => (
                  <SelectItem key={media._id} value={media._id}>
                    {media.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyId">Company</Label>
            <Select
              value={formData.companyId}
              onValueChange={(value: string) => handleSelectChange("companyId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies?.map((company) => (
                  <SelectItem key={company._id} value={company._id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              required
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              required
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>



          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 