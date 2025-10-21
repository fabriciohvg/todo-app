import { getData } from "@/actions/todoAction";
import Todos from "@/components/todos";

// Disable caching for this page - always fetch fresh data
export const dynamic = 'force-dynamic';
// Alternative: export const revalidate = 0;

export default async function Home() {
  const result = await getData();

  // Handle error case
  if (!result.success) {
    return (
      <main className="flex mx-auto max-w-xl w-full min-h-screen flex-col items-center p-16">
        <div className="text-5xl font-medium">To-do app</div>
        <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-bold">Error loading todos</p>
          <p>{result.error}</p>
        </div>
      </main>
    );
  }

  return <Todos todos={result.data} />;
}
