import Hero from "@/app/components/landing/Hero";
import ProblemPromise from "@/app/components/landing/ProblemPromise";
import HowItWorks from "@/app/components/landing/HowItWorks";
import Diagnostic from "@/app/components/landing/Diagnostic";
import StudyPlan from "@/app/components/landing/StudyPlan";
import Areas from "@/app/components/landing/Areas";
import WhyTero from "@/app/components/landing/WhyTero";
import FAQ from "@/app/components/landing/FAQ";
import FinalCTA from "@/app/components/landing/FinalCTA";
import TrackView from "@/app/components/shared/TrackView";

export default function HomePage() {
  return (
    <>
      <TrackView event="landing_page_viewed" />
      <Hero />
      <ProblemPromise />
      <HowItWorks />
      <Diagnostic />
      <StudyPlan />
      <Areas />
      <WhyTero />
      <FAQ />
      <FinalCTA />
    </>
  );
}
