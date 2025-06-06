"use client";

import { useState } from "react";
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

interface AssignMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: Id<"companies">;
  companyName: string;
}

export function AssignMediaModal({ isOpen, onClose, companyId, companyName }: AssignMediaModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"image" | "video" | undefined>();
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<Id<"mediaItems">>>(new Set());
  
  // Get all media sorted by upload time (descending)
  const allMedia = useQuery(api.media.list, { type: selectedType });
  
  // Get media already assigned to this company
  const assignedMedia = useQuery(api.media.list, { companyId });
  
  const assignToCompany = useMutation(api.media.assignToCompany);

  // Filter media based on search term and exclude already assigned
  const availableMedia = allMedia?.filter(media => {
    const isAlreadyAssigned = media.companyId === companyId;
    const matchesSearch = media.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         media.description.toLowerCase().includes(searchTerm.toLowerCase());
    return !isAlreadyAssigned && matchesSearch;
  }) || [];

  const handleToggleMedia = (mediaId: Id<"mediaItems">) => {
    const newSelected = new Set(selectedMediaIds);
    if (newSelected.has(mediaId)) {
      newSelected.delete(mediaId);
    } else {
      newSelected.add(mediaId);
    }
    setSelectedMediaIds(newSelected);
  };

  const handleAssign = async () => {
    try {
      // Assign all selected media to the company
      await Promise.all(
        Array.from(selectedMediaIds).map(mediaId =>
          assignToCompany({ mediaId, companyId })
        )
      );
      
      // Reset selections and close modal
      setSelectedMediaIds(new Set());
      setSearchTerm("");
      onClose();
    } catch (error) {
      console.error("Failed to assign media:", error);
      alert("Failed to assign media. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Media to {companyName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search and Filter */}
          <div className="space-y-2">
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedType || ""}
              onChange={(e) => setSelectedType(e.target.value as "image" | "video" || undefined)}
            >
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {availableMedia.map((media) => (
                <div 
                  key={media._id} 
                  className={`relative rounded-lg border p-3 cursor-pointer transition-colors ${
                    selectedMediaIds.has(media._id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleToggleMedia(media._id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {media.type === "image" ? (
                          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{media.name}</p>
                      <p className="text-xs text-gray-500 truncate">{media.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(media.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedMediaIds.has(media._id) && (
                      <div className="text-blue-500">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {availableMedia.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No media found matching your search." : "No unassigned media available."}
              </div>
            )}
          </div>

          {/* Currently Assigned Media */}
          {assignedMedia && assignedMedia.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Currently Assigned ({assignedMedia.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {assignedMedia.slice(0, 5).map((media) => (
                  <div key={media._id} className="flex items-center space-x-1 bg-gray-100 rounded px-2 py-1">
                    <span className="text-xs text-gray-600">{media.name}</span>
                  </div>
                ))}
                {assignedMedia.length > 5 && (
                  <div className="text-xs text-gray-500">
                    +{assignedMedia.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={selectedMediaIds.size === 0}
          >
            Assign {selectedMediaIds.size} Media
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 