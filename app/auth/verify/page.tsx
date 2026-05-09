import { redirect } from 'next/navigation';

type VerifyPageProps = {
  searchParams?: {
    email?: string;
  };
};

export default function VerifyRoute({ searchParams }: VerifyPageProps) {
  const email = (searchParams?.email || '').trim().toLowerCase();
  redirect(email ? `/auth/register?email=${encodeURIComponent(email)}` : '/login');
}
