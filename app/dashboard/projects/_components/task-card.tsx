import { Task } from "../_lib/types";

export function TaskCard({
  task,
}: {
  task: Task;
}) {
  return (
    <div className="flex flex-col gap-4 bg-white rounded-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg">
      <div className="flex justify-between items-center">
        <div className="text-sm font-semibold">
          {task.title}
        </div>
      </div>
    </div>
  );
}