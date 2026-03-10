import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { MemberField } from "../../members/_lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import clsx from "clsx";
import { UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from 'next/image';

export default function AssigneeAutocomplete({
  label,
  value,
  members,
  error,
  onChange,
}: {
  label?: string;
  value: string | null | undefined;
  members: MemberField[];
  error?: string;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedMember = members.find((m) => m.id === (value ?? null));

  return (
    <Field data-invalid={!!error}>
      {label && <FieldLabel htmlFor="assignee-autocomplete">Assignee</FieldLabel>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button tabIndex={-1}
            variant={!!label ? 'outline' : 'ghost'}
            className={clsx(
              'justify-between px-3',
              error && 'border-red-500',
              !label && ' border border-transparent hover:border-input data-[state=open]:border-input group'
            )}
          >
            {selectedMember ? (
              <div className="flex items-center gap-2">
                <Image
                  src={selectedMember.image_url}
                  alt={`${selectedMember.first_name} ${selectedMember.last_name}`}
                  width={20}
                  height={20}
                  className="rounded-full object-cover"
                  style={{ width: '20px', height: '20px', minWidth: '20px' }}
                />
                <span>{selectedMember.first_name} {selectedMember.last_name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center w-[20px] h-[20px] rounded-full bg-blue-100/50">
                  <UserIcon className="w-4 text-blue-500" />
                </div>
                <span>Unassigned</span>
              </div>
            )}
            {selectedMember ? (
              <span
                role="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(null);
                }}
                className={clsx(
                  'ml-2 h-4 w-4 opacity-50 hover:opacity-100',
                  !label && 'invisible group-hover:visible data-[state=open]:visible'
                )}
              >
                <XMarkIcon className="h-4 w-4" />
              </span>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          side="bottom"
          sideOffset={4}
          style={{ width: 'var(--radix-popover-trigger-width)' }}
        >
          <Command
            filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1
            return 0
          }}>
            <CommandInput placeholder="Search assignee..."
              className="focus:ring-0 focus:outline-none border-none"/>
            <CommandEmpty>No assignee found.</CommandEmpty>
            <CommandGroup
              style={{ maxHeight: '208px', overflowY: 'auto', display: 'block' }}
              onWheel={(e) => {
                e.stopPropagation();
                e.currentTarget.scrollTop += e.deltaY;
              }}
              onTouchMove={(e) => {
                e.stopPropagation();
              }}
            >
              {members.map((member) => (
                <CommandItem
                  key={member.id}
                  value={`${member.first_name} ${member.last_name}`}
                  onSelect={() => {
                    onChange(member.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={member.image_url}
                      alt={`${member.first_name} ${member.last_name}'s profile picture`}
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                      style={{ width: '28px', height: '28px', minWidth: '28px' }}
                    />
                    <p>{member.first_name} {member.last_name}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <FieldError errors={[{ message: error }]} />}
    </Field>
  )
}