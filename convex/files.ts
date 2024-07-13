import {ConvexError, v} from "convex/values"
import {mutation, MutationCtx, query, QueryCtx} from "./_generated/server"


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
    //   fileId: v.id("_storage"),
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
        // fileId: args.fileId,
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


  