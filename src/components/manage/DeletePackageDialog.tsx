
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
import { deleteTour, logError } from "@/lib/db";
import type { Tour } from "@/lib/types";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

interface DeletePackageDialogProps {
  tour: Tour;
  children: React.ReactNode;
}

export function DeletePackageDialog({ tour, children }: DeletePackageDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteTour(tour.id);
        toast({
          title: "Success",
          description: `Package "${tour.name}" has been deleted.`,
        });
      } catch (error: any) {
        console.error("Failed to delete package:", error);
        logError({ message: `Failed to delete package ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, tourName: tour.name } });
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not delete package. Please try again.",
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
            This action cannot be undone. This will permanently delete the package
            <span className="font-semibold"> {tour.name}</span>.
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

    
