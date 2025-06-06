import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query all ad stats for an ad
export const listByAd = query({
  args: {
    adId: v.id("ads"),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("adStats")
      .filter((q) => q.eq(q.field("adId"), args.adId))
      .order("desc")
      .collect();
    return stats;
  },
});

// Get a single ad stat by ID
export const get = query({
  args: { id: v.id("adStats") },
  handler: async (ctx, args) => {
    const stat = await ctx.db.get(args.id);
    return stat;
  },
});

// Create a new ad stat entry
export const create = mutation({
  args: {
    adId: v.id("ads"),
    weekStartDate: v.string(),
    spendUSD: v.number(),
    leads: v.number(),
    clicks: v.number(),
    reach: v.number(),
  },
  handler: async (ctx, args) => {
    const statId = await ctx.db.insert("adStats", {
      ...args,
      createdAt: Date.now(),
    });
    return statId;
  },
});

// Update an ad stat entry
export const update = mutation({
  args: {
    id: v.id("adStats"),
    weekStartDate: v.string(),
    spendUSD: v.number(),
    leads: v.number(),
    clicks: v.number(),
    reach: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
    return id;
  },
});

// Delete an ad stat entry
export const remove = mutation({
  args: { id: v.id("adStats") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
}); 