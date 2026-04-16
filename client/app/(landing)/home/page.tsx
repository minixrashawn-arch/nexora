import Container from "@/components/code/Container";
import React from "react";
import Hero from "./components/Hero";
import Ticker from "./components/Ticker";
import StatsSection from "./components/Stats";
import FeaturesSection from "./components/Features";
import HowItWorks from "./components/Flows";
import Tokenomics from "./components/Tokenomics";
import HowToBuy from "./components/HowToBuy";
import FAQ from "./components/FAQ";

const Home = () => {
  return (
    <div>
      <Hero />
      <Ticker />
      <Container>
        <StatsSection />
        <FeaturesSection />
        <HowItWorks />
        <Tokenomics />
        <HowToBuy />
        <FAQ />
      </Container>
    </div>
  );
};

export default Home;
