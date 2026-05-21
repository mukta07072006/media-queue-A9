import Hero from "@/components/Hero";
import AvailableTutors from "@/components/Tutors";
import Image from "next/image";

export const metadata = {
  title: "Home || Media Queue",
  description: "Developed by Muktadir",
};

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-white font-sans">
      <Hero/>
      <AvailableTutors/>
    </div>
  );
}
