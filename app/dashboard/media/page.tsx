"use client";

import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NewMediaModal } from "../../../components/new-media-modal";
import { DeleteMediaModal } from "../../../components/delete-media-modal";

export default function MediaPage() {
  const [selectedCompany, setSelectedCompany] = useState<Id<"companies"> | "unassigned" | undefined>();
  const [selectedType, setSelectedType] = useState<"image" | "video" | undefined>();
  const [isNewMediaModalOpen, setIsNewMediaModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<{
    id: Id<"mediaItems">;
    name: string;
  } | null>(null);

  const mediaItems = useQuery(api.media.list, {
    companyId: selectedCompany,
    type: selectedType,
  });
  const companies = useQuery(api.companies.list);

  const handleDeleteClick = (id: Id<"mediaItems">, name: string) => {
    setMediaToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setMediaToDelete(null);
  };

  if (!mediaItems || !companies) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Media Library</h1>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setIsNewMediaModalOpen(true)}>
            Upload Media
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex space-x-4">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedCompany || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCompany(value === "" ? undefined : value === "unassigned" ? "unassigned" : value as Id<"companies">);
                }}
              >
                <option value="">All Media</option>
                <option value="unassigned">Unassigned</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
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
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mediaItems.map((media) => (
          <div key={media._id} className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                {media.type === "image" ? (
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/dashboard/media/${media._id}`} className="focus:outline-none">
                <p className="text-sm font-medium text-gray-900">{media.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {media.companyId 
                    ? companies.find(c => c._id === media.companyId)?.name 
                    : "Unassigned"
                  }
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(media.uploadedAt).toLocaleDateString()}
                </p>
              </Link>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/dashboard/media/${media._id}/edit`}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => handleDeleteClick(media._id, media.name)}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <NewMediaModal
        isOpen={isNewMediaModalOpen}
        onClose={() => setIsNewMediaModalOpen(false)}
      />

      <DeleteMediaModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        mediaId={mediaToDelete?.id || null}
        mediaName={mediaToDelete?.name || ""}
      />
    </div>
  );
} 