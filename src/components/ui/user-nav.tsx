'use client';

import { Link } from "@neup/components/ui/link";
import { Userbar } from '@neup/components/element/userbar';
import { useSession } from '@neup/core/providers/session';

export function UserNav() {
  const { user } = useSession();

  const displayName = user?.displayName?.trim() || 'User';
  const secondaryText = user?.neupId?.trim() || user?.accountId?.trim() || null;

  return (
    <Link href="/profile" aria-label="Open profile">
      <Userbar
        displayName={displayName}
        displayImage={user?.displayImage}
        neupid={secondaryText ?? ''}
      />
    </Link>
  );
}
