'use client';

import type { ManagedReview } from '@/lib/types';
import { Card, CardContent } from '@neup/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@neup/components/ui/avatar';
import { ReviewStars } from '@/components/ReviewStars';
import { Button } from '@neup/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';

const REVIEW_TRUNCATE_LENGTH = 150;

interface ReviewCarouselItemProps {
  review: ManagedReview;
}

export function ReviewCarouselItem({ review }: ReviewCarouselItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpandReview = () => setIsExpanded(prev => !prev);

  const needsTruncation = review.reviewBody.length > REVIEW_TRUNCATE_LENGTH;
  const displayedReviewBody =
    needsTruncation && !isExpanded
      ? `${review.reviewBody.substring(0, REVIEW_TRUNCATE_LENGTH)}...`
      : review.reviewBody;

  return (
    <Card className="flex flex-col shadow-md rounded-2xl transition hover:shadow-xl duration-300">
      <CardContent className="p-8 flex-grow">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.userName}`} />
            <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <p className="font-semibold text-lg">{review.userName}</p>
            {review.userRole && (
              <p className="text-sm text-muted-foreground -mt-0.5">{review.userRole}</p>
            )}
            {/* Adjusted star size and spacing */}
            <div className="mt-1 flex items-center gap-1">
              <ReviewStars rating={review.stars} className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
        </div>

        <p className="text-muted-foreground italic mt-4 text-base leading-relaxed">
          &quot;{displayedReviewBody}&quot;
        </p>

        <div className="mt-4 space-y-2">
          {needsTruncation && (
            <Button
              variant="link"
              onClick={toggleExpandReview}
              className="p-0 h-auto text-primary font-medium"
            >
              {isExpanded ? 'Show Less' : 'Read Full Review'}
            </Button>
          )}

          {review.type === 'offSite' && review.originalReviewUrl && (
            <div>
              <a
                href={review.originalReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                Read from source <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
