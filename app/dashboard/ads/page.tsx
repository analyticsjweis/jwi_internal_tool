"use client";

import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { AddAdModal } from "../../../components/add-ad-modal";
import { EditAdModal } from "../../../components/edit-ad-modal";
import { DeleteAdModal } from "../../../components/delete-ad-modal";

// Define the Ad type based on the Convex schema
interface Ad {
  _id: Id<"ads">;
  mediaId: Id<"mediaItems">;
  companyId: Id<"companies">;
  startDate: string;
  endDate: string;
  spendUSD: number;
  leads: number;
  clicks: number;
  reach: number;
  assignedToCompanyIds: Id<"companies">[];
}

export default function AdsPage() {
  const [selectedCompany, setSelectedCompany] = useState<Id<"companies"> | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<"active" | "completed" | "upcoming" | undefined>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAdId, setEditingAdId] = useState<Id<"ads"> | null>(null);
  const [deletingAd, setDeletingAd] = useState<{ id: Id<"ads">; name: string } | null>(null);

  // Use type assertion to handle the API type issue
  const ads = useQuery(api.ads.list, {
    companyId: selectedCompany,
    status: selectedStatus,
  }) as Ad[] | undefined;
  const companies = useQuery(api.companies.list, {});
  const mediaItems = useQuery(api.media.list, {});

  if (!ads || !companies || !mediaItems) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Ads</h1>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setIsAddModalOpen(true)}>
            Create Ad
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
                value={selectedStatus || ""}
                onChange={(e) => setSelectedStatus(e.target.value as "active" | "completed" | "upcoming" || undefined)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ads Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ad
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spend
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metrics
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ads.map((ad: Ad) => {
              const media = mediaItems.find(m => m._id === ad.mediaId);
              const company = companies.find(c => c._id === ad.companyId);
              
              return (
                <tr key={ad._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          {media?.type === "image" ? (
                            <img src={media.url} alt={media.name} className="h-10 w-10 object-cover rounded-lg" />
                          ) : (
                            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {media?.name || "Unnamed Ad"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{company?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${ad.spendUSD.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Leads: {ad.leads.toLocaleString()}</div>
                      <div>Clicks: {ad.clicks.toLocaleString()}</div>
                      <div>Reach: {ad.reach.toLocaleString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingAdId(ad._id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingAd({ id: ad._id, name: media?.name || "Unnamed Ad" })}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddAdModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingAdId && (
        <EditAdModal
          isOpen={!!editingAdId}
          onClose={() => setEditingAdId(null)}
          adId={editingAdId}
        />
      )}

      {deletingAd && (
        <DeleteAdModal
          isOpen={!!deletingAd}
          onClose={() => setDeletingAd(null)}
          adId={deletingAd.id}
          adName={deletingAd.name}
        />
      )}
    </div>
  );
} 