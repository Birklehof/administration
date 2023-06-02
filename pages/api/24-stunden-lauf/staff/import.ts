import { NextApiRequest, NextApiResponse } from 'next';
import { auth, db } from '@/lib/firebase/firebaseAdmin';
import formidable from 'formidable';
import fs from 'fs';
import { FormidableError, parseForm } from '@/lib/parseForm';
import { Staff } from '@/lib/interfaces';
import { deleteCollection } from '@/lib/firebase/backendUtils';

// Absolutely necessary for the upload to work
export const config = {
  api: {
    bodyParser: false,
  },
};

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

  try {
    // Get the uploaded file
    const { fields, files } = await parseForm(req);
    if (!files.file) {
      throw new Error('No file uploaded');
    }
    const file = files.file as formidable.File;

    // Parse the file
    const newStaff = await parseStaff(file);

    // Delete old staff
    await deleteCollection('staff');

    // Create new staff
    await createStaff(newStaff);

    res.status(200).end();
  } catch (e) {
    if (e instanceof FormidableError) {
      res.status(e.httpCode || 400).end();
    } else {
      res.status(500).end();
    }
  }
}

async function parseStaff(file: formidable.File) {
  let staff: Staff[] = [];
  try {
    const data = fs.readFileSync(file.filepath);
    const lines = data.toString().split('\n');

    for (let i = 1; i < lines.length - 1; i++) {
      staff.push(parseSingleStaff(lines[i]));
    }
  } catch (error) {
    throw new Error('Error while parsing file');
  }

  return staff;
}

function parseSingleStaff(line: string): Staff {
  const staff = line.split(/,|;/);

  const lastName = staff[0].trim();
  const firstName = staff[1].trim();
  const email =
    staff[2]?.trim() ||
    `${firstName.replace(/\s/g, '').toLowerCase()}.${lastName
      .replace(/\s/g, '')
      .toLowerCase()}@birklehof.de`;

  return {
    firstName,
    lastName,
    email,
  };
}

async function createStaff(staff: Staff[]) {
  const batch = db.batch();
  staff.forEach((singleStaff) => {
    const staffRef = db.collection('staff').doc();
    batch.set(staffRef, singleStaff);
  });
  await batch.commit();
}
