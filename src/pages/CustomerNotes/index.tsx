//notes page

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from '@/components/layout';
import { db } from '@/firebase'; // Adjust path as necessary
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { FilePenIcon, PlusIcon, TrashIcon } from 'lucide-react';
import Modal from '../../components/ui/Model'; // Import the modal component

interface Note {
  id: string;
  title: string;
  content: string;
  customerId: string;
  customerName: string;
  createdAt: string; // ISO timestamp
}

interface Customer {
  id: string;
  name: string;
}

export default function NoteManagement() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNote,setShowNote]=useState(false);

  // Filters
  const [filterTitle, setFilterTitle] = useState('');
  const [filterCustomerName, setFilterCustomerName] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customerCollection = collection(db, 'customers');
        const customerSnapshot = await getDocs(customerCollection);
        const customerList = customerSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setCustomers(customerList);
      } catch (error) {
        setFeedbackMessage("Failed to load customers.");
      }
    };
    
    fetchCustomers();
  }, []);
  
  const fetchNotes = async () => {
    try {
      const notesCollection = collection(db, 'customerNotes');
      let notesQuery = query(notesCollection);

      // Apply filters
      if (selectedCustomer) {
        notesQuery = query(notesQuery, where('customerId', '==', selectedCustomer));
        setShowNote(!showNote);
      }
      if (filterTitle) {
        notesQuery = query(notesQuery, where('title', '>=', filterTitle), where('title', '<=', filterTitle + '\uf8ff'));
      }
      if (filterCustomerName) {
        notesQuery = query(notesQuery, where('customerName', '==', filterCustomerName));
      }
      if (filterDate) {
        const startDate = new Date(filterDate).toISOString();
        const endDate = new Date(new Date(filterDate).setDate(new Date(filterDate).getDate() + 1)).toISOString();
        notesQuery = query(notesQuery, where('createdAt', '>=', startDate), where('createdAt', '<', endDate));
      }
      
      const notesSnapshot = await getDocs(notesQuery);
      const notesList = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotes(notesList as Note[]);
    } catch (error) {
      setFeedbackMessage("Failed to load notes.");
    }
  };

  // Fetch notes based on filters
  useEffect(() => {
    fetchNotes();
  }, [selectedCustomer, filterTitle, filterCustomerName, filterDate]);

  // Add new note
  const handleAddNote = async () => {
    if (selectedCustomer && newNoteTitle && newNoteContent) {
      try {
        const notesCollection = collection(db, 'customerNotes');
        await addDoc(notesCollection, {
          title: newNoteTitle,
          content: newNoteContent,
          customerId: selectedCustomer,
          customerName: customers.find(c => c.id === selectedCustomer)?.name || '',  // Add customer name
          createdAt: new Date().toISOString()  // Add creation date
        });
        setNewNoteTitle('');
        setNewNoteContent('');
        setFeedbackMessage("Note added successfully.");
        fetchNotes();
      } catch (error) {
        setFeedbackMessage("Failed to add note.");
      }
    } else {
      setFeedbackMessage("Please fill in all fields.");
    }
  };

  // Update note
  const handleUpdateNote = async (id: string, updatedContent: string) => {
    try {
      const noteDoc = doc(db, 'customerNotes', id);
      await updateDoc(noteDoc, { content: updatedContent });
      setFeedbackMessage("Note updated successfully.");
      fetchNotes();
    } catch (error) {
      setFeedbackMessage("Failed to update note.");
    }
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    try {
      const noteDoc = doc(db, 'customerNotes', id);
      await deleteDoc(noteDoc);
      setNotes(notes.filter(note => note.id !== id));
      setFeedbackMessage("Note deleted successfully.");
      fetchNotes();
    } catch (error) {
      setFeedbackMessage("Failed to delete note.");
    }
  };

  // Open modal with note details
  const openModal = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto py-8 px-4 md:px-6 flex flex-col gap-4">
        {/* Main Content */}
        <main className="flex-1 lg:w-full overflow-hidden">
          <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Customer Notes</h1>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mt-4 lg:mt-0">
              <div className="relative w-full max-w-md">
                <select
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-md bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>
              <div className="relative w-full max-w-md">
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  placeholder="Filter by date..."
                  className="pl-10 pr-4 py-2 rounded-md bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </header>
          {feedbackMessage && (
            <div className="mb-4 p-4 rounded-md bg-blue-100 text-blue-800">
              {feedbackMessage}
            </div>
          )}
          <div className="mt-8">
            <Input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Note Title"
              className="mb-4 bg-gray-100"
            />
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Note Content"
              className="w-full h-32 mb-4 p-2 border border-gray-300 rounded-md"
            />
            <Button onClick={handleAddNote} className="bg-blue-500 text-white">
              Add Note
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
  {notes.map((note) => (
    <Card
      key={note.id}
      className="cursor-pointer p-4 border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
      onClick={() => openModal(note)}
    >
      <h3 className="text-xl font-semibold mb-3 text-gray-900">{note.title}</h3>
      <p className="text-gray-800 mb-3">{note.content.substring(0, 150)}...</p>
      <p className="text-gray-600 text-sm mb-4">
        Created at: {new Date(note.createdAt).toLocaleDateString()}
      </p>
      <div className="flex justify-between items-center">
        <Button
          className="bg-green-600 text-white hover:bg-green-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event
            handleUpdateNote(note.id, note.content);
          }}
        >
          <FilePenIcon className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          className="bg-red-600 text-white hover:bg-red-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event
            handleDeleteNote(note.id);
          }}
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </Card>
  ))}
</div>
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            title={selectedNote?.title || ''}
            content={selectedNote?.content || ''}
            createdAt={selectedNote?.createdAt || ''} customerName={selectedNote?.customerName || ''}          />
        </main>
      </div>
    </Layout>
  );
}
