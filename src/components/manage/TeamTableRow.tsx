
'use client';

import { LinkButton } from "@neup/components/ui/link-button";
import type { TeamMember } from '@/lib/types';
import { Button } from '@neup/components/ui/button';
import {
  TableCell,
  TableRow,
} from '@neup/components/ui/table';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@neup/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@neup/components/ui/dropdown-menu';
import { DeleteTeamMemberDialog } from '@/components/manage/DeleteTeamMemberDialog';

interface TeamTableRowProps {
  member: TeamMember;
}

export function TeamTableRow({ member }: TeamTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={member.image} alt={member.name} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{member.name}</span>
        </div>
      </TableCell>
      <TableCell>{member.role}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <LinkButton href={`/about/teams/${member.slug}`}>View Public Profile</LinkButton>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <LinkButton href={`/manage/team/${member.id}/edit`}>Edit</LinkButton>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DeleteTeamMemberDialog member={member}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DeleteTeamMemberDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
