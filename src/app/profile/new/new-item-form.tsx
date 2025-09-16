"use client" //(Directive)Because this is a client component bunch of validation front-end which means javaScript needs to run in browser

import ItemForm from '@/components/item-form'
import { useAuth } from '@/context/auth'
import {itemSchema} from '@/validation/itemSchema'
import { createItem } from './actions'
import { saveItemImages } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ref, uploadBytesResumable, UploadTask } from 'firebase/storage'
import { storage } from '@/firebase/client'
import z from 'zod'
import { Breadcrumbs } from '@/components/ui/breadcrumb'
import { useState } from 'react'
import { Item } from '@/types/item'

export default function NewItemForm(){
    const [items, setItems] = useState<Item>();
    const auth = useAuth();
    const router = useRouter();

    const handleSubmit = async (data: z.infer<typeof itemSchema>) => {
        const token = await auth?.currentUser?.getIdToken();

        if(!token){
            return;
        }
        const {images, ...rest} = data;

        //const response = await createItem(rest, token);

        // Call API POST method to create item
        const response = await fetch('/api/items/create', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
        },
            body: JSON.stringify({ rest })
        });

        // Get JSON response
        const itemsData = await response.json();

        if (!response.ok) {
          console.error("Failed to fetch items:", itemsData.message);
          toast.error("Error!", {
                description: itemsData.message || "Failed to fetch items." // response.error
            });
            return;
        } else {
          console.log("Fetched items:", itemsData.items);
          setItems(itemsData.items || []);
        }

        // if(!!response. || !response.itemId){
        //     toast.error("Error!", {
        //         description: response.error // response.itemId
        //     });
        //     return;
        // }

        const uploadTasks: UploadTask[] = [];
        const paths: string[] = [];
        images.forEach((image, index) => {
            if(image.file){
                const path = `items/${itemsData.itemId}/${Date.now()}-${index}-${image.file.name}`; //Maby not response.itemId
                paths.push(path);
                const storageRef = ref(storage, path);
                uploadTasks.push(uploadBytesResumable(storageRef, image.file));
            }
        });

        await Promise.all(uploadTasks);
        await saveItemImages({itemId: itemsData.itemId, images: paths}, token) //Maby not response.itemId

        toast.success("Success!", {
            description: "Item created successfully"
        });

        router.push("/profile/user");
    }
    return (
        <div className="flex flex-col justify-center items-center p-4">
            <Breadcrumbs
                className="text-2xl pb-2"
                items={[
                    
                    { href: "/profile/user", label: "Profile" },
                    { label: "New item" }, // current page, no href
                ]}
            />
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
                <ItemForm 
                    handleSubmit={handleSubmit} 
                    submitButtonLabel={
                    <>
                        Add Item Listing
                    </>
                    } 
                />
            </div>
        </div>
    );
}