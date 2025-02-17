import NewResourceForm from "./NewResourceForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewResourcePage({ params }: PageProps) {
  const { id } = await params;
  return <NewResourceForm projectId={id} />;
}
