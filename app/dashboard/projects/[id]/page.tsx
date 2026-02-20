import { lusitana } from '@/app/ui/fonts';
import notFound from './not-found';
import { fetchProjectById } from '@/app/lib/actions/project-actions';
import Status from '../_components/status';
import ProjectPageButtons from '../_components/project-page-buttons';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const project = await fetchProjectById(id)
  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <Link
        href='/dashboard/projects'
        className='text-sm text-gray-500'>
        <div className='flex items-center gap-2'>
          <ChevronLeftIcon className="w-4" />
          Back to Projects
        </div>
      </Link>
      <div className="flex w-full justify-between items-center">
        <h1 className={`${lusitana.className} text-2xl`}>{project.name}</h1>
        <ProjectPageButtons project={project}/>
      </div>
      <Status status={project.status}/>
      <div>{project.description}</div>
    </div>
  );
}