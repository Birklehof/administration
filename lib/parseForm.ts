import formidable from 'formidable';
import type { NextApiRequest } from 'next';

export const FormidableError = formidable.errors.FormidableError;

export const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise(async (resolve, reject) => {
    const form = new formidable.IncomingForm();

    form.parse(req, function (err: any, fields: any, files: any) {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};
