'use client';

import { useState, useEffect, useCallback } from 'react';
import { AddGroupForm } from "@/app/dashboard/add-student-form";
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TeacherHeader } from "@/components/layout/teacher-header";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';


type Group = {
  id: string;
  className: string;
  groupName: string;
  email: string;
}

export default function TeacherStudentsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'groups'));
      if (!snapshot.empty) {
        const groupData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
        setGroups(groupData);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]); // Clear groups on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Manajemen Kelompok"
          description="Tambah kelompok baru dan lihat daftar kelompok yang terdaftar."
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
            <div className="w-full">
              <AddGroupForm onGroupAdded={fetchGroups} />
            </div>
            <div className="w-full">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Kelompok</CardTitle>
                  <CardDescription>Berikut adalah daftar kelompok yang terdaftar.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>Daftar kelompok akan muncul di sini jika ada.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Kelompok</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Kelas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                           <TableRow key={index}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          </TableRow>
                        ))
                      ) : groups.length > 0 ? (
                        groups.map((group) => (
                          <TableRow key={group.id}>
                            <TableCell>{group.groupName}</TableCell>
                            <TableCell>{group.email}</TableCell>
                            <TableCell>{group.className}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              Belum ada kelompok yang ditambahkan.
                            </TableCell>
                          </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
