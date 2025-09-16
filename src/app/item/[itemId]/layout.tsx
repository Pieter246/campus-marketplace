export default function Layout({children}: {
    children: React.ReactNode;
}){
    return (
        <div className="max-w-screen-lg mx-auto px-4 py-0">{children}</div>
    )
}