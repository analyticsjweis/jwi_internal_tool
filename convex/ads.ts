import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
// import { Id } from "./_generated/dataModel";

// Query all ads
export const list = query({
  args: {
    companyId: v.optional(v.id("companies")),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("upcoming"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("ads");
    
    if (args.companyId) {
        query = query.filter((q) =>
            q.or(
              q.eq(q.field("companyId"), args.companyId),
            //   q.eq(q.field("assignedToCompanyIds"), args.companyId)
            )
          );
    }
    if (args.status) {
      const now = new Date().toISOString();
      if (args.status === "active") {
        query = query.filter((q) => 
          q.and(
            q.lte(q.field("startDate"), now),
            q.gte(q.field("endDate"), now)
          )
        );
      } else if (args.status === "completed") {
        query = query.filter((q) => q.lt(q.field("endDate"), now));
      } else if (args.status === "upcoming") {
        query = query.filter((q) => q.gt(q.field("startDate"), now));
      }
    }
    
    const ads = await query.collect();
    return ads;
  },
});

// Get a single ad by ID
export const get = query({
  args: { id: v.id("ads") },
  handler: async (ctx, args) => {
    const ad = await ctx.db.get(args.id);
    return ad;
  },
});

// Create a new ad
export const create = mutation({
  args: {
    name: v.string(),
    companyId: v.id("companies"),
    assignedToCompanyIds: v.array(v.id("companies")),
    startDate: v.string(),
    endDate: v.string(),
    budget: v.number(),
    mediaId: v.id("mediaItems"),
  },
  handler: async (ctx, args) => {
    const adId = await ctx.db.insert("ads", {
      ...args,
      createdAt: Date.now(),
    });
    return adId;
  },
});

// Update an ad
export const update = mutation({
  args: {
    id: v.id("ads"),
    name: v.string(),
    companyId: v.id("companies"),
    assignedToCompanyIds: v.array(v.id("companies")),
    startDate: v.string(),
    endDate: v.string(),
    budget: v.number(),
    mediaId: v.id("mediaItems"),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
    return id;
  },
});

// Delete an ad
export const remove = mutation({
  args: { id: v.id("ads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
}); 