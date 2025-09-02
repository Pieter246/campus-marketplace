export const getItems = async () => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const response = await fetch(`${baseUrl}/api/items?category=books&search=laptop&limit=10&status=available`);
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("API did not return JSON. Check your API route and server.");
        }
        const data = await response.json();

        if (data.success) {
            return (data.items)
        } else {
            throw new Error(data.message || "Failed to fetch items")
        }
    } catch (error) {
        console.error("Fetch items error:", error instanceof Error ? error.message : String(error))
    }
}