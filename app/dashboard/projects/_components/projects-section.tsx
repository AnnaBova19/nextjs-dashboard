import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ProjectsSectionTabContent from "./projects-section-tab-content";

export default async function ProjectsSection({
  query,
  currentPage,
}: {
  query: string
  currentPage: number
}) {
  return (
    <div className="mt-6 flow-root">
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <ProjectsSectionTabContent query={query} currentPage={currentPage} status="active" />
        </TabsContent>
        <TabsContent value="archived">
          <ProjectsSectionTabContent query={query} currentPage={currentPage} status="archived" />
        </TabsContent>
      </Tabs>
    </div>
  );
}