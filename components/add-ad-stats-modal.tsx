"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
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

interface AddAdStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: Id<"ads">;
}

export function AddAdStatsModal({ isOpen, onClose, adId }: AddAdStatsModalProps) {
  const router = useRouter();
  const createAdStats = useMutation(api.adStats.create);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    weekStartDate: "",
    spendUSD: 0,
    leads: 0,
    clicks: 0,
    reach: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("🚀 Creating ad stats with data:", {
        adId,
        ...formData,
        spendUSD: Number(formData.spendUSD),
        leads: Number(formData.leads),
        clicks: Number(formData.clicks),
        reach: Number(formData.reach),
      });

      await createAdStats({
        adId,
        ...formData,
        spendUSD: Number(formData.spendUSD),
        leads: Number(formData.leads),
        clicks: Number(formData.clicks),
        reach: Number(formData.reach),
      });

      console.log("✅ Ad stats created successfully!");
      
      // Reset form
      setFormData({
        weekStartDate: "",
        spendUSD: 0,
        leads: 0,
        clicks: 0,
        reach: 0,
      });
      
      onClose();
      router.refresh();
    } catch (error) {
      console.error("❌ Failed to create ad stats:", error);
      alert("Failed to create ad stats. Please try again.");
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Weekly Stats</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weekStartDate">Week Start Date</Label>
            <Input
              id="weekStartDate"
              name="weekStartDate"
              type="date"
              required
              value={formData.weekStartDate}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spendUSD">Spend (USD)</Label>
            <Input
              id="spendUSD"
              name="spendUSD"
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.spendUSD}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leads">Leads</Label>
            <Input
              id="leads"
              name="leads"
              type="number"
              required
              min="0"
              value={formData.leads}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clicks">Clicks</Label>
            <Input
              id="clicks"
              name="clicks"
              type="number"
              required
              min="0"
              value={formData.clicks}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reach">Reach</Label>
            <Input
              id="reach"
              name="reach"
              type="number"
              required
              min="0"
              value={formData.reach}
              onChange={handleChange}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Stats"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 