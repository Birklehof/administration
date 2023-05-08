import { deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export async function deleteArchive(archiveId: string) {
  await deleteDoc(doc(db, "apps", "24-stunden-lauf", "archive", archiveId));
}

export async function deleteRunner(runnerId: string) {
  await deleteDoc(doc(db, "apps", "24-stunden-lauf", "runners", runnerId));
}

export async function deleteUser(id: string, email: string) {
  if (email.endsWith("@s.birklehof.de")) {
    await deleteDoc(doc(db, "students", id));
  } else {
    await deleteDoc(doc(db, "staff", id));
  }
}
