import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Migration function to update ads schema and move metrics to adStats
export const migrateAdsData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Starting ads data migration...");
    
    // Get all ads
    const ads = await ctx.db.query("ads").collect();
    console.log(`Found ${ads.length} ads to migrate`);
    
    for (const ad of ads) {
      const updates: any = {};
      
      // Add missing fields
      if (!ad.name) {
        updates.name = `Ad Campaign #${ad._id.slice(-6)}`;
      }
      if (!ad.createdAt) {
        updates.createdAt = Date.now();
      }
      
      // Update the ad if needed
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(ad._id, updates);
        console.log(`Updated ad ${ad._id} with:`, updates);
      }
      
      // If this ad has old metrics, create an adStats entry
      if (ad.spendUSD !== undefined || ad.leads !== undefined || ad.clicks !== undefined || ad.reach !== undefined) {
        const statsData = {
          adId: ad._id,
          weekStartDate: ad.startDate, // Use start date as first week
          spendUSD: ad.spendUSD || 0,
          leads: ad.leads || 0,
          clicks: ad.clicks || 0,
          reach: ad.reach || 0,
          createdAt: Date.now(),
        };
        
        await ctx.db.insert("adStats", statsData);
        console.log(`Created adStats entry for ad ${ad._id}`);
        
        // Remove the old metric fields from the ad
        const fieldsToRemove = {
          spendUSD: undefined,
          leads: undefined,
          clicks: undefined,
          reach: undefined,
          mediaId: undefined,
        };
        
        await ctx.db.patch(ad._id, fieldsToRemove);
        console.log(`Removed legacy fields from ad ${ad._id}`);
      }
    }
    
    console.log("✅ Migration completed!");
    return { migratedAds: ads.length };
  },
}); 