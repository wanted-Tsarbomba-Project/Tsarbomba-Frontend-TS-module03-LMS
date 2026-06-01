import ErrorPageView from "@/components/common/ErrorPageView";

interface ErrorPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams;

  return (
    <ErrorPageView
      code={getParam(params.code)}
      message={getParam(params.message)}
      path={getParam(params.path)}
      returnTo={getParam(params.returnTo)}
      status={Number(getParam(params.status) ?? 500)}
      timestamp={getParam(params.timestamp)}
    />
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
