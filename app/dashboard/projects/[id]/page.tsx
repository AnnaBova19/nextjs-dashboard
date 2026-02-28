import { lusitana } from '@/app/ui/fonts';
import notFound from './not-found';
import { getProjectById } from '@/app/lib/actions/project-actions';
import Status from '../_components/status';
import ProjectPageButtons from '../_components/project-page-buttons';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import TasksBoard from '../_components/tasks-board';
import { fetchProjectTasksCount, fetchProjectTasksGrouped } from '@/app/lib/actions/task-actions';
import clsx from 'clsx';
import { fetchMembers } from '@/app/lib/data';
import { Metadata } from 'next';
import Search from '@/app/ui/shared/search';
import { CreateTask } from '../_components/buttons';

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

export default async function Page(props: {
  params: Promise<{ id: string }>,
  searchParams?: Promise<{
    query?: string;
  }>;
}) {
  const params = await props.params;
  const id = params.id;

  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';

  const [project, tasksByStatus, tasksCount, members] = await Promise.all([
    getProjectById(id),
    fetchProjectTasksGrouped(id, query),
    fetchProjectTasksCount(id),
    fetchMembers(),
  ]);
  if (!project) {
    notFound();
  }

  return (
    <div className={clsx(
        'flex flex-col gap-4 w-full',
        tasksCount > 0 && 'h-full'
      )}>
      <Link
        href='/dashboard/projects'
        className='text-sm text-gray-500'>
        <div className='flex items-center gap-2'>
          <ChevronLeftIcon className="w-4" />
          Back to Projects
        </div>
      </Link>

      <div className="flex w-full justify-between gap-3">
        <div className='flex flex-col md:flex-row gap-3'>
          <Status status={project.status}/>
          <h1 className={`${lusitana.className} text-2xl`}>{project.name}</h1>
        </div>
        <ProjectPageButtons project={project}/>
      </div>
      <div>{project.description}</div>

      {tasksCount > 0 && (
        <div className="flex items-center justify-between gap-2 mt-4">
          <Search placeholder="Search tasks..." />
          <CreateTask projectId={id} members={members} />
        </div>
      )}

      <TasksBoard
        key={JSON.stringify(tasksByStatus)}
        hasTasks={tasksCount > 0}
        projectId={id}
        tasksByStatus={tasksByStatus}
        members={members}/>
    </div>
  );
}