
"use client";

import AuthenticatedLayout from "@/app/(authenticated)/layout";

export default function MateriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedLayout>
        {children}
    </AuthenticatedLayout>
  );
}
