import PageLoader from "@/components/ui/PageLoader";

export default function Loading() {
  return (
    <PageLoader
      isVisible={true}
      message="Loading Analytics"
    />
  );
}