import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Link from "next/link";


interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  ctaText?: string;
  ctaLink?: string;
  ctaAction?: () => void;
}

export function EmptyState({ title, description, icon, ctaText, ctaLink, ctaAction }: EmptyStateProps) {
  return (
    <Empty className="border border-dashed mt-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {icon}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {ctaText && (
          <>
            {ctaLink ? (
              <Link
                href={ctaLink}
                className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {ctaText}
              </Link>
            ) : ctaAction ? (
              <Button
                onClick={ctaAction}
                className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {ctaText}
              </Button>
            ) : null}
          </>
        )}
      </EmptyContent>
    </Empty>
  );
}