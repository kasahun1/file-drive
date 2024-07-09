import {ConvexError, v} from "convex/values"
import {mutation, query} from "./_generated/server"

export const createFile = mutation({
    args: {
      name: v.string(),
    //   fileId: v.id("_storage"),
    //   orgId: v.string(),
    //   type: fileTypes,
    },
    async handler(ctx, args) {
      const identity = await ctx.auth.getUserIdentity();
      if(!identity){
        throw new ConvexError("you must log in to to upload file");
      }
  
      await ctx.db.insert("files", {
        name: args.name,
        // orgId: args.orgId,
        // fileId: args.fileId,
        // type: args.type,
        // userId: hasAccess.user._id,
      });
    },
  });

  export const getFiles = query({
    args: {},
    async handler(ctx, args){

      const identity = await ctx.auth.getUserIdentity();
      if(!identity){
        return [];
      }

      return ctx.db.query("files").collect();
    }
  });


  