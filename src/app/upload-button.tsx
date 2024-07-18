"use client";

import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
 
const formSchema = z.object({
  title: z.string().min(2).max(200),
  file: z.custom<FileList>((val) => val instanceof FileList, "Required").refine((files) => files.length > 0, "Required"),
})

export default function UploadButton() {
  const { toast } = useToast()
 const organization = useOrganization();
const user = useUser();
const generateUploadUrl = useMutation(api.files.generateUploadUrl);

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    title: "",
    file: undefined,
  },
})
const fileRef = form.register("file")

async function onSubmit(values: z.infer<typeof formSchema>) {
  
  if(!orgId) return;
  const postUrl = await generateUploadUrl();

  const result = await fetch(postUrl, {
    method: "POST",
    headers: { "Content-Type": values.file[0].type },
    body: values.file[0],
  });
  const { storageId } = await result.json();

  try {
    await createFile({
      name: values.title,
      fileId: storageId,
      orgId,
    })
    form.reset();
    setIsFileDialogOpen(false);
  
    toast({
      variant: "success",
      title: "file uploaded",
      description: "now everyone can view your file"
    })
  } catch (err) {
    toast({
      variant: "destructive",
      title: "something went wrong",
      description: "your file could not uploaded, try again later"
    })
  }
}

let orgId: string | undefined = undefined;
if(organization.isLoaded && user.isLoaded){
  orgId = organization.organization?.id ?? user.user?.id
}
//  const files = useQuery(api.files.getFiles, orgId ? {orgId} : "skip");

 const createFile = useMutation(api.files.createFile);

 const [idFileDialogOpen, setIsFileDialogOpen] = useState(false);

  return (

  <Dialog open={idFileDialogOpen} onOpenChange={(isOpen) => setIsFileDialogOpen(isOpen)}>
  <DialogTrigger asChild>
  <Button onClick={() => {}}>
    Upload file
  </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="mb-8">Upload your file here</DialogTitle>
      <DialogDescription>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={() => (
            <FormItem>
              <FormLabel>File</FormLabel>
              <FormControl>
                <Input type="file" {...fileRef}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" 
          disabled={form.formState.isSubmitting} 
          className="flex gap-1">
            {
              form.formState.isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Submit
        </Button>
      </form>
    </Form>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
  </Dialog>
 
  );
}
