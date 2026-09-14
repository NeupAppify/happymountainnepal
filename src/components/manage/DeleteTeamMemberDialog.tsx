
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
import { deleteTeamMember, logError } from "@/lib/db";
import type { TeamMember } from "@/lib/types";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

interface DeleteTeamMemberDialogProps {
  member: TeamMember;
  children: React.ReactNode;
}

export function DeleteTeamMemberDialog({ member, children }: DeleteTeamMemberDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteTeamMember(member.id);
        toast({
          title: "Success",
          description: `Team member "${member.name}" has been deleted.`,
        });
      } catch (error: any) {
        console.error("Failed to delete team member:", error);
        logError({ message: `Failed to delete team member ${member.id}`, stack: error.stack, pathname, context: { memberId: member.id, memberName: member.name } });
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not delete team member. Please try again.",
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
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-semibold">{member.name}</span> from the team.
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

    
