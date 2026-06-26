import Hero from "@/app/components/landing/Hero";
import ProblemSection from "@/app/components/landing/ProblemSection";
import HowItWorks from "@/app/components/landing/HowItWorks";
import ModulePreview from "@/app/components/landing/ModulePreview";
import ProgressDemo from "@/app/components/landing/ProgressDemo";
import WeakTopicPreview from "@/app/components/landing/WeakTopicPreview";
import Testimonials from "@/app/components/landing/Testimonials";
import FinalCTA from "@/app/components/landing/FinalCTA";
import TrackView from "@/app/components/shared/TrackView";
import Reveal from "@/app/components/shared/Reveal";

export default function HomePage() {
  return (
    <>
      <TrackView event="landing_page_viewed" />
      <Hero />
      <Reveal>
        <ProblemSection />
      </Reveal>
      <Reveal>
        <HowItWorks />
      </Reveal>
      <Reveal>
        <ModulePreview />
      </Reveal>
      <Reveal>
        <ProgressDemo />
      </Reveal>
      <Reveal>
        <WeakTopicPreview />
      </Reveal>
      <Reveal>
        <Testimonials />
      </Reveal>
      <Reveal>
        <FinalCTA />
      </Reveal>
    </>
  );
}
