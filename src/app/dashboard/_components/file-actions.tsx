
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog" 
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { FileIcon, MoreVertical, StarHalf, StarIcon, TrashIcon, UndoIcon } from "lucide-react"
import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useToast } from "@/components/ui/use-toast"
import { Protect } from "@clerk/nextjs"
  
export function FileCardActions({file, isFavorited}: {file: Doc<"files"> & { url: string | null }; isFavorited: boolean }){
    const deleteFile = useMutation(api.files.deleteFile);
    const toggleFavorite = useMutation(api.files.toggleFavorite)
    const restoreFile = useMutation(api.files.restoreFile);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const { toast } = useToast()
    const me = useQuery(api.users.getMe);

return(
    <>
<AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={async() => {
           await deleteFile({fileId: file._id})
           toast({
            variant: "default",
            title: "file marked for deletion",
            description: " your file deleted soon "
          })
      }}>
        Continue
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>


        <DropdownMenu>
        <DropdownMenuTrigger><MoreVertical/> </DropdownMenuTrigger>
        <DropdownMenuContent>
        <DropdownMenuItem
            onClick={() => {
              window.open(getFileUrl(file.fileId), "_blank");
             }}
            className="flex gap-1 items-center cursor-pointer"
          >
            <FileIcon className="w-4 h-4" /> Download
          </DropdownMenuItem>

        <DropdownMenuItem onClick={() => {
          toggleFavorite({fileId: file._id})
        }} className="flex gap-1  items-center cursor-pointer">
          {
            isFavorited ? ( <div className="flex gap-1 items-center"><StarIcon className="w-4 h-4"/> unfavorite</div>) : (
              <div className="flex gap-1 items-center"><StarHalf className="w-4 h-4"/>favorite</div>
            )
          }  
        </DropdownMenuItem>
        
        <Protect
         condition={(check) => {
          return (
            check({
              role: "org:admin",
            }) || file.userId === me?._id
          );
        }}
         fallback={<></>}
        >
        <DropdownMenuSeparator/>
          <DropdownMenuItem 
          onClick={() => {
            if (file.shouldDelete) {
              restoreFile({
                fileId: file._id,
              });
            } else {
              setIsConfirmOpen(true);
            }
          }}
           className="flex gap-1 text-red-600 items-center cursor-pointer"
           >
          {file.shouldDelete ? (
                <div className="flex gap-1 text-green-600 items-center cursor-pointer">
                  <UndoIcon className="w-4 h-4" /> Restore
                </div>
              ) : (
                <div className="flex gap-1 text-red-600 items-center cursor-pointer">
                  <TrashIcon className="w-4 h-4" /> Delete
                </div>
              )}
          </DropdownMenuItem>
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
        </>
)
}

export function getFileUrl(fileId: Id<"_storage">): string{
  // https://tame-cow-232.convex.cloud/api/storage/865e4940-00a6-4c43-8b8e-fdab85687896
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}
