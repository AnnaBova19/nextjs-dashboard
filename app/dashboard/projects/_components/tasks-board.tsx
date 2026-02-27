'use client';

import { EmptyState } from "@/app/ui/shared/empty-state";
import { Task } from "../_lib/types";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
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
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  UniqueIdentifier,
  DragOverEvent,
  DragEndEvent,
  rectIntersection
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

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
  const [tasksByStatus, setTasksByStatus] = useState<Record<string, Task[]>>(initialTasksByStatus);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  if (!isMounted) {
    return <div className="flex-auto flex gap-4 w-full h-[500px] bg-gray-50/50 animate-pulse" />;
  }

  const hasTasks = Object.values(tasksByStatus || {}).some(arr => arr.length > 0);

  function findContainer(id: any) {
    if (id in tasksByStatus) {
      return id;
    }

    return Object.keys(tasksByStatus).find((key) => {
      const statusKey = key as keyof typeof tasksByStatus;
      return tasksByStatus[statusKey].some((task) => task.id === id);
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const draggingRect = active.rect.current.translated;
    
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
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem =
          overIndex === overItems.length - 1 &&
          draggingRect &&
          over.rect &&
          draggingRect.top > over.rect.top + over.rect.height;

        const modifier = isBelowLastItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
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
          ctaAction={() => setIsModalOpen(true)}
        />
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between gap-2 md:mt-6">
            <Search placeholder="Search tasks..." />
            <CreateTask onModalOpen={() => setIsModalOpen(true)} />
          </div>

          <div className="flex-auto flex gap-4 w-full overflow-x-auto">
            <DndContext id="tasks-board"
              sensors={sensors}
              collisionDetection={customCollisionStrategy}
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
                  />
                );
              })}
              {/* <DragOverlay>
                {activeId ? (
                  <div></div>
                ) : null}
              </DragOverlay> */}
            </DndContext>
          </div>
        </>
      )}

      <CreateTaskModal
        projectId={projectId}
        members={members}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}