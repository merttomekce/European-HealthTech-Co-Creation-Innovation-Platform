import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAnnouncementById } from '@/lib/actions/announcements';
import ProjectEditClient from './ProjectEditClient';

export default async function ProjectEditPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const result = await getAnnouncementById(params.id);
  if (!result.success || !result.data) {
    redirect('/my-announcements');
  }

  if (result.data.authorId !== user.id) {
    redirect('/dashboard');
  }

  return (
    <ProjectEditClient
      announcement={{
        ...result.data,
        expiresAt: result.data.expiresAt ? result.data.expiresAt.toISOString() : null,
      }}
    />
  );
}
