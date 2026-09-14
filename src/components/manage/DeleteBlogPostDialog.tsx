
'use client';

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
} from "@neup/components/ui/alert-dialog";
import { deleteBlogPost, logError } from "@/lib/db";
import type { BlogPost } from "@/lib/types";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

interface DeleteBlogPostDialogProps {
  post: BlogPost;
  children: React.ReactNode;
}

export function DeleteBlogPostDialog({ post, children }: DeleteBlogPostDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteBlogPost(post.id);
        toast({
          title: "Success",
          description: `Post "${post.title}" has been deleted.`,
        });
      } catch (error: any) {
        console.error("Failed to delete post:", error);
        logError({ message: `Failed to delete post ${post.id}`, stack: error.stack, pathname, context: { postId: post.id, postTitle: post.title } });
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not delete post. Please try again.",
        });
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the post
            <span className="font-semibold"> {post.title}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
