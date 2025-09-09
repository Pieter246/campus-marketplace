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

        router.push("/dashboard/user");
    }
    return <div>
        <ItemForm 
            handleSubmit={handleSubmit} 
            submitButtonLabel={
            <>
                <PlusCircle/> Create Item
            </>
        } 
    />
    </div>
}