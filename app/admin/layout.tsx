import React from 'react';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import './admin.css';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, name: true }
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    // If not admin, redirect to regular dashboard
    redirect('/dashboard');
  }

  return (
    <AdminSidebar adminName={dbUser.name || "Admin"}>
      {children}
    </AdminSidebar>
  );
}
