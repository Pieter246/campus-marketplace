/*
export default function imageUrlFormatter(imagePath: string){
    return `${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_ACCESS}${encodeURIComponent(
        imagePath
    )}?alt=media`
}
*/


export default function imageUrlFormatter(imagePath: string){
    return `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(imagePath)}?alt=media`;
}