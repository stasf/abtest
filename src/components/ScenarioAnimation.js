import React, { useState } from "react";
import Dot from "./Dot";
import { AnimatePresence } from "framer-motion";

const DOTS = 16;

function getDotScenario(scenario, step) {
  // Step 0: all dots hidden
  // Step 1: all grey dots
  // Step 2: some drop off
  // Step 3: assign red/blue
  let dots = Array(DOTS).fill({ color: "grey", visible: false });

  if (step >= 1) {
    dots = dots.map((d, i) => ({ color: "grey", visible: true }));
  }
  if (step >= 2) {
    let dropOffIndexes = scenario === "early"
      ? [2, 6, 13]
      : [4, 11];
    dots = dots.map((d, i) =>
      dropOffIndexes.includes(i)
        ? { color: "grey", visible: false }
        : { color: "grey", visible: true }
    );
  }
  if (step >= 3) {
    let colors = scenario === "early"
      ? ["red", "blue", "red", "red", "blue", "red", null, "blue", "blue", "red", "blue", "red", "blue", null, "red", "blue"]
      : ["red", "blue", "red", "blue", null, "red", "blue", "red", "blue", "red", "blue", null, "red", "blue", "red", "blue"];
    dots = dots.map((d, i) =>
      d.visible && colors[i]
        ? { color: colors[i], visible: true }
        : { ...d }
    );
  }
  return dots;
}

function ScenarioAnimation({ scenario }) {
  const [step, setStep] = useState(0);

  const maxStep = 3;
  const dots = getDotScenario(scenario, step);

  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        minHeight: 70,
        marginBottom: 24
      }}>
        <AnimatePresence>
          {dots.map((dot, i) => (
            <Dot key={i} color={dot.color} visible={dot.visible} />
          ))}
        </AnimatePresence>
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Prev</button>
        <span style={{ margin: "0 1em" }}>Step {step + 1} / {maxStep + 1}</span>
        <button onClick={() => setStep(Math.min(maxStep, step + 1))} disabled={step === maxStep}>Next</button>
      </div>
      <div style={{ marginTop: 20, minHeight: 40 }}>
        {step === 0 && <p>Step 1: Users (dots) start off hidden.</p>}
        {step === 1 && <p>Step 2: All users arrive, but haven't been split or dropped off yet.</p>}
        {step === 2 && (
          <p>
            Step 3: Some users <b>drop off</b> and don't reach the experiment.
            <br />
            (Note: different users drop off in each scenario)
          </p>
        )}
        {step === 3 && (
          <p>
            Step 4: Remaining users are assigned to <span style={{ color: "#f44" }}>red</span> and <span style={{ color: "#4af" }}>blue</span> groups.
          </p>
        )}
      </div>
    </div>
  );
}

export default ScenarioAnimation;
