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
import { deleteReview, logError } from "@/lib/db";
import type { ManagedReview } from "@/lib/types";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

interface DeleteReviewDialogProps {
  review: ManagedReview;
  children: React.ReactNode;
}

export function DeleteReviewDialog({ review, children }: DeleteReviewDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteReview(review.id);
        toast({
          title: "Success",
          description: `Review by "${review.userName}" has been deleted.`,
        });
      } catch (error: any) {
        console.error("Failed to delete review:", error);
        logError({ message: `Failed to delete review ${review.id}`, stack: error.stack, pathname, context: { reviewId: review.id, userName: review.userName } });
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not delete review. Please try again.",
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
            This action cannot be undone. This will permanently delete the review
            by <span className="font-semibold">{review.userName}</span>.
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