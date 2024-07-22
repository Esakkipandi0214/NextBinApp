import React, { useState, useEffect } from 'react';
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CustomerNoteProps {
  uid: string;
}

interface Note {
  content: string;
  createdAt: string; // ISO string
  customerId: string;
  customerName: string;
  title: string;
}

const CustomerNoteOrders: React.FC<CustomerNoteProps> = ({ uid }) => {
  const [latestNote, setLatestNote] = useState<Note | null>(null);

  useEffect(() => {
    const fetchLatestNote = async () => {
      try {
        const notesCollection = collection(db, "customerNotes");
        const notesQuery = query(
          notesCollection,
          where('customerId', '==', uid)
        );
        const notesSnapshot = await getDocs(notesQuery);

        if (!notesSnapshot.empty) {
          const doc = notesSnapshot.docs[0];
          const noteData = doc.data() as Note;
          setLatestNote(noteData);
        } else {
          setLatestNote(null);
        }
      } catch (error) {
        console.error("Error fetching customer notes: ", error);
      }
    };

    fetchLatestNote();
  }, [uid]);

  return (
    <Card className="w-full max-w-md mt-4">
      <CardHeader>
        <CardTitle>Customer Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {latestNote ? (
          <div>
            <h2 className="text-lg font-bold mb-2">Customer Name: {latestNote.customerName}</h2>
            <p className="text-sm text-gray-600">Most Recent Note:</p>
            <div className="p-4 border rounded bg-gray-100">
              <h3 className="font-semibold">{latestNote.title}</h3>
              <p>{latestNote.content}</p>
              <p className="text-sm text-gray-600 mt-2">
                Created at: {new Date(latestNote.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <p>No notes available for this customer.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerNoteOrders;
