'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Group = {
  id: string;
  className: string;
  groupName: string;
  email: string;
  members: string[];
};

type EditGroupFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  group: Group;
  onGroupUpdated: () => void;
};

export function EditGroupForm({ isOpen, setIsOpen, group, onGroupUpdated }: EditGroupFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({
    className: group.className,
    groupName: group.groupName,
    members: group.members.join('\n'),
  });
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      className: group.className,
      groupName: group.groupName,
      members: group.members.join('\n'),
    });
  }, [group]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

   const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    const membersArray = formData.members.split('\n').map((name) => name.trim()).filter(Boolean);

    if (!formData.className || !formData.groupName || membersArray.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: 'Semua kolom harus diisi.',
      });
      setIsPending(false);
      return;
    }

    try {
      const groupRef = doc(db, 'groups', group.id);
      await setDoc(groupRef, {
        className: formData.className,
        groupName: formData.groupName,
        members: membersArray,
      }, { merge: true });

      toast({
        title: 'Berhasil',
        description: 'Data kelompok berhasil diperbarui.',
      });
      onGroupUpdated();
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: 'Terjadi kesalahan saat memperbarui data.',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Kelompok: {group.groupName}</DialogTitle>
          <DialogDescription>
            Ubah detail kelompok di bawah ini. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={group.email} disabled />
             <p className="text-xs text-muted-foreground">Email tidak dapat diubah.</p>
          </div>
           <div className="space-y-2">
            <Label htmlFor="className">Kelas</Label>
            <Select name="className" required value={formData.className} onValueChange={(value) => handleSelectChange('className', value)}>
              <SelectTrigger id="className">
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XI-2">XI-2</SelectItem>
                <SelectItem value="XI-3">XI-3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="groupName">Nama Kelompok</Label>
             <Select name="groupName" required value={formData.groupName} onValueChange={(value) => handleSelectChange('groupName', value)}>
              <SelectTrigger id="groupName">
                <SelectValue placeholder="Pilih Kelompok" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={`Kelompok ${num}`}>
                    Kelompok {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="members">Anggota Kelompok</Label>
            <Textarea
              id="members"
              name="members"
              placeholder="Tuliskan nama anggota, satu nama per baris..."
              required
              rows={5}
              value={formData.members}
              onChange={handleChange}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Batal</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
