"use client";

import { WorksWheel, type WorksWheelItem } from "@/components/ui/works-wheel";

// Curated high-resolution Unsplash imagery tailored to Santhosh S.'s multilingual higher-education practice
const WORKS: WorksWheelItem[] = [
  {
    title: "Madras Engineering College",
    image: "assets/images/works-mec-campus.jpg",
    href: "https://www.madrascollege.ac.in/",
  },
  {
    title: "GoStudy Global Ecosystem",
    image: "assets/images/works-gostudy.jpg",
    href: "https://www.go.study",
  },
  {
    title: "Indo-Australian Nexus",
    image: "assets/images/works-australia-nexus.jpg",
    href: "#journey",
  },
  {
    title: "IELTS & Test Prep Mastery",
    image: "assets/images/works-ielts-exam.jpg",
    href: "#training",
  },
  {
    title: "Executive Business German",
    image: "assets/images/works-business-german.jpg",
    href: "#languages",
  },
  {
    title: "Japanese Language & JLPT",
    image: "assets/images/works-japanese-calligraphy.jpg",
    href: "#languages",
  },
  {
    title: "Articulatory Phonetics",
    image: "assets/images/works-spectrogram.png",
    href: "#about",
  },
];

export default function WorksWheelDemo() {
  return (
    <div className="bg-background text-foreground w-full h-screen">
      <WorksWheel items={WORKS} label="Works '26" action="Explore" />
    </div>
  );
}
