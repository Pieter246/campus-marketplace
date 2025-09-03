export default function Layout({children}: {
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-screen-sm mx-auto p-5">{children}</div> /*max-w-screen-sm limits width to small size mx-auto centers p-5 adds padding all around*/
    )
}