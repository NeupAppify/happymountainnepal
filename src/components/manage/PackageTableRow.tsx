
'use client';

import { Link } from "@neup/components/ui/link";
import type { Tour } from '@/lib/types';
import { Button } from '@neup/components/ui/button';
import { MoreHorizontal, Trash2, FileText, FileDown } from 'lucide-react';
import { exportTourToDocx } from '@/lib/docx-export';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@neup/components/ui/dropdown-menu';
import { DeletePackageDialog } from '@/components/manage/DeletePackageDialog';
import { Badge } from '@neup/components/ui/badge';
import { Card, CardContent } from '@neup/components/ui/card';
import Image from 'next/image';

interface PackageTableRowProps {
  tour: Tour;
}

export function PackageManagementCard({ tour }: PackageTableRowProps) {
  const getStatusVariant = (status: Tour['status']) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'unpublished':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const displayStatus = tour.status || 'draft';

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-accent/5 transition-colors border-b last:border-0 relative group">
      <Link href={`/manage/packages/${tour.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {tour.name}</span>
      </Link>
      <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0 border">
        <Image src={tour.mainImage?.url || 'https://placehold.co/600x400'} alt={tour.name} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0 pointer-events-none">
        <p className="font-medium text-base group-hover:text-primary transition-colors truncate">{tour.name}</p>
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground">{Array.isArray(tour.region) ? tour.region.join(', ') : tour.region}</span>
          <span>&bull;</span>
          <span>{tour.duration} days</span>
          <span>&bull;</span>
          <Badge variant={getStatusVariant(displayStatus)} className="h-5 px-1.5 text-[10px] pointer-events-auto">
            {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2 relative z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/tours/${tour.slug}`} target="_blank">View Public Page</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/manage/packages/${tour.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/manage/packages/${tour.id}/basics`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportTourToDocx(tour)}>
              <FileDown className="mr-2 h-4 w-4" />
              Export to Word (.docx)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DeletePackageDialog tour={tour}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DeletePackageDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
