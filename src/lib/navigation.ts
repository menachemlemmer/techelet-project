import { getCollection } from 'astro:content';

export interface NavItem {
  id: string;
  sectionNum: string;
  title: string;
  movement: string;
  movementLabel: string;
  order: number;
}

export async function getOrderedSections(): Promise<NavItem[]> {
  const allSections = await getCollection('sections');
  return allSections
    .sort((a, b) => a.data.order - b.data.order)
    .map(s => ({
      id: s.id,
      sectionNum: s.data.sectionNum,
      title: s.data.title,
      movement: s.data.movement,
      movementLabel: s.data.movementLabel,
      order: s.data.order,
    }));
}

export async function getNavContext(currentId: string) {
  const sections = await getOrderedSections();
  const currentIndex = sections.findIndex(s => s.id === currentId);

  return {
    sections,
    current: sections[currentIndex],
    prev: currentIndex > 0 ? sections[currentIndex - 1] : null,
    next: currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null,
  };
}
