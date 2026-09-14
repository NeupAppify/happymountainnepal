
import { getTeamMemberBySlug } from '@/lib/db';
import TeamMemberClient from './team-member-client';
import { notFound } from 'next/navigation';
import { Skeleton } from '@neup/components/ui/skeleton';
import { AdminPageControl } from '@/components/admin/AdminPageControl';

type TeamMemberPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);

  if (!member) {
    notFound();
  }

  return (
    <>
      <AdminPageControl editPath={`/manage/team/${member.id}`} />
      <TeamMemberClient member={member} />
    </>
  );
}
