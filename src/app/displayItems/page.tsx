export default async function displayForm({
    searchParams
}: {
    searchParams: Promise<any>
}){
    //Get Firebase ID token
    //const idToken = await user.getIdToken();

    const searchParamsValues = await searchParams;

    // Get items test ////////////////////////////////////////////////////////////////
    try {
    const itemsResponse = await fetch("/api/items?limit=10&status=available", {
        method: "GET",
        // headers: {
        // "Authorization": `Bearer ${idToken}`,
        // },
    });

    const itemsData = await itemsResponse.json();

    if (!itemsResponse.ok) {
        console.error("Failed to fetch items:", itemsData.message);
    } else {
        console.log("Fetched items:", itemsData.items);
    }
    } catch (fetchError) {
    console.error("Error fetching items:", fetchError);
    }
}