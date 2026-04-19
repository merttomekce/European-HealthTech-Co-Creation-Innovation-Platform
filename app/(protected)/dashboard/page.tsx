import { redirect } from 'next/navigation';
import { getAuthRedirect } from '@/lib/actions/authRedirect';

export default async function DashboardRedirect() {
  const target = await getAuthRedirect();
  redirect(target);
}
