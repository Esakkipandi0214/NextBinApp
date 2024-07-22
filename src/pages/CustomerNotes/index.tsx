import { useState, useEffect, ChangeEvent } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Layout from '@/components/layout';
import { db } from '../../firebase'; // Adjust import path as needed
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc, query, where } from "firebase/firestore";
import { PhoneIcon, MapIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'; // Importing icons from Heroicons
import { v4 as uuidv4 } from 'uuid';

// Define types
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  customerId: string;
}

interface Customer {
  id: string;
  address: string;
  created: string;
  dob: string;
  email: string;
  firstName: string;
  frequency: string;
  lastName: string;
  license: string;
  phone: string;
  postcode: string;
  registration: string;
}

export default function NotesManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch customers from Firestore
  const fetchCustomers = async () => {
    try {
      const customersCollection = collection(db, "customers");
      const customersSnapshot = await getDocs(customersCollection);
      const customersList = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      setCustomers(customersList);
    } catch (error) {
      console.error("Error fetching customers: ", error);
      setError("Failed to fetch customers.");
    }
  };

  // Fetch notes for selected customer from Firestore
  const fetchNotes = async (customerId: string) => {
    try {
      const notesCollection = collection(db, "customerNotes");
      const notesQuery = query(notesCollection, where("customerId", "==", customerId));
      const notesSnapshot = await getDocs(notesQuery);
      const notesList = notesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      setNotes(notesList);
    } catch (error) {
      console.error("Error fetching notes: ", error);
      setError("Failed to fetch notes.");
    }
  };

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch notes when selectedCustomer changes
  useEffect(() => {
    if (selectedCustomer) {
      fetchNotes(selectedCustomer.id);
    } else {
      setNotes([]);
      setCurrentNote(null);
      setNoteContent("");
    }
  }, [selectedCustomer]);

  // Update selected note and its content
  useEffect(() => {
    if (currentNote) {
      setNoteContent(currentNote.content);
    } else {
      setNoteContent("");
    }
  }, [currentNote]);

  // Handle note content change
  const handleNoteChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value);
  };

  // Update notes in Firestore
  const updateNote = async (noteId: string, updatedContent: string) => {
    try {
      const noteRef = doc(db, "customerNotes", noteId);
      await updateDoc(noteRef, { content: updatedContent });
      fetchNotes(selectedCustomer!.id);
      setSuccessMessage("Note saved successfully.");
      setError(null);
    } catch (error) {
      console.error("Error updating note: ", error);
      setError("Failed to update note. " + error.message);
      setSuccessMessage(null);
    }
  };

  // Save the current note
  const handleNoteSave = async () => {
    if (currentNote) {
      try {
        if (!currentNote.id) {
          // New note, add it to Firestore
          const newDocRef = await addDoc(collection(db, "customerNotes"), {
            ...currentNote,
            content: noteContent,
          });
          setCurrentNote({ ...currentNote, id: newDocRef.id });
        } else {
          // Existing note, update it in Firestore
          await updateNote(currentNote.id, noteContent);
        }
        setSuccessMessage("Note saved successfully.");
        setError(null);
        fetchNotes(selectedCustomer!.id);
      } catch (error) {
        console.error("Error saving note: ", error);
        setError("Failed to save note. " + error.message);
        setSuccessMessage(null);
      }
    }
  };

  // Add a new note (do not save to Firestore yet)
  const handleAddNote = () => {
    if (selectedCustomer) {
      const newNote: Note = {
        id: "", // Placeholder ID until saved to Firestore
        title: "New Note",
        content: "",
        createdAt: new Date().toISOString(),
        customerId: selectedCustomer.id,
      };
      setCurrentNote(newNote);
      setNoteContent("");
      setError(null);
      setSuccessMessage("New note created. Enter content and click Save to store it.");
    }
  };

  // Delete a note
  const handleDeleteNote = async (noteId: string) => {
    if (selectedCustomer) {
      try {
        await deleteDoc(doc(db, "customerNotes", noteId));
        fetchNotes(selectedCustomer.id);
        setCurrentNote(null);
        setNoteContent("");
        setError(null);
        setSuccessMessage("Note deleted successfully.");
      } catch (error) {
        console.error("Error deleting note: ", error);
        setError("Failed to delete note. " + error.message);
        setSuccessMessage(null);
      }
    }
  };

  // Change selected customer
  const handleCustomerChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    const customer = customers.find(c => c.id === customerId) || null;
    setSelectedCustomer(customer);
  };

  // Select a note to edit
  const handleNoteSelect = (note: Note) => {
    setCurrentNote(note);
  };

  return (
    <Layout>
      <div className="flex h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>{selectedCustomer ? selectedCustomer.firstName[0] : 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-base font-medium">{selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Select a Customer'}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedCustomer ? `${selectedCustomer.email} | ${selectedCustomer.phone}` : ''}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              <PhoneIcon className="h-4 w-4" />
              <span className="sr-only">Call</span>
            </Button>
            <Button variant="outline" size="sm">
              <MapIcon className="h-4 w-4" />
              <span className="sr-only">Email</span>
            </Button>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <aside className="border-r bg-background p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Select Customer</h3>
              <select
                onChange={handleCustomerChange}
                className="block w-full p-2 border rounded"
              >
                <option value="">-- Select a Customer --</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName}
                  </option>
                ))}
              </select>
              <div className="mt-4">
                <Button onClick={handleAddNote} variant="outline" size="sm">
                  <PlusIcon className="h-4 w-4" />
                  Add Note
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium">Notes</h3>
              {notes.length > 0 ? (
                <ul className="space-y-2">
                  {notes.map(note => (
                    <li key={note.id} className="flex justify-between items-center">
                      <Button
                        variant="link"
                        className="text-left"
                        onClick={() => handleNoteSelect(note)}
                      >
                        {note.title}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteNote(note.id)}>
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No notes available</p>
              )}
            </div>
          </aside>
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            {selectedCustomer && currentNote && (
              <>
                <h3 className="text-lg font-medium">Edit Note</h3>
                <Textarea
                  placeholder="Note content..."
                  value={noteContent}
                  onChange={handleNoteChange}
                  className="mt-2 w-full h-64"
                />
                <Button onClick={handleNoteSave} className="mt-2">
                  Save Note
                </Button>
                {successMessage && (
                  <p className="mt-2 text-green-600">{successMessage}</p>
                )}
                {error && (
                  <p className="mt-2 text-red-600">{error}</p>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
