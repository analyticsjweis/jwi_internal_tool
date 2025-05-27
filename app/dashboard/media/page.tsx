"use client";

import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NewMediaModal } from "../../../components/new-media-modal";

export default function MediaPage() {
  const [selectedCompany, setSelectedCompany] = useState<Id<"companies"> | undefined>();
  const [selectedType, setSelectedType] = useState<"image" | "video" | undefined>();
  const [isNewMediaModalOpen, setIsNewMediaModalOpen] = useState(false);

  const mediaItems = useQuery(api.media.list, {
    companyId: selectedCompany,
    type: selectedType,
  });
  const deleteMedia = useMutation(api.media.remove);
  const companies = useQuery(api.companies.list);

  const handleDelete = async (id: Id<"mediaItems">) => {
    if (window.confirm("Are you sure you want to delete this media item?")) {
      await deleteMedia({ id });
    }
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
                onChange={(e) => setSelectedCompany(e.target.value as Id<"companies"> || undefined)}
              >
                <option value="">All Companies</option>
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
                  <img src={media.url} alt={media.name} className="h-16 w-16 object-cover rounded-lg" />
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
                  {companies.find(c => c._id === media.companyId)?.name}
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
                onClick={() => handleDelete(media._id)}
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
    </div>
  );
} 