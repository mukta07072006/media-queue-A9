import WorkflowSection from "@/components/aboutus";
import Features from "@/components/features";
import Hero from "@/components/Hero";
import HeroNew from "@/components/Hero2";
import AvailableTutors from "@/components/Tutors";
import Image from "next/image";

export const metadata = {
  title: "Home || Media Queue",
  description: "Developed by Muktadir",
};

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-green-50 font-sans">
      <HeroNew/>
      {/* <AvailableTutors/> */}
      <Features/>
      <WorkflowSection/>
    </div>
  );
}
