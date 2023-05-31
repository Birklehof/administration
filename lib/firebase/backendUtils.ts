import { auth, db } from '@/lib/firebase/firebaseAdmin';

export async function deleteCollection(path: string) {
  await db
    .collection(path)
    .listDocuments()
    .then((val) => {
      var chunks = [];
      for (let i = 0; i < val.length; i += 500) {
        chunks.push(val.slice(i, i + 500));
      }

      for (var chunk of chunks) {
        // Get a new write batch
        var batch = db.batch();
        chunk.map((document) => {
          batch.delete(document);
        });
        batch.commit();
      }
    });
}