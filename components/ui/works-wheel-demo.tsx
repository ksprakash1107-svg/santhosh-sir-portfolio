"use client";

import { WorksWheel, type WorksWheelItem } from "@/components/ui/works-wheel";

// Curated high-resolution Unsplash imagery tailored to Santhosh S.'s multilingual higher-education practice
const WORKS: WorksWheelItem[] = [
  {
    title: "Madras Engineering College",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80",
    href: "https://www.madrascollege.ac.in/",
  },
  {
    title: "GoStudy Global Ecosystem",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
    href: "https://www.go.study",
  },
  {
    title: "Indo-Germanic Academic Nexus",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&auto=format&fit=crop&q=80",
    href: "#journey",
  },
  {
    title: "IELTS & Test Prep Mastery",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80",
    href: "#training",
  },
  {
    title: "Japanese Language & JLPT",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80",
    href: "#languages",
  },
  {
    title: "Executive Communication Coaching",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
    href: "#training",
  },
  {
    title: "Dravidian Classical Linguistics",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop&q=80",
    href: "#languages",
  },
  {
    title: "Transcontinental Mobility Mentorship",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80",
    href: "#contact",
  },
];

export default function WorksWheelDemo() {
  return (
    <div className="bg-background text-foreground w-full h-screen">
      <WorksWheel items={WORKS} label="Works '26" action="Explore" />
    </div>
  );
}
