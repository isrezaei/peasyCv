"use client";

import { VStack } from "@chakra-ui/react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSections } from "@/hooks/store/useSections";
import { SortableSectionItem } from "./SortableSectionItem";

export function SectionManagementPanel() {
  const { sections, reorderSections, toggleSectionVisibility } = useSections();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const orderedSections = [...sections].sort((a, b) => a.order - b.order);
  const ids = orderedSections.map((section) => section.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    reorderSections(arrayMove(ids, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <VStack align="stretch" gap="10px">
          {orderedSections.map((section) => (
            <SortableSectionItem
              key={section.id}
              section={section}
              onToggleVisibility={() => toggleSectionVisibility(section.id)}
            />
          ))}
        </VStack>
      </SortableContext>
    </DndContext>
  );
}
