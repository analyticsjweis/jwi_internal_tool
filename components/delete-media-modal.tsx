"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaId: Id<"mediaItems"> | null;
  mediaName: string;
}

export function DeleteMediaModal({
  isOpen,
  onClose,
  mediaId,
  mediaName,
}: DeleteMediaModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMedia = useMutation(api.media.remove);

  const handleDelete = async () => {
    if (!mediaId) return;

    setIsDeleting(true);
    try {
      await deleteMedia({ id: mediaId });
      onClose();
    } catch (error) {
      console.error("Error deleting media:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Media Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{mediaName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 