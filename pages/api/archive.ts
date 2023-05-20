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

  const newArchive = await db
    .collection('apps/24-stunden-lauf/archive')
    .add(archive);

  // Move all laps to archive
  let errorWhileArchivingLaps = false;

  const lapsSnapshot = await db.collection('apps/24-stunden-lauf/laps').get();
  lapsSnapshot.forEach(async (lapDoc) => {
    const lap = lapDoc.data() as Lap;

    console.log(lap);

    // Create the lap in the archive
    try {
      await db
        .collection('apps/24-stunden-lauf/archive/' + newArchive.id + '/laps')
        .doc(lapDoc.id)
        .set({
          runnerId: lap.runnerId,
          timestamp: new Date(lap.timestamp.seconds * 1000),
        })
        .then(async () => {
          // Delete the original lap only when the creation of the archive lap was successful
          await db
            .collection('apps/24-stunden-lauf/laps')
            .doc(lapDoc.id)
            .delete();
        });
    } catch (error) {
      errorWhileArchivingLaps = true;
    }
  });

  // Move all runners to archive
  let errorWhileArchivingRunners = false;
  const runnersSnapshot = await db
    .collection('apps/24-stunden-lauf/runners')
    .get();
  runnersSnapshot.forEach(async (runnerDoc) => {
    const runner = runnerDoc.data() as Runner;

    // Create the runner in the archive
    try {
      await db
        .collection(
          'apps/24-stunden-lauf/archive/' + newArchive.id + '/runners'
        )
        .doc(runnerDoc.id)
        .set(runner)
        .then(async () => {
          // Delete the original runner only when the creation of the archive runner was successful
          await db
            .collection('apps/24-stunden-lauf/runners')
            .doc(runnerDoc.id)
            .delete();
        });
    } catch (error) {
      errorWhileArchivingRunners = true;
    }
  });

  if (errorWhileArchivingLaps && errorWhileArchivingRunners) {
    return res.status(500).json({
      error: 'Einige Läufer und Runden konnten nicht archiviert werden',
    });
  } else if (errorWhileArchivingLaps) {
    return res.status(500).json({
      error: 'Einige Runden konnten nicht archiviert werden',
    });
  } else if (errorWhileArchivingRunners) {
    return res.status(500).json({
      error: 'Einige Läufer konnten nicht archiviert werden',
    });
  }

  return res.status(200).json({ success: true });
}
