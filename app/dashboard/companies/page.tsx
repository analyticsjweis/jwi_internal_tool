"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { AddCompanyModal } from "../../../components/add-company-modal";
import { EditCompanyModal } from "../../../components/edit-company-modal";
import { DeleteCompanyModal } from "../../../components/delete-company-modal";
import { AssignMediaModal } from "../../../components/assign-media-modal";

export default function CompaniesPage() {
  const companies = useQuery(api.companies.list);
  const allMedia = useQuery(api.media.list, {});
  const mediaStats = useQuery(api.media.getStats);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<Id<"companies"> | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<{ id: Id<"companies">; name: string } | null>(null);
  const [assigningMediaToCompany, setAssigningMediaToCompany] = useState<{ id: Id<"companies">; name: string } | null>(null);

  // Function to get media count for a company
  const getMediaCount = (companyId: Id<"companies">) => {
    return allMedia?.filter(media => media.companyId === companyId).length || 0;
  };

  if (!companies || !allMedia || !mediaStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mediaStats.unassigned} unassigned media items available for assignment
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setIsAddModalOpen(true)}>
            Add Company
          </Button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {companies.map((company) => (
            <li key={company._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-500">
                          {company.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-blue-600">
                        <Link href={`/dashboard/companies/${company._id}`}>
                          {company.name}
                        </Link>
                      </div>
                      <div className="text-sm text-gray-500">
                        {company.email} • {getMediaCount(company._id)} media items
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAssigningMediaToCompany({ id: company._id, name: company.name })}
                      className="flex items-center space-x-1"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Media</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCompanyId(company._id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingCompany({ id: company._id, name: company.name })}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {company.ownerName}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Created on {new Date(company.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingCompanyId && (
        <EditCompanyModal
          isOpen={!!editingCompanyId}
          onClose={() => setEditingCompanyId(null)}
          companyId={editingCompanyId}
        />
      )}

      {deletingCompany && (
        <DeleteCompanyModal
          isOpen={!!deletingCompany}
          onClose={() => setDeletingCompany(null)}
          companyId={deletingCompany.id}
          companyName={deletingCompany.name}
        />
      )}

      {assigningMediaToCompany && (
        <AssignMediaModal
          isOpen={!!assigningMediaToCompany}
          onClose={() => setAssigningMediaToCompany(null)}
          companyId={assigningMediaToCompany.id}
          companyName={assigningMediaToCompany.name}
        />
      )}
    </div>
  );
} 