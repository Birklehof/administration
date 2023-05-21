import { NextApiRequest, NextApiResponse } from 'next';
import { auth, db } from '@/lib/firebase/firebaseAdmin';
import { Lap, Runner } from '@/lib/interfaces';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Check if user is admin
  try {
    const token = await auth.verifyIdToken(
      req.headers.authorization.toString()
    );

    if (!token.email) {
      throw new Error('Access token invalid');
    }

    const role = await db
      .collection('apps/administration/roles')
      .doc(token.email)
      .get();

    if (!role.exists || role.data()?.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }

  const timestamp = new Date().getTime();
  const archive = {
    timestamp: timestamp,
  };

  const archiveDoc = await db
    .collection('apps/24-stunden-lauf/archive')
    .add(archive)
    .catch(() => {
      return res.status(500).json({ error: 'Error creating archive' });
    });

  if (!archiveDoc) {
    return res.status(500).json({ error: 'Error creating archive' });
  }

  const archiveId = await archiveDoc
    .get()
    .then((archiveSnapshot) => {
      return archiveSnapshot.id || '';
    })
    .catch(() => {
      return res.status(500).json({ error: 'Error creating archive' });
    });

  if (!archiveId) {
    return res.status(500).json({ error: 'Error creating archive' });
  }

  // Move all laps to archive
  const archivePromise = new Promise<void>(async (resolve, reject) => {
    await db
      .collection('apps/24-stunden-lauf/laps')
      .get()
      .then(async (lapsSnapshot) => {
        await Promise.all(
          lapsSnapshot.docs.map(async (lapDoc) => {
            const lap = lapDoc.data() as Lap;

            console.log(lap);

            // Create the lap in the archive
            await db
              .collection('apps/24-stunden-lauf/archive/' + archiveId + '/laps')
              .doc(lapDoc.id)
              .set({
                runnerId: lap.runnerId,
                timestamp: new Date(lap.timestamp.seconds * 1000),
              });
          })
        ).then(async () => {
          // Move all runners to archive
          await db
            .collection('apps/24-stunden-lauf/runners')
            .get()
            .then(async (runnersSnapshot) => {
              await Promise.all(
                runnersSnapshot.docs.map(async (runnerDoc) => {
                  const runner = runnerDoc.data() as Runner;

                  // Create the runner in the archive
                  await db
                    .collection(
                      'apps/24-stunden-lauf/archive/' + archiveId + '/runners'
                    )
                    .doc(runnerDoc.id)
                    .set(runner);
                })
              ).then(() => {
                resolve();
              });
            });
        });
      })
      .catch(() => {
        reject();
      });
  });

  await archivePromise
    .then(async () => {
      // Delete property runners and laps from apps/24-stunden-lauf
      await deleteCollection('apps/24-stunden-lauf/laps');
      await deleteCollection('apps/24-stunden-lauf/runners');

      return res.status(200).json({ success: true });
    })
    .catch(async (error) => {
      console.error(error);
      await db
        .collection('apps/24-stunden-lauf/archive')
        .doc(archiveId)
        .delete();

      return res.status(500).json({ error: 'Error while archiving' });
    });
}

async function deleteCollection(path: string) {
  await db.collection(path)
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
