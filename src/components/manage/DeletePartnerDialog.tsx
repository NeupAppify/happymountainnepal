
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
import { deletePartner, logError } from "@/lib/db";
import type { Partner } from "@/lib/types";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

interface DeletePartnerDialogProps {
  partner: Partner;
  children: React.ReactNode;
}

export function DeletePartnerDialog({ partner, children }: DeletePartnerDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deletePartner(partner.id);
        toast({
          title: "Success",
          description: `Partner "${partner.name}" has been deleted.`,
        });
      } catch (error: any) {
        console.error("Failed to delete partner:", error);
        logError({ message: `Failed to delete partner ${partner.id}`, stack: error.stack, pathname, context: { partnerId: partner.id, partnerName: partner.name } });
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not delete partner. Please try again.",
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
            This action cannot be undone. This will permanently delete the partner
            <span className="font-semibold"> {partner.name}</span>.
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

    
