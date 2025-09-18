export default function Layout({children}: {
    children: React.ReactNode;
}){
    return (
        <div className="max-w-screen-lg mx-auto px-4 pb-10">{children}</div>
    )
}