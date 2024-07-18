"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import UploadButton from "./upload-button";
import { FileCard } from "./file-card";

export default function Home() {
  const { toast } = useToast()
  const organization = useOrganization();
  const user = useUser();

let orgId: string | undefined = undefined;
if(organization.isLoaded && user.isLoaded){
  orgId = organization.organization?.id ?? user.user?.id
}
 const files = useQuery(api.files.getFiles, orgId ? {orgId} : "skip");

  return (
    <main className="container mx-auto pt-12">
     <div className="flex justify-between items-center mb-4">
      <h1>Your Files</h1>
        <UploadButton/>
      </div>
      <div className="grid grid-cols-4 gap-4">
      {
        files?.map((file) => {
          return <FileCard key={file._id} file ={file}/>
        })
      }
      </div>
    </main>
  );
}
