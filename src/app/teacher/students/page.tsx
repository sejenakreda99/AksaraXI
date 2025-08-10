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
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { EditGroupForm } from './edit-group-form';
import { DeleteGroupDialog } from './delete-group-dialog';
import { useToast } from '@/hooks/use-toast';


type Group = {
  id: string;
  className: string;
  groupName: string;
  email: string;
  members: string[];
}

export default function TeacherStudentsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

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
  
  const handleEditClick = (group: Group) => {
    setSelectedGroup(group);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (group: Group) => {
    setSelectedGroup(group);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedGroup) return;
    try {
      await deleteDoc(doc(db, 'groups', selectedGroup.id));
      toast({
        title: 'Berhasil',
        description: `Kelompok ${selectedGroup.groupName} berhasil dihapus.`
      });
      fetchGroups(); // Refresh the list
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Gagal',
        description: `Gagal menghapus kelompok.`
      });
      console.error('Error deleting group:', error);
    }
  }


  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Manajemen Kelompok"
          description="Tambah, edit, hapus, dan lihat daftar kelompok yang terdaftar."
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
            <div className="w-full xl:col-span-1">
              <AddGroupForm onGroupAdded={fetchGroups} />
            </div>
            <div className="w-full xl:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Daftar Kelompok</CardTitle>
                  <CardDescription>Berikut adalah daftar kelompok yang terdaftar.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>Daftar kelompok akan muncul di sini jika ada.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Nama Kelompok</TableHead>
                        <TableHead>Anggota</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                           <TableRow key={index}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : groups.length > 0 ? (
                        groups.map((group) => (
                          <TableRow key={group.id}>
                            <TableCell className="font-medium">{group.groupName}</TableCell>
                            <TableCell>
                                <ul className="list-disc list-inside text-sm">
                                    {(group.members || []).map(member => <li key={member}>{member}</li>)}
                                </ul>
                            </TableCell>
                            <TableCell>{group.className}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditClick(group)}>
                                  <Edit className="h-4 w-4"/>
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(group)}>
                                  <Trash2 className="h-4 w-4"/>
                                   <span className="sr-only">Hapus</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
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
        
        {selectedGroup && (
          <>
            <EditGroupForm 
              isOpen={isEditDialogOpen} 
              setIsOpen={setIsEditDialogOpen} 
              group={selectedGroup}
              onGroupUpdated={fetchGroups}
            />
            <DeleteGroupDialog
              isOpen={isDeleteDialogOpen}
              setIsOpen={setIsDeleteDialogOpen}
              groupName={selectedGroup.groupName}
              onConfirm={handleDeleteConfirm}
            />
          </>
        )}

      </div>
    </AuthenticatedLayout>
  );
}
