import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addDoc, collection, query, where, getDocs, updateDoc, doc, arrayRemove } from "firebase/firestore";
import { db } from "@/firebase";
import Layout from '@/components/layout';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';
import { Dialog } from "@headlessui/react";

const Component: React.FC = () => {
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [orderCategories, setOrderCategories] = useState<{ id: string; mainCategory: string; subCategory: string[] }[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newSubCategory, setNewSubCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchOrderCategories = async () => {
      try {
        const q = query(collection(db, "OrderCategory"));
        const querySnapshot = await getDocs(q);
        const categories: { id: string; mainCategory: string; subCategory: string[] }[] = [];
        querySnapshot.forEach((doc) => {
          categories.push({
            id: doc.id,
            mainCategory: doc.data().mainCategory,
            subCategory: doc.data().subCategory || []
          });
        });
        setOrderCategories(categories);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchOrderCategories();
  }, []);

  const handleCategorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (editMode && editId) {
        // Update existing category
        const docRef = doc(db, "OrderCategory", editId);
        await updateDoc(docRef, { mainCategory });
        setEditMode(false);
        setEditId(null);
      } else {
        // Add new category
        const q = query(collection(db, "OrderCategory"), where("mainCategory", "==", mainCategory));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          await addDoc(collection(db, "OrderCategory"), { mainCategory, subCategory: [] });
        } else {
          querySnapshot.forEach(async (document) => {
            const docRef = doc(db, "OrderCategory", document.id);
            await updateDoc(docRef, { mainCategory });
          });
        }
      }

      alert("Category saved successfully!");
      setMainCategory("");

      // Refresh the list
      const updatedQuerySnapshot = await getDocs(query(collection(db, "OrderCategory")));
      const updatedCategories: { id: string; mainCategory: string; subCategory: string[] }[] = [];
      updatedQuerySnapshot.forEach((doc) => {
        updatedCategories.push({
          id: doc.id,
          mainCategory: doc.data().mainCategory,
          subCategory: doc.data().subCategory || []
        });
      });
      setOrderCategories(updatedCategories);

    } catch (error) {
      console.error("Error saving data: ", error);
      alert("Failed to save data!");
    }
  };

  const handleSubCategorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedCategory) {
      try {
        const subCategoryArray = newSubCategory.split(",").map(sub => sub.trim()).filter(sub => sub !== "");
        const docRef = doc(db, "OrderCategory", selectedCategory);
        const existingSubCategories = (orderCategories.find(cat => cat.id === selectedCategory)?.subCategory || []);
        const updatedSubCategories = [
          ...new Set([...existingSubCategories, ...subCategoryArray])
        ];
        await updateDoc(docRef, { subCategory: updatedSubCategories });

        alert("Subcategories updated successfully!");
        setNewSubCategory("");
        setIsModalOpen(false);

        // Refresh the list
        const updatedQuerySnapshot = await getDocs(query(collection(db, "OrderCategory")));
        const updatedCategories: { id: string; mainCategory: string; subCategory: string[] }[] = [];
        updatedQuerySnapshot.forEach((doc) => {
          updatedCategories.push({
            id: doc.id,
            mainCategory: doc.data().mainCategory,
            subCategory: doc.data().subCategory || []
          });
        });
        setOrderCategories(updatedCategories);

      } catch (error) {
        console.error("Error updating subcategories: ", error);
        alert("Failed to update subcategories!");
      }
    }
  };

  const handleDeleteSubCategory = async (categoryId: string, subCategoryToDelete: string) => {
    try {
      const docRef = doc(db, "OrderCategory", categoryId);
      await updateDoc(docRef, {
        subCategory: arrayRemove(subCategoryToDelete)
      });

      alert("Subcategory deleted successfully!");

      // Refresh the list
      const updatedQuerySnapshot = await getDocs(query(collection(db, "OrderCategory")));
      const updatedCategories: { id: string; mainCategory: string; subCategory: string[] }[] = [];
      updatedQuerySnapshot.forEach((doc) => {
        updatedCategories.push({
          id: doc.id,
          mainCategory: doc.data().mainCategory,
          subCategory: doc.data().subCategory || []
        });
      });
      setOrderCategories(updatedCategories);

    } catch (error) {
      console.error("Error deleting subcategory: ", error);
      alert("Failed to delete subcategory!");
    }
  };

  const handleEdit = (id: string, mainCategory: string, subCategory: string[]) => {
    setEditMode(true);
    setEditId(id);
    setMainCategory(mainCategory);
    setSelectedCategory(id);
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewSubCategory("");
  };

  return (
    <Layout>
      <Card className="w-full py-6">
        <CardHeader>
          <CardTitle>{editMode ? "Edit Main Category" : "Create Main Category"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="flex flex-col">
              <Label htmlFor="category" className="mb-3">Main Category</Label>
              <Input
                id="category"
                aria-label="Type main category"
                placeholder="Enter main category"
                value={mainCategory}
                onChange={(e) => setMainCategory(e.target.value)}
                required
              />
            </div>
            <CardFooter className="flex justify-end">
              <Button type="submit">{editMode ? "Update Category" : "Add Category"}</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {/* Modal for Subcategory Editing */}
      <Dialog open={isModalOpen} onClose={closeModal}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true"></div>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <CardHeader>
              <CardTitle>Edit Subcategories for Selected Category</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubCategorySubmit} className="space-y-4">
                <div className="flex flex-col">
                  <Label htmlFor="newSubCategory" className="mb-3">Add Subcategories</Label>
                  <Input
                    id="newSubCategory"
                    aria-label="Type subcategories"
                    placeholder="Enter subcategories (comma-separated)"
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    required
                  />
                </div>
                <CardFooter className="flex justify-end">
                  <Button type="submit">Add Subcategories</Button>
                </CardFooter>
              </form>
              <div className="mt-4">
  <h3 className="text-lg font-semibold">Existing Subcategories</h3>
  <div className="max-h-60 overflow-y-auto">
    <ul className="list-disc ml-5 space-y-2">
      {orderCategories.find(cat => cat.id === selectedCategory)?.subCategory.map(subCategory => (
        <li key={subCategory} className="flex justify-between items-center">
          {subCategory}
          <Button
            variant="destructive"
            onClick={() => handleDeleteSubCategory(selectedCategory!, subCategory)}
          >
            Delete
          </Button>
        </li>
      ))}
    </ul>
  </div>
</div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={closeModal}>Close</Button>
            </CardFooter>
          </div>
        </div>
      </Dialog>

      <Card className="mt-6 w-full">
        <CardHeader>
          <CardTitle>Categories Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Main Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategories</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderCategories.map(category => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.mainCategory}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.subCategory.length > 0 ? (
                        <ul className="list-disc ml-5">
                          {category.subCategory.map(sub => (
                            <li key={sub}>{sub}</li>
                          ))}
                        </ul>
                      ) : (
                        "No subcategories"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Button
                        onClick={() => handleEdit(category.id, category.mainCategory, category.subCategory)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Component;
