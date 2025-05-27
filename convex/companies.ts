import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
// import { Id } from "./_generated/dataModel";

// Query all companies
export const list = query({
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").collect();
    return companies;
  },
});

// Get a single company by ID
export const get = query({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.id);
    return company;
  },
});

// Create a new company
export const create = mutation({
  args: {
    name: v.string(),
    ownerName: v.string(),
    email: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const companyId = await ctx.db.insert("companies", {
      ...args,
      createdAt: Date.now(),
    });
    return companyId;
  },
});

// Update a company
export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.string(),
    ownerName: v.string(),
    email: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
    return id;
  },
});

// Delete a company
export const remove = mutation({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
}); 