'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProjectStatus } from "../_lib/enums";

export default function ProjectsTabs({
  children,
}: {
  children: React.ReactNode;
}) {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get("status") as ProjectStatus) || ProjectStatus.ACTIVE;

  const [tabValue, setTabValue] = useState<ProjectStatus>(initialStatus);

  const handleTabChange = (value: ProjectStatus) => {
    setTabValue(value);
    // Update the URL while preserving query and page
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value);
    replace(`?${params.toString()}`);
  };

  return (
    <Tabs value={tabValue}
      onValueChange={(value: string) => handleTabChange(value as ProjectStatus)}
      className="w-full">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
      </TabsList>

      <TabsContent value="active">
        {children}
      </TabsContent>
      <TabsContent value="archived">
        {children}
      </TabsContent>
    </Tabs>
  );
}
