import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Dot from "./Dot";

const DOTS = 50;           // <--- Set this to how many users you want
const DROPOFF_COUNT = 20;   // <--- Set this to how many users drop off

function randomAssignments(count) {
  // Make a random mix of "red" and "blue", as balanced as possible
  let half = Math.floor(count / 2);
  let assignments = Array(half).fill("red").concat(Array(count - half).fill("blue"));
  for (let i = assignments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
  }
  return assignments;
}

function randomIndexes(total, count) {
  let arr = [...Array(total).keys()];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

function buildEarlySplitDots(step, dropOffIndexes, assignments) {
  let dots = Array(DOTS).fill({ color: "grey", visible: false, faded: false });

  if (step >= 1) {
    dots = dots.map((d, i) => ({ color: "grey", visible: true, faded: false }));
  }
  if (step >= 2) {
    dots = dots.map((d, i) => ({
      color: assignments[i],
      visible: true,
      faded: false
    }));
  }
  if (step >= 3) {
    dots = dots.map((d, i) => {
      if (dropOffIndexes.includes(i)) {
        return { color: assignments[i], visible: true, faded: true };
      }
      return { color: assignments[i], visible: true, faded: false };
    });
  }
  // steps 4 and 5: same as step 3 for early
  return dots;
}

function buildLateSplitDots(step, dropOffIndexes) {
  let dots = Array(DOTS).fill({ color: "grey", visible: false, faded: false });

  if (step >= 1) {
    dots = dots.map((d, i) => ({ color: "grey", visible: true, faded: false }));
  }
  if (step >= 3) {
    // Remove drop-off dots after step 2 (step 3+)
    dots = dots.map((d, i) =>
      dropOffIndexes.includes(i)
        ? { color: "grey", visible: false, faded: false }
        : { ...d }
    );
  }
  if (step >= 4) {
    // Only assign group to those who survived
    let survivors = [...Array(DOTS).keys()].filter(i => !dropOffIndexes.includes(i));
    let survivorAssignments = randomAssignments(survivors.length);
    dots = dots.map((d, i) => {
      if (!d.visible) return d;
      let survivorIndex = survivors.indexOf(i);
      if (survivorIndex === -1) return d;
      return { color: survivorAssignments[survivorIndex], visible: true, faded: false };
    });
  }
  return dots;
}

function countColors(dots) {
  let red = 0, blue = 0;
  dots.forEach(d => {
    if (d.visible && !d.faded) {
      if (d.color === "red") red++;
      if (d.color === "blue") blue++;
    }
  });
  return { red, blue };
}

function SideBySideScenarios() {
  // 6 steps now!
  const maxStep = 5;
  const getRandomScenario = () => {
    const earlyDrop = randomIndexes(DOTS, DROPOFF_COUNT);
    const lateDrop = randomIndexes(DOTS, DROPOFF_COUNT);
    const earlyAssignments = randomAssignments(DOTS);
    return { earlyDrop, lateDrop, earlyAssignments };
  };

  const [step, setStep] = useState(0);
  const [scenario, setScenario] = useState(getRandomScenario);

  function handleReset() {
    setScenario(getRandomScenario());
    setStep(0);
  }

  const earlyDots = buildEarlySplitDots(step, scenario.earlyDrop, scenario.earlyAssignments);
  const lateDots = buildLateSplitDots(step, scenario.lateDrop);

  const earlyStats = countColors(earlyDots);
  const lateStats = countColors(lateDots);

  // Step explanations
  const stepLabels = [
    "Step 1: Users (dots) start off hidden.",
    "Step 2: All users arrive.",
    <>
      <b>Step 3:</b> <span style={{ color: "#f44" }}>Early Split:</span> assign groups now.{" "}
      <span style={{ color: "#4af" }}>Late Split:</span> wait to assign.
    </>,
    <>
      <b>Step 4:</b> Show drop-off. <span style={{ color: "#f44" }}>Early Split:</span> dropped users are faded but already assigned a group. <span style={{ color: "#4af" }}>Late Split:</span> only survivors remain.
    </>,
    <>
      <b>Step 5:</b> <span style={{ color: "#4af" }}>Late Split:</span> now assign groups to only the users who made it.
    </>,
    <>
      <b>Step 6:</b> Compare final group sizes!
    </>,
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "4vw",
          justifyContent: "center",
          alignItems: "flex-start",
          marginBottom: 32,
          flexWrap: "wrap",
        }}
      >
        {/* Early Split Panel */}
        <div
          style={{
            background: "#232b32",
            borderRadius: 14,
            padding: 18,
            minWidth: 320,
            boxShadow: "0 2px 12px #0004",
          }}
        >
          <h3 style={{ textAlign: "center", marginTop: 0 }}>Early Split</h3>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", minHeight: 75 }}>
            <AnimatePresence>
              {earlyDots.map((dot, i) => (
                <Dot key={i} color={dot.color} visible={dot.visible} faded={dot.faded} />
              ))}
            </AnimatePresence>
          </div>
          {step === maxStep && (
            <div style={{ marginTop: 10, textAlign: "center", fontSize: "1.1em" }}>
              <span style={{ color: "#f44" }}>Red: {earlyStats.red}</span>{" | "}
              <span style={{ color: "#4af" }}>Blue: {earlyStats.blue}</span>
            </div>
          )}
        </div>
        {/* Late Split Panel */}
        <div
          style={{
            background: "#232b32",
            borderRadius: 14,
            padding: 18,
            minWidth: 320,
            boxShadow: "0 2px 12px #0004",
          }}
        >
          <h3 style={{ textAlign: "center", marginTop: 0 }}>Late Split</h3>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", minHeight: 75 }}>
            <AnimatePresence>
              {lateDots.map((dot, i) => (
                <Dot key={i} color={dot.color} visible={dot.visible} faded={dot.faded} />
              ))}
            </AnimatePresence>
          </div>
          {step === maxStep && (
            <div style={{ marginTop: 10, textAlign: "center", fontSize: "1.1em" }}>
              <span style={{ color: "#f44" }}>Red: {lateStats.red}</span>{" | "}
              <span style={{ color: "#4af" }}>Blue: {lateStats.blue}</span>
            </div>
          )}
        </div>
      </div>
      {/* Controls and Step Label */}
      <div style={{ textAlign: "center", margin: "24px 0" }}>
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="big-nav-btn"
        >
          ◀ Prev
        </button>
        <span style={{ margin: "0 2em", fontSize: "1.4em", fontWeight: 500 }}>
          Step {step + 1} / {maxStep + 1}
        </span>
        <button
          onClick={() => setStep(Math.min(maxStep, step + 1))}
          disabled={step === maxStep}
          className="big-nav-btn"
        >
          Next ▶
        </button>
        <button
          style={{
            marginLeft: 32,
            fontSize: "1.15em",
            padding: "0.6em 1.5em",
            background: "#2828a7",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            fontWeight: 600,
            boxShadow: "0 2px 8px #0002",
            transition: "background 0.2s",
          }}
          onClick={handleReset}
        >
          🔄 Reset
        </button>
      </div>
      {/* Step Explanation */}
      <div style={{ marginTop: 12, minHeight: 50, textAlign: "center", fontSize: "1.15em" }}>
        {stepLabels[step]}
      </div>
    </div>
  );
}

export default SideBySideScenarios;
