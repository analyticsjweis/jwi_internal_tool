import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    password: v.string(),
    salt: v.string(),
    createdAt: v.number(),
    role: v.union(v.literal("admin"), v.literal("user")),
    isVerified: v.boolean(),
    lastLogin: v.optional(v.number()),
  }).index("by_email", ["email"]),

  companies: defineTable({
    name: v.string(),
    ownerName: v.string(),
    email: v.string(),
    phone: v.string(),
    createdAt: v.number(),
  }),

  mediaItems: defineTable({
    companyId: v.optional(v.id("companies")),
    name: v.string(),
    description: v.string(),
    type: v.union(v.literal("image"), v.literal("video")),
    url: v.string(),
    uploadedAt: v.number(),
  }),

  ads: defineTable({
    name: v.optional(v.string()),
    companyId: v.id("companies"),
    assignedToCompanyIds: v.array(v.id("companies")),
    startDate: v.string(),
    endDate: v.string(),
    budget: v.number(),
    createdAt: v.optional(v.number()),
    // Legacy fields - will be removed after migration
    mediaId: v.optional(v.id("mediaItems")),
    spendUSD: v.optional(v.number()),
    leads: v.optional(v.number()),
    clicks: v.optional(v.number()),
    reach: v.optional(v.number()),
  }),

  adStats: defineTable({
    adId: v.id("ads"),
    weekStartDate: v.string(),
    spendUSD: v.number(),
    leads: v.number(),
    clicks: v.number(),
    reach: v.number(),
    createdAt: v.number(),
  }),
}); 