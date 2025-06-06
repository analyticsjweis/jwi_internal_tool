import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUploadUrl } from "../lib/cloudflare";
// import { Id } from "./_generated/dataModel";

// Query all media items
export const list = query({
  args: {
    companyId: v.optional(v.union(v.id("companies"), v.literal("unassigned"))),
    type: v.optional(v.union(v.literal("image"), v.literal("video"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("mediaItems").order("desc");
    
    if (args.companyId) {
      if (args.companyId === "unassigned") {
        query = query.filter((q) => q.eq(q.field("companyId"), undefined));
      } else {
        query = query.filter((q) => q.eq(q.field("companyId"), args.companyId));
      }
    }
    
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }
    
    const mediaItems = await query.collect();
    return mediaItems;
  },
});

// Get a single media item by ID
export const get = query({
  args: { id: v.id("mediaItems") },
  handler: async (ctx, args) => {
    const mediaItem = await ctx.db.get(args.id);
    return mediaItem;
  },
});

// Create a new media item
export const create = mutation({
  args: {
    companyId: v.optional(v.id("companies")),
    name: v.string(),
    description: v.string(),
    type: v.union(v.literal("image"), v.literal("video")),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const mediaId = await ctx.db.insert("mediaItems", {
      ...args,
      uploadedAt: Date.now(),
    });
    return mediaId;
  },
});

// Update a media item
export const update = mutation({
  args: {
    id: v.id("mediaItems"),
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
    return id;
  },
});

// Delete a media item
export const remove = mutation({
  args: { id: v.id("mediaItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Assign media to a company
export const assignToCompany = mutation({
  args: {
    mediaId: v.id("mediaItems"),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.mediaId, {
      companyId: args.companyId,
    });
    return args.mediaId;
  },
});

// Remove media from company (make it unassigned)
export const removeFromCompany = mutation({
  args: {
    mediaId: v.id("mediaItems"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.mediaId, {
      companyId: undefined,
    });
    return args.mediaId;
  },
});

// Get media statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allMedia = await ctx.db.query("mediaItems").collect();
    const unassignedCount = allMedia.filter(media => !media.companyId).length;
    const assignedCount = allMedia.filter(media => media.companyId).length;
    const imageCount = allMedia.filter(media => media.type === "image").length;
    const videoCount = allMedia.filter(media => media.type === "video").length;
    
    return {
      total: allMedia.length,
      unassigned: unassignedCount,
      assigned: assignedCount,
      images: imageCount,
      videos: videoCount,
    };
  },
});

export const getCloudflareUploadUrl = mutation({
  args: {
    fileName: v.string(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("📤 [Convex] Upload URL requested for:", args.fileName);
    const { signedUrl, publicUrl } = await getUploadUrl(args.fileName, args.contentType);
    return { signedUrl, publicUrl };
  },
}); 