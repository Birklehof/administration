import { useEffect, useState } from "react";
import { collection, query, getDocs, onSnapshot } from "@firebase/firestore";
import { db } from "@/lib/firebase";
import Staff from "@/lib/interfaces/staff";
import useAuth from "./useAuth";

export default function useStudents() {
  const { isLoggedIn, user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    syncStudents();
  }, [isLoggedIn, user]);

  async function syncStudents() {
    const q = query(collection(db, "/staff"));
    const querySnapshot = await getDocs(q);
    const new_staff: Staff[] = [];
    const staff = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const new_staff_member = { id: doc.id, ...data } as Staff;
      new_staff.push(new_staff_member);
    });
    setStaff(new_staff);

    onSnapshot(q, (querySnapshot) => {
      const new_staff: Staff[] = [];
      const staff = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const new_staff_member = { id: doc.id, ...data } as Staff;
        new_staff.push(new_staff_member);
      });
      setStaff(new_staff);
    });
  }

  return { staff };
}
