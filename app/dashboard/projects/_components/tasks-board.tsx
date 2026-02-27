'use client';

import { EmptyState } from "@/app/ui/shared/empty-state";
import { Task } from "../_lib/types";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import CreateTaskModal from "./create-task-modal";
import Search from "@/app/ui/shared/search";
import { CreateTask } from "./buttons";
import { TaskStatus } from "../_lib/enums";
import { MemberField } from "../../members/_lib/types";
import TasksColumn from "./tasks-column";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  UniqueIdentifier,
  DragOverEvent,
  DragEndEvent,
  rectIntersection
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { TaskCard } from "./task-card";
import { ConfirmationDialog } from "@/app/ui/shared/confirmation-dialog";
import { deleteTask } from "@/app/lib/actions/task-actions";
import { toast } from "sonner";

const columns = [
  { status: TaskStatus.TODO, title: "To Do" },
  { status: TaskStatus.IN_PROGRESS, title: "In Progress" },
  { status: TaskStatus.DONE, title: "Done" },
];

const customCollisionStrategy = (args: any) => {
  const collisions = closestCorners(args);
  if (collisions.length === 0) {
    return rectIntersection(args);
  }
  return collisions;
};

export default function TasksBoard({
  projectId,
  tasksByStatus: initialTasksByStatus,
  members,
}: {
  projectId: string;
  tasksByStatus: Record<'todo' | 'in-progress' | 'done', Task[]>;
  members: MemberField[];
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [tasksByStatus, setTasksByStatus] = useState<Record<string, Task[]>>(initialTasksByStatus);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null); 
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 7,
      },
    })
  );

  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return Object.values(tasksByStatus).flat().find((t) => t.id === activeId);
  }, [activeId, tasksByStatus]);

  if (!isMounted) {
    return <div className="flex-auto flex gap-4 w-full h-[500px] bg-gray-50/50 animate-pulse" />;
  }

  const hasTasks = Object.values(tasksByStatus || {}).some(arr => arr.length > 0);

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
  };

  const confirmDelete = (task: Task) => {
    setTaskToDelete(task);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    const status = taskToDelete.status;
    setTasksByStatus((prev) => ({
      ...prev,
      [status]: prev[status].filter((t) => t.id !== taskToDelete.id),
    }));
    setTaskToDelete(null);

    try {
      await deleteTask(taskToDelete.id, projectId);
      toast.success("Task was successfully deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const findContainer = (id: UniqueIdentifier) => {
    if (id in tasksByStatus) return id;
    return Object.keys(tasksByStatus).find((key) => 
      tasksByStatus[key].some((task) => task.id === id)
    );
  };

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    
    if (!over) return;

    const { id } = active;
    const { id: overId } = over;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setTasksByStatus((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      const activeIndex = activeItems.findIndex((task) => task.id === id);
      const overIndex = overItems.findIndex((task) => task.id === overId);

      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length;
      } else {
        newIndex = overIndex >= 0 ? overIndex : overItems.length;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item.id !== id),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          activeItems[activeIndex],
          ...prev[overContainer].slice(newIndex),
        ],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const { id } = active;
    const { id: overId } = over;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer !== overContainer) {
      return;
    }

    const activeIndex = tasksByStatus[activeContainer].findIndex((task) => task.id === active.id);
    const overIndex = tasksByStatus[overContainer].findIndex((task) => task.id === overId);

    if (activeIndex !== overIndex) {
      setTasksByStatus((items) => ({
        ...items,
        [overContainer]: arrayMove(
          items[overContainer],
          activeIndex,
          overIndex
        ),
      }));
    }

    setActiveId(null);
  }
      
  return (
    <>
      {!hasTasks ? (
        <EmptyState
          title="No tasks found"
          description="Looks like you haven't added any task to this project yet."
          icon={<ClipboardDocumentListIcon />}
          ctaText="Create Task"
          ctaAction={() => setIsCreateTaskOpen(true)}
        />
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between gap-2 md:mt-6">
            <Search placeholder="Search tasks..." />
            <CreateTask onModalOpen={() => setIsCreateTaskOpen(true)} />
          </div>

          <div className="flex-auto flex gap-4 w-full overflow-x-auto overflow-y-hidden">
            <DndContext id="tasks-board"
              sensors={sensors}
              collisionDetection={closestCorners}
              modifiers={[restrictToWindowEdges]}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {columns.map((col) => {
                const columnTasks = tasksByStatus[col.status as keyof typeof tasksByStatus] || [];
                return (
                  <TasksColumn
                    key={col.status}
                    columnStatus={col.status}
                    columnTitle={col.title}
                    tasks={columnTasks}
                    onEdit={handleEdit}
                    onDeleteConfirm={confirmDelete}
                  />
                );
              })}
              <DragOverlay>
                {activeTask ? (
                  <div className="shadow-xl ring-1 ring-black/5 rounded-lg rotate-2 cursor-grabbing">
                    <TaskCard 
                      task={activeTask} 
                      showActions={false}
                      onEdit={() => {}} 
                      onDeleteConfirm={() => {}} 
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </>
      )}

      <CreateTaskModal
        projectId={projectId}
        members={members}
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
      />

      <ConfirmationDialog
        isOpen={!!taskToDelete}
        title="Are you absolutely sure?"
        description={`This action cannot be undone. This will permanently delete the task ${taskToDelete?.title}.`}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
      />
    </>
  );
}