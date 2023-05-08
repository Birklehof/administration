import Loading from "@/components/Loading";
import useAuth from "@/lib/hooks/useAuth";
import Head from "@/components/Head";
import { useEffect } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Runner, Staff, Student, Lap } from "@/lib/interfaces";
import { themedPromiseToast } from "@/lib/utils";
import { useDocumentData } from "react-firebase-hooks/firestore";

export default function AdminIndex() {
  const { isLoggedIn, user } = useAuth();
  const [value, loading, error, snapshot] = useDocumentData(
    doc(db, "apps", "24-stunden-lauf")
  );

  async function addStudentsToRunners(): Promise<number> {
    const studentsSnapshot = await getDocs(collection(db, "students"));
    studentsSnapshot.forEach(async (doc) => {
      const student = doc.data() as Student;

      const newRunner = {
        number: 0,
        name: student.firstName + " " + student.lastName,
        type: "student",
        email: student.email,
        class: student.class,
        house: student.house,
      };

      await addDoc(
        collection(db, "apps", "24-stunden-lauf", "runners"),
        newRunner
      );
    });
    return studentsSnapshot.size;
  }

  async function addStaffToRunners(): Promise<number> {
    const staffSnapshot = await getDocs(collection(db, "staff"));
    staffSnapshot.forEach(async (doc) => {
      const staff = doc.data() as Staff;

      const newRunner = {
        number: 0,
        name: staff.firstName + " " + staff.lastName,
        type: "staff",
        email: staff.email,
      };

      await addDoc(
        collection(db, "apps", "24-stunden-lauf", "runners"),
        newRunner
      );
    });
    return staffSnapshot.size;
  }

  async function archive() {
    const timestamp = new Date().getTime();
    const archive = {
      timestamp: timestamp,
    };

    const newArchive = await addDoc(
      collection(db, "apps", "24-stunden-lauf", "archive"),
      archive
    );

    // Move all laps to archive
    const lapsSnapshot = await getDocs(
      collection(db, "apps", "24-stunden-lauf", "laps")
    );
    lapsSnapshot.forEach(async (lapDoc) => {
      const lap = lapDoc.data() as Lap;

      console.log(lap);

      await setDoc(
        doc(
          db,
          "apps",
          "24-stunden-lauf",
          "archive",
          newArchive.id,
          "laps",
          lapDoc.id
        ),
        {
          runnerId: lap.runnerId,
          timestamp: new Date(lap.timestamp.seconds * 1000),
        }
      ).catch((error) => {
        console.error("Error writing document: ", error);
      });

      await deleteDoc(doc(db, "apps", "24-stunden-lauf", "laps", lapDoc.id));
    });

    // Move all runners to archive
    const runnersSnapshot = await getDocs(
      collection(db, "apps", "24-stunden-lauf", "runners")
    );
    runnersSnapshot.forEach(async (runnerDoc) => {
      const runner = runnerDoc.data() as Runner;

      await setDoc(
        doc(
          db,
          "apps",
          "24-stunden-lauf",
          "archive",
          newArchive.id,
          "runners",
          runnerDoc.id
        ),
        runner
      );

      await deleteDoc(
        doc(db, "apps", "24-stunden-lauf", "runners", runnerDoc.id)
      );
    });
  }

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
  }, [isLoggedIn]);

  if (!user || loading) {
    return <Loading />;
  }

  return (
    <>
      <Head title="24 Stunden Lauf" />
      <main className="main">
        {JSON.stringify(snapshot?.data())}
        <button
          onClick={async () =>
            await themedPromiseToast(addStudentsToRunners, {
              pending: "Füge Personal zu Läufern hinzu...",
              success: {
                render: (success) => {
                  return `${success.data} Läufer wurden erfolgreich hinzugefügt.`;
                },
              },
              error: {
                render: (error) => {
                  if (error instanceof Error) {
                    return error.message;
                  }
                  return "Unbekannter Fehler";
                },
              },
            })
          }
          className="btn btn-primary btn-sm"
          aria-label="Add students to runners"
        >
          Add students to runners
        </button>
        <button
          onClick={async () =>
            await themedPromiseToast(addStaffToRunners, {
              pending: "Füge Personal zu Läufern hinzu...",
              success: {
                render: (success) => {
                  return `${success.data} Läufer wurden erfolgreich hinzugefügt.`;
                },
              },
              error: {
                render: (error) => {
                  if (error instanceof Error) {
                    return error.message;
                  }
                  return "Unbekannter Fehler";
                },
              },
            })
          }
          className="btn btn-primary btn-sm"
          aria-label="Add staff to runners"
        >
          Add staff to runners
        </button>
        <button
          onClick={async () =>
            await themedPromiseToast(archive, {
              pending: "Archiviere Läufer...",
              success: "Läufer wurden erfolgreich archiviert.",
              error: {
                render: (error) => {
                  if (error instanceof Error) {
                    return error.message;
                  }
                  return "Unbekannter Fehler";
                },
              },
            })
          }
          className="btn btn-primary btn-sm"
          aria-label="Archive runners"
        >
          Archive runners
        </button>
      </main>
    </>
  );
}
