import dbConnect from "@/lib/dbConnect";

export default async function Home() {
  let dbStatus = "Connecting...";

  try {
    // Attempt to connect to the database directly from the server component
    await dbConnect();
    dbStatus = "✅ Successfully connected to MongoDB!";
  } catch (error) {
    dbStatus = "❌ Failed to connect to MongoDB.";
    console.error(error);
  }

  return (
    <main className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-4">E-Commerce Application</h1>
      <div className="p-4 rounded-md border border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">System Status:</h2>
        <p className="text-gray-700">{dbStatus}</p>
      </div>
    </main>
  );
}