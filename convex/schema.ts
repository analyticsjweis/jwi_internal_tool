import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  companies: defineTable({
    name: v.string(),
    ownerName: v.string(),
    email: v.string(),
    phone: v.string(),
    createdAt: v.number(),
  }),

  mediaItems: defineTable({
    companyId: v.id("companies"),
    name: v.string(),
    description: v.string(),
    type: v.union(v.literal("image"), v.literal("video")),
    url: v.string(),
    uploadedAt: v.number(),
  }),

  ads: defineTable({
    mediaId: v.id("mediaItems"),
    companyId: v.id("companies"),
    assignedToCompanyIds: v.array(v.id("companies")),
    startDate: v.string(),
    endDate: v.string(),
    spendUSD: v.number(),
    leads: v.number(),
    clicks: v.number(),
    reach: v.number(),
  }),
}); 