'use client';

import { Button } from '@neup/components/ui/button';
import { FileText } from 'lucide-react';
import { exportTourToDocx } from '@/lib/docx-export';
import type { Tour } from '@/lib/types';
import { useState } from 'react';

interface DownloadDocxButtonProps {
  tour: Tour;
}

export function DownloadDocxButton({ tour }: DownloadDocxButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await exportTourToDocx(tour);
    } catch (error) {
      console.error('Failed to export to DOCX', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2"
      onClick={handleDownload}
      disabled={loading}
    >
      <FileText className="h-4 w-4" />
      {loading ? 'Generating...' : 'Download DOCX'}
    </Button>
  );
}
