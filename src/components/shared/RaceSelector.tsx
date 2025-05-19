import React from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RaceSelectorItem {
  id: string;
  name: string;
}

interface RaceSelectorProps {
  selectedValue: RaceSelectorItem | undefined;
  onSelectValue: (value: string | null) => void; // value is the id of the selected item
  placeholder: string;
  items: RaceSelectorItem[];
  disabled?: boolean;
}

const RaceSelector: React.FC<RaceSelectorProps> = ({
  selectedValue,
  onSelectValue,
  placeholder,
  items,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-sm md:text-base bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          disabled={disabled || items.length === 0}
        >
          <span className="truncate block flex-1 text-left">
            {selectedValue ? selectedValue.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="min-w-[var(--radix-popover-trigger-width)] w-[420px] max-h-[--radix-popover-content-available-height] p-0 bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search race..." className="border-gray-300 text-gray-900 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400" />
          <CommandList>
            <CommandEmpty className="text-gray-600 dark:text-gray-400">No race found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name} 
                  onSelect={() => {
                    onSelectValue(item.id);
                    setOpen(false);
                  }}
                  className="text-gray-800 hover:bg-gray-100 data-[selected='true']:bg-blue-100 data-[selected=true]:text-blue-700 dark:text-gray-200 dark:hover:bg-gray-700 dark:data-[selected='true']:bg-blue-700 dark:data-[selected=true]:text-blue-100"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValue?.id === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default RaceSelector;
