'use client'

import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "relative border-b border-cinereous/15 last:border-0 transition-all duration-300",
      "data-[state=open]:bg-gradient-to-r data-[state=open]:from-spanish-orange/[0.02] data-[state=open]:to-transparent",
      className
    )}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-6 pl-6 pr-4 text-left font-medium text-eerie-black/90",
        "transition-all duration-300 hover:text-spanish-orange",
        "[&[data-state=open]>svg]:rotate-180",
        "[&[data-state=open]]:text-spanish-orange [&[data-state=open]]:font-semibold",
        "text-[0.9375rem] leading-relaxed tracking-[-0.01em]",
        "relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5",
        "before:bg-spanish-orange/0 before:transition-all before:duration-300",
        "data-[state=open]:before:bg-spanish-orange/30",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-eerie-black/50 transition-all duration-300 ml-4" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-[#2A2220] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-6 pt-0 pl-6", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

interface LegalAccordionProps {
  sections: {
    id: string
    title: string
    content: React.ReactNode
  }[]
  className?: string
  value?: string
  onValueChange?: (value: string) => void
}

export function LegalAccordion({ sections, className, value, onValueChange }: LegalAccordionProps) {
  const handleValueChange = (newValue: string) => {
    // Just update the value, let the parent handle scrolling
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <Accordion
      type="single"
      collapsible
      className={cn("w-full", className)}
      value={value}
      onValueChange={handleValueChange}
    >
      {sections.map((section) => (
        <AccordionItem key={section.id} value={section.id} id={section.id}>
          <AccordionTrigger>{section.title}</AccordionTrigger>
          <AccordionContent>
            <div className="prose-legal text-[0.9375rem] leading-[1.8] max-w-none">
              {section.content}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }