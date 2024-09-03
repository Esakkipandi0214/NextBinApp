import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';
import { db } from '@/firebase'; // Adjust path as necessary
import { collection, addDoc } from 'firebase/firestore';

export default function Component() {
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [notes, setNotes] = useState('');
  const [Message,showMessage]=useState({
    title: "",
    description: "",
    style: "",
  })
  const [displayMsg, setdisplayMsg] = useState(false);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create a reference to the GuestCustomers collection
      const guestCustomerRef = collection(db, 'GuestCustomers');
      
      // Add a new document with the form data
      await addDoc(guestCustomerRef, {
        name,
        contactNumber,
        companyName,
        notes,
        createdAt: new Date()
      });

      toast({
        title: "Guest Customer Added",
        description: "The guest customer has been successfully added.",
      });
      showMessage({
        title: "Success",
        description: "Guest Add....",
        style: "bg-green-400/30 border-green-500 "
      })
      setdisplayMsg(true)
      // Reset form fields
      setName('');
      setContactNumber('');
      setCompanyName('');
      setNotes('');
      
    } catch (error) {
      console.error("Error adding document: ", error);
      showMessage({
        title: "Error",
        description: "Fail to Guest...!",
        style: "bg-red-400/30 border-red-500"
      })
      setdisplayMsg(true)
      toast({
        title: "Error",
        description: "There was an error adding the guest customer. Please try again.",
        variant: "destructive"
      });
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Guest Customer</CardTitle>
        <CardDescription>Enter the details of the guest customer below.</CardDescription>
      </CardHeader>
      {displayMsg && <div className={`rounded-lg py-1 px-3 border-2 ${Message.style}  mx-3 mb-2`}>
        <h1 className=' text-sm font-bold text-black'>{Message.title}</h1>
        <p className=' text-base'>{Message.description}</p>
        </div>}
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              id="contactNumber"
              placeholder="+1 (555) 123-4567"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Acme Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full">Add Guest Customer</Button>
        </form>
      </CardContent>
    </Card>
  );
}
