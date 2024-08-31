import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
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
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
 
  
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { FileIcon, FileTextIcon, GanttChartIcon, ImageIcon, MoreVertical, StarHalf, StarIcon, TrashIcon, UndoIcon } from "lucide-react"
import { ReactNode, use, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { Protect } from "@clerk/nextjs"
import { formatRelative} from 'date-fns'
  
function FileCardActions({file, isFavorited}: {file: Doc<"files">, isFavorited: boolean }){
    const deleteFile = useMutation(api.files.deleteFile);
    const toggleFavorite = useMutation(api.files.toggleFavorite)
    const restoreFile = useMutation(api.files.restoreFile);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const { toast } = useToast()

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
        <DropdownMenuItem onClick={() => {
          toggleFavorite({fileId: file._id})
        }} className="flex gap-1  items-center cursor-pointer">
          {
            isFavorited ? ( <div className="flex gap-1 items-center"><StarIcon className="w-4 h-4"/> unfavorite</div>) : (
              <div className="flex gap-1 items-center"><StarHalf className="w-4 h-4"/>favorite</div>
            )
          }  
        </DropdownMenuItem>
        <DropdownMenuItem
            onClick={() => {
              window.open(getFileUrl(file.fileId), "_blank");
             }}
            className="flex gap-1 items-center cursor-pointer"
          >
            <FileIcon className="w-4 h-4" /> Download
          </DropdownMenuItem>
        <Protect
         role="org:admin"
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

function getFileUrl(fileId: Id<"_storage">): string{
  // https://tame-cow-232.convex.cloud/api/storage/865e4940-00a6-4c43-8b8e-fdab85687896
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}

export function FileCard({file, favorites}: {file: Doc<"files">, favorites: Doc<"favorites">[]}){

  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileTextIcon />,
    csv: <GanttChartIcon />,
  } as Record<Doc<"files">["type"], ReactNode>;

  const isFavorited = favorites.some((favorite) => favorite.fileId === file._id);
  const userProfile = useQuery(api.users.getUserProfile, {userId: file.userId});

 return(
<Card>
  <CardHeader className="relative">
    
    <CardTitle className="flex gap-2 text-base font-normal">
    <div className="flex justify-center">{typeIcons[file.type]}</div>
      {file.name} 
    </CardTitle>
    <div className="absolute top-2 right-2">
    <FileCardActions isFavorited={isFavorited} file={file}/>
    </div>
   
  </CardHeader>
  <CardContent className="h-[200px] flex justify-center items-center">
  {file.type === "image" && (
    <Image alt={file.name} width="200" height="100" src={getFileUrl(file.fileId)} />
  )}

  {file.type === "csv" && <GanttChartIcon className="w-20 h-20" />}
  {file.type === "pdf" && <FileTextIcon className="w-20 h-20" />}
  </CardContent>
  <CardFooter className="flex justify-between">
        <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userProfile?.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {userProfile?.name}
        </div>
        <div className="text-xs text-gray-700">
          Uploaded on {formatRelative(new Date(file._creationTime), new Date())}
        </div>
      </CardFooter>
</Card>

 )
}