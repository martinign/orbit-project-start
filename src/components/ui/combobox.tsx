
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  allowCustomValue?: boolean
  isLoading?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  emptyMessage = "No options found.",
  className,
  allowCustomValue = false,
  isLoading = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value || "")

  // Ensure options is always an array, even if it's undefined
  const safeOptions = options || []

  // Find the option that matches the current value
  const selectedOption = safeOptions.find(option => option.value === value)

  // Update the input value when the value prop changes
  React.useEffect(() => {
    if (value) {
      setInputValue(selectedOption?.label || value)
    } else {
      setInputValue("")
    }
  }, [value, selectedOption])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    if (allowCustomValue) {
      onChange(newValue)
    }
  }

  const handleSelect = (currentValue: string) => {
    const option = safeOptions.find(option => option.value === currentValue)
    
    if (option) {
      onChange(currentValue)
      setInputValue(option.label)
    } else if (allowCustomValue && inputValue) {
      onChange(inputValue)
    }
    
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="text-muted-foreground">Loading options...</span>
          ) : (
            <span className="truncate">{inputValue || placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder={placeholder} 
            value={inputValue}
            onValueChange={setInputValue}
            onInput={handleInputChange}
            className="h-9"
          />
          <CommandEmpty>
            {isLoading 
              ? "Loading options..."
              : allowCustomValue 
                ? "No matching option. Press enter to use this value." 
                : emptyMessage}
          </CommandEmpty>
          <CommandGroup>
            {isLoading ? (
              <CommandItem disabled value="loading">
                Loading options...
              </CommandItem>
            ) : (
              safeOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
