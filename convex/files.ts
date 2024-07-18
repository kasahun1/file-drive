import {ConvexError, v} from "convex/values"
import {mutation, MutationCtx, query, QueryCtx} from "./_generated/server"


export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("you must be logged in to upload a file");
  }

  return await ctx.storage.generateUploadUrl();
});


export async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  orgId: string
) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    return null;
  }

  // const hasAccess =
  //   user.orgIds.some((item) => item.orgId === orgId) ||
  //   user.tokenIdentifier.includes(orgId);
  
  const hasAccess = user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);

  if (!hasAccess) {
    return null;
  }

  return { user };
}


export const createFile = mutation({
    args: {
      name: v.string(),
      fileId: v.id("_storage"),
      orgId: v.string(),
    //   type: fileTypes,
    },
    async handler(ctx, args) {
      // const identity = await ctx.auth.getUserIdentity();
      // if(!identity){
      //   throw new ConvexError("you must log in to to upload file");
      // }
      const hasAccess = await hasAccessToOrg(ctx, args.orgId);

      if (!hasAccess) {
        throw new ConvexError("you do not have access to this org");
      }
  
      await ctx.db.insert("files", {
        name: args.name,
        orgId: args.orgId,
        fileId: args.fileId,
        // type: args.type,
        // userId: hasAccess.user._id,
      });
    },
  });

  export const getFiles = query({
    args: {
      orgId: v.string(),
    },
    async handler(ctx, args){

      // const identity = await ctx.auth.getUserIdentity();
      // if(!identity){
      //   return [];
      // }

      const hasAccess = await hasAccessToOrg(ctx, args.orgId);

      if (!hasAccess) {
        return [];
      }
    // console.log(identity)
      return ctx.db.query("files").withIndex("by_orgId", (q) => q.eq("orgId", args.orgId)).collect();
    }
  });

  export const deleteFile = mutation({
    args: { fileId: v.id("files") },
    async handler(ctx, args) {
      // const access = await hasAccessToFile(ctx, args.fileId);
  
      // if (!access) {
      //   throw new ConvexError("no access to file");
      // }
  
      // assertCanDeleteFile(access.user, access.file);
      const identity = await ctx.auth.getUserIdentity();
      if(!identity){
        throw new ConvexError("you do not have access to this org");
      }
      const file = await ctx.db.get(args.fileId);
      if(!file){
        throw new ConvexError("this file does not exist");
      }
      const hasAccess = await hasAccessToOrg(
        ctx, 
        identity.tokenIdentifier,
        file.orgId
      );

      if (!hasAccess) {
        throw new ConvexError("you do not have access to delete this file");
      }

      await ctx.db.delete(args.fileId)
  
      // await ctx.db.patch(args.fileId, {
      //   shouldDelete: true,
      // });
    },
  });  
  