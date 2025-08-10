'use server';

import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  let serviceAccount: ServiceAccount | undefined;
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
  } catch (e) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
  }

  return initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}

const db = getFirestore(getAdminApp());
const chapterCollection = db.collection('chapters');

const defaultContent = {
    introduction: `Tuhan Maha Pemurah karena bangsa Indonesia dianugerahi dengan alam yang sangat indah. Kita patut mensyukurinya. Salah satu bentuk rasa syukur kita pada Tuhan atas alam adalah kita mampu mengapresiasi keindahan alam yang kita punya. Alam Indonesia begitu luas. Di daerah kalian, tentu juga ada alam yang patut dilestarikan dan dijaga keindahannya. Kalian pun bisa memperkenalkan alam kalian pada dunia luar. Kalian bisa memotretnya, lalu mengunggahnya ke media daring atau menuliskannya dengan bahasa Indonesia yang baik dan benar. Orang lain akan terkagumkagum menyimak, memirsa, melihat, dan membaca teks yang kalian buat. Bagaimana kalian bisa membuat teks itu dengan bagus agar orang lain turut merasakan keindahan alam yang kalian perkenalkan? Melalui pembelajaran pada bab ini, dengan tema “Keindahan Alam”, kalian akan belajar memperkaya diri dengan menyimak, membaca, menulis, dan mempresentasikan teks deskripsi tentang keindahan alam Indonesia.`,
    learningObjective: `Pada bab ini, kalian akan mempelajari bagaimana mengevaluasi gagasan dan pandangan teks deskripsi, serta menuliskan gagasan dan pandangan dalam teks deskripsi.`,
    keywords: ['teks deskripsi', 'gagasan', 'pandangan'],
};


export async function getChapterContent() {
  const docRef = chapterCollection.doc('1');
  const doc = await docRef.get();

  if (!doc.exists) {
    // If the document doesn't exist, create it with default content
    await docRef.set(defaultContent);
    return defaultContent;
  }

  const data = doc.data();
  return {
      introduction: data?.introduction || '',
      learningObjective: data?.learningObjective || '',
      keywords: data?.keywords || []
  };
}

const FormSchema = z.object({
  introduction: z.string().min(10, "Pengantar harus diisi."),
  learningObjective: z.string().min(10, "Tujuan pembelajaran harus diisi."),
  keywords: z.string().min(1, "Kata kunci harus diisi."),
});

export type State = {
  errors?: {
    introduction?: string[];
    learningObjective?: string[];
    keywords?: string[];
  };
  message?: string | null;
};

export async function updateChapterContent(prevState: State, formData: FormData) {
  const validatedFields = FormSchema.safeParse({
    introduction: formData.get('introduction'),
    learningObjective: formData.get('learningObjective'),
    keywords: formData.get('keywords'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Gagal memperbarui. Harap periksa kembali isian Anda.',
    };
  }
  
  const { introduction, learningObjective, keywords } = validatedFields.data;
  const keywordsArray = keywords.split(',').map(k => k.trim()).filter(Boolean);

  try {
    const docRef = chapterCollection.doc('1');
    await docRef.update({
      introduction,
      learningObjective,
      keywords: keywordsArray,
    });

    revalidatePath('/teacher/materi/bab-1');
    return { message: 'Konten berhasil diperbarui.' };
  } catch (error) {
    console.error('Error updating document:', error);
    return { message: 'Terjadi kesalahan pada server.' };
  }
}
