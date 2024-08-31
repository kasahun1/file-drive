"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import UploadButton from "./upload-button";
import { FileCard } from "./file-card";
import Image from "next/image";
import { GridIcon, Loader2, RowsIcon, TableIcon } from "lucide-react";
import { SearchBar } from "./search-bar";
import { useState } from "react";
import { DataTable } from "./file-table";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"



function Placeholder(){
  return(
    <div className="flex flex-col gap-8 items-center w-full mt-24">
    <Image alt="no data or files" width="300" height="300" src="./empty.svg"/>
    <div className="text-xl">You have no files, upload one!</div>
    <UploadButton/>  
    </div>
  )
}

export function FileBrowser({title, favoritesOnly,deletedOnly}: {title: string, favoritesOnly?: boolean, deletedOnly?: boolean}) {
  const { toast } = useToast()
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");

let orgId: string | undefined = undefined;
if(organization.isLoaded && user.isLoaded){
  orgId = organization.organization?.id ?? user.user?.id
}
 const files = useQuery(api.files.getFiles, orgId ? {orgId, query, favorites: favoritesOnly, deletedOnly} : "skip");
 const favorites = useQuery(api.files.getAllFavorites, orgId ? {orgId}: "skip")
 const isLoading = files === undefined;

 const modifiedFiles = files?.map((file) => ({...file, isFavorited: (favorites ?? []).some((favorite) => favorite.fileId === file._id),})) ?? [];

  return (
     <div className="w-full">
      {isLoading && (
        <div className="flex flex-col gap-8 items-center w-full mt-24">
        <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
        <div className="text-2xl">Loading your files...</div>
        </div>
      )}
     
      {/* {
        !isLoading && !query && files?.length === 0 && <Placeholder/>
      } */}

       {
        !isLoading && (
      <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold">{title}</h1>
            <SearchBar query={query} setQuery={setQuery}/>
            <UploadButton/>
          </div>  
      
<Tabs defaultValue="grid">
  <TabsList className="mb-2">
    <TabsTrigger value="grid" className="flex gap-2 items-center"><GridIcon/> Grid</TabsTrigger>
    <TabsTrigger value="table" className="flex gap-2 items-center"><RowsIcon/> Table</TabsTrigger>
  </TabsList>
  <TabsContent value="grid"> 
    <div className="grid grid-cols-3 gap-4">
      {
        modifiedFiles?.map((file) => {
          return <FileCard key={file._id} file ={file}/>
        })
      }
      </div>
  </TabsContent>
  <TabsContent value="table">
  <DataTable columns={columns} data={modifiedFiles} />
  </TabsContent>
</Tabs>

{files?.length === 0 &&  <Placeholder/>}
             
 </>
)
  }
</div>
  );
}
