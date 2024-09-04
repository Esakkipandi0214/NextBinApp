import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { db } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

interface AddEmployeeProps {
    showEmployeeModal: boolean;
    setShowEmployeeModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddEmployee: React.FC<AddEmployeeProps> = ({ showEmployeeModal, setShowEmployeeModal }) => {
    const handleCancelCreate = () => {
        setShowEmployeeModal(false);    
    };

    const countryCodes = [{ code: "+61", name: "Australia" }];

    const handleEmployePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const countryCode = (document.getElementById("countryCode") as HTMLSelectElement).value;
        const Number = event.target.value;

        // Concatenate country code with the contact number
        const contactNumber = `${countryCode} ${Number}`;
        console.log("Full Phone Number:", contactNumber);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const auth = getAuth();
        const firstName = (event.currentTarget.elements.namedItem("firstName") as HTMLInputElement).value;
        const lastName = (event.currentTarget.elements.namedItem("lastName") as HTMLInputElement).value;
        const email = (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
        const password = (event.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
        const contactNumber = `${(event.currentTarget.elements.namedItem("countryCode") as HTMLSelectElement).value} ${(event.currentTarget.elements.namedItem("primarycontactNumber") as HTMLInputElement).value}`;
        const factoryLocation = (event.currentTarget.elements.namedItem("factoryLocation") as HTMLInputElement).value;
        const address = (event.currentTarget.elements.namedItem("address") as HTMLInputElement).value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await addDoc(collection(db, "employee"), {
                firstName,
                lastName,
                name: `${firstName} ${lastName}`,
                contactNumber,
                created: new Date().toISOString(),
                factoryLocation,
                address,
                email,
                uid: user.uid,
            });

            toast.success("Employee created successfully!");
            setShowEmployeeModal(false);
        } catch (error) {
            const errorMessage = (error as Error).message;
            toast.error(`Error creating employee: ${errorMessage}`);
        }
    };

    return (
        <div> 
            {showEmployeeModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-2">
                    <div className="bg-white rounded-lg p-4 w-full max-w-lg max-h-screen overflow-auto">
                        <h2 className="text-2xl font-bold mb-4">Create New Employee</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                                        <Input id="firstName" name="firstName" type="text" placeholder="Enter first name" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                                        <Input id="lastName" name="lastName" type="text" placeholder="Enter last name" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="countryCode">Country Code <span className="text-red-500">*</span></Label>
                                        <select id="countryCode" name="countryCode" className="block w-full border border-gray-300 rounded-md py-2 px-3" required>
                                            {countryCodes.map((country) => (
                                                <option key={country.code} value={country.code}>
                                                    {country.name} ({country.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="primarycontactNumber">Contact Number <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="primarycontactNumber"
                                            name="primarycontactNumber"
                                            type="tel"
                                            placeholder="Enter phone number"
                                            required
                                            pattern="\d{10}"
                                            minLength={10}
                                            maxLength={10}
                                            title="Phone number must be exactly 10 digits"
                                            onChange={handleEmployePhoneNumberChange}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                                        <Input id="address" name="address" type="text" placeholder="Enter address" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="factoryLocation">Factory Location <span className="text-red-500">*</span></Label>
                                        <Input id="factoryLocation" name="factoryLocation" type="text" placeholder="Enter factory location" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                        <Input id="email" name="email" type="email" placeholder="Enter email address" required/>
                                    </div>
                                    <div>
                                        <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                                        <Input id="password" name="password" type="text" placeholder="Enter password" required />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 mt-4">
                                <Button type="submit" style={{ backgroundColor: "#00215E", color: "white" }}>
                                    Save
                                </Button>
                                <Button type="button" onClick={handleCancelCreate} className="bg-gray-300 text-black">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddEmployee;
