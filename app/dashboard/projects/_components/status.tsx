import clsx from 'clsx';
import { ProjectStatus } from '../_lib/enums';

export default function Status({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center w-fit rounded-sm px-2 py-1 text-sm font-medium',
        {
          'bg-gray-100 text-gray-500': status === ProjectStatus.ARCHIVED,
          'bg-blue-400 text-white': status === ProjectStatus.ACTIVE,
        },
      )}
    >
      {status === ProjectStatus.ACTIVE ? (
        <>
          Active
        </>
      ) : null}
      {status === ProjectStatus.ARCHIVED ? (
        <>
          Archived
        </>
      ) : null}
    </span>
  );
}
