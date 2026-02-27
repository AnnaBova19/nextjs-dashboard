import { lusitana } from '@/app/ui/fonts';
import notFound from './not-found';
import { getProjectById } from '@/app/lib/actions/project-actions';
import Status from '../_components/status';
import ProjectPageButtons from '../_components/project-page-buttons';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import TasksBoard from '../_components/tasks-board';
import { fetchProjectTasksByIdGrouped } from '@/app/lib/actions/task-actions';
import clsx from 'clsx';
import { fetchMembers } from '@/app/lib/data';
import { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;

  const project = await getProjectById(id);

  if (!project) {
    return { title: 'Project Not Found' };
  }

  return {
    title: `${project.name}`,
  };
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const [project, tasksByStatus, members] = await Promise.all([
    getProjectById(id),
    fetchProjectTasksByIdGrouped(id),
    fetchMembers(),
  ]);
  if (!project) {
    notFound();
  }

  const hasTasks = Object.values(tasksByStatus || {}).some(arr => arr.length > 0);

  return (
    <div className={clsx(
        'flex flex-col gap-4 w-full',
        hasTasks && 'h-full'
      )}>
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
      <TasksBoard
        key={JSON.stringify(tasksByStatus)}
        projectId={id}
        tasksByStatus={tasksByStatus}
        members={members}/>
    </div>
  );
}