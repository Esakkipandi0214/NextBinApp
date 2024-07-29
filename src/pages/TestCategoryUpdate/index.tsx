import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase"; // Make sure to import your Firebase configuration
import Layout from '@/components/layout';

const Component: React.FC = () => {
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [orderCategories, setOrderCategories] = useState<{ id: string; mainCategory: string; subCategory: string[] }[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subCategoryArray = subCategory.split(",").map(sub => sub.trim()).filter(sub => sub !== "");

    try {
      if (editMode && editId) {
        // Update existing category
        const docRef = doc(db, "OrderCategory", editId);
        const existingSubCategories = (orderCategories.find(cat => cat.id === editId)?.subCategory || []);
        const updatedSubCategories = [
          ...new Set([...existingSubCategories, ...subCategoryArray])
        ];
        await updateDoc(docRef, { subCategory: updatedSubCategories });
        setEditMode(false);
        setEditId(null);
      } else {
        // Add new category
        const q = query(collection(db, "OrderCategory"), where("mainCategory", "==", mainCategory));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          await addDoc(collection(db, "OrderCategory"), {
            mainCategory,
            subCategory: subCategoryArray
          });
        } else {
          querySnapshot.forEach(async (document) => {
            const docRef = doc(db, "OrderCategory", document.id);
            const existingSubCategories = document.data().subCategory || [];
            const updatedSubCategories = [
              ...new Set([...existingSubCategories, ...subCategoryArray])
            ];
            await updateDoc(docRef, {
              subCategory: updatedSubCategories
            });
          });
        }
      }

      alert("Data saved successfully!");
      setMainCategory("");
      setSubCategory("");

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

  const handleEdit = (id: string, mainCategory: string, subCategory: string[]) => {
    setEditMode(true);
    setEditId(id);
    setMainCategory(mainCategory);
    setSubCategory(subCategory.join(", "));
  };

  return (
    <Layout>
      <Card className="w-full  py-6">
        <CardHeader>
          <CardTitle>{editMode ? "Edit Material Category" : "Update Material Category"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col">
                <Label htmlFor="category" className=" mb-3">Main Category</Label>
                <Input
                  id="category"
                  aria-label="Type main category"
                  placeholder="Enter main category"
                  value={mainCategory}
                  onChange={(e) => setMainCategory(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="subcategory" className=" mb-3">Subcategory</Label>
                <Input
                  id="subcategory"
                  aria-label="Type subcategory"
                  placeholder="Enter subcategories (comma-separated)"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  required
                />
              </div>
            </div>
            <CardFooter className="flex justify-end">
              <Button type="submit">{editMode ? "Update Changes" : "Save Changes"}</Button>
            </CardFooter>
          </form>

          {/* Table to display OrderCategory data */}
          <CardContent className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Order Categories</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Main Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategories</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{category.mainCategory}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{category.subCategory.join(", ")}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <Button onClick={() => handleEdit(category.id, category.mainCategory, category.subCategory)}>Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Component;
