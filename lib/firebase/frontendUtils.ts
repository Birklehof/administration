import { deleteDoc, doc, collection, addDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '.';
import { Staff, Student } from '../interfaces';

export async function deleteArchive(archiveId: string) {
  await deleteDoc(doc(db, 'apps', '24-stunden-lauf', 'archive', archiveId));
}

export async function deleteRunner(runnerId: string) {
  await deleteDoc(doc(db, 'apps', '24-stunden-lauf', 'runners', runnerId));
}

export async function deleteUser(id: string, email: string) {
  if (email.endsWith('@s.birklehof.de')) {
    await deleteDoc(doc(db, 'students', id));
  } else {
    await deleteDoc(doc(db, 'staff', id));
  }
}

export async function createStudent(student: Student) {
  await addDoc(collection(db, 'students'), student);
}

export async function createStaff(staff: Staff) {
  await addDoc(collection(db, 'staff'), staff);
}

export async function getCollectionSize(collectionName: string): Promise<number> {
  const snapshot = await getCountFromServer(collection(db, collectionName));
  return snapshot.data().count || 0;
}