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
import { PlusCircle } from 'lucide-react'
import z from 'zod'
import { Breadcrumbs } from '@/components/ui/breadcrumb'

export default function NewItemForm(){
    const auth = useAuth();
    const router = useRouter();

    const handleSubmit = async (data: z.infer<typeof itemSchema>) => {
        const token = await auth?.currentUser?.getIdToken();

        if(!token){
            return;
        }
        const {images, ...rest} = data;
        const response = await createItem(rest, token);

        if(!!response.error || !response.itemId){
            toast.error("Error!", {
                description: response.error
            });
            return;
        }

        const uploadTasks: UploadTask[] = [];
        const paths: string[] = [];
        images.forEach((image, index) => {
            if(image.file){
                const path = `items/${response.itemId}/${Date.now()}-${index}-${image.file.name}`;
                paths.push(path);
                const storageRef = ref(storage, path);
                uploadTasks.push(uploadBytesResumable(storageRef, image.file));
            }
        });

        await Promise.all(uploadTasks);
        await saveItemImages({itemId: response.itemId, images: paths}, token)

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