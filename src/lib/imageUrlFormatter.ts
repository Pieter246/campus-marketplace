export default function imageUrlFormatter(imagePath: string){
    return `${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_ACCESS}${encodeURIComponent(
        imagePath
    )}?alt=media`
}