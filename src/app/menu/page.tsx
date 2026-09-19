import { redirect } from "next/navigation";

export default async function Page({ searchParams }: { searchParams: Promise<{ tableId?: string }> }) {
  const { tableId } = await searchParams;
  
  // If no tableId, we can't show the menu correctly. 
  // For now, assume it's required.
  if (!tableId) {
    return <div>Invalid QR Code. Please scan again.</div>;
  }

  // Redirect to loading page, passing the tableId through
  redirect(`/menu/loading?tableId=${tableId}`);
}
