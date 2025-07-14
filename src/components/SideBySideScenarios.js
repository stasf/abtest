import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { AnimatePresence } from "framer-motion";
import Dot from "./Dot";

function randomAssignments(count) {
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

function buildEarlySplitDots(step, dropOffIndexes, assignments, dotsCount) {
  let dots = Array(dotsCount).fill({ color: "grey", visible: false, faded: false });
  if (step >= 1) {
    dots = dots.map((d, i) => ({ color: "grey", visible: true, faded: false }));
  }
  if (step >= 2) {
    dots = dots.map((d, i) => ({ color: assignments[i], visible: true, faded: false }));
  }
  if (step >= 3) {
    dots = dots.map((d, i) => dropOffIndexes.includes(i)
      ? { color: assignments[i], visible: true, faded: true }
      : { color: assignments[i], visible: true, faded: false });
  }
  return dots;
}

function buildLateSplitDots(step, dropOffIndexes, dotsCount) {
  let dots = Array(dotsCount).fill({ color: "grey", visible: false, faded: false });
  if (step >= 1) {
    dots = dots.map((d, i) => ({ color: "grey", visible: true, faded: false }));
  }
  if (step >= 3) {
    dots = dots.map((d, i) => dropOffIndexes.includes(i)
      ? { color: "grey", visible: false, faded: false }
      : { ...d });
  }
  if (step >= 4) {
    let survivors = [...Array(dotsCount).keys()].filter(i => !dropOffIndexes.includes(i));
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

function SideBySideScenarios({ dotsCount = 50, dropoffCount = 20 }) {
  const maxStep = 5;
  const [participants, setParticipants] = useState(dotsCount);
  const [dropoffPercent, setDropoffPercent] = useState(40);
  const dropoff = useMemo(() => Math.round((participants * dropoffPercent) / 100), [participants, dropoffPercent]);

  const getRandomScenario = () => {
    const earlyDrop = randomIndexes(participants, dropoff);
    const lateDrop = randomIndexes(participants, dropoff);
    const earlyAssignments = randomAssignments(participants);
    return { earlyDrop, lateDrop, earlyAssignments };
  };

  const [step, setStep] = useState(0);
  const [scenario, setScenario] = useState(getRandomScenario);

  function handleReset() {
    setScenario(getRandomScenario());
    setStep(0);
  }

  // Update scenario when participants/dropoffPercent change
  React.useEffect(() => {
    setScenario(getRandomScenario());
    setStep(0);
  }, [participants, dropoffPercent]);

  // Memoize dot calculations for performance
  const earlyDots = useMemo(() => buildEarlySplitDots(step, scenario.earlyDrop, scenario.earlyAssignments, participants), [step, scenario, participants]);
  const lateDots = useMemo(() => buildLateSplitDots(step, scenario.lateDrop, participants), [step, scenario, participants]);

  const earlyStats = useMemo(() => countColors(earlyDots), [earlyDots]);
  const lateStats = useMemo(() => countColors(lateDots), [lateDots]);

  // Calculate percent split for last step
  const earlyTotal = earlyStats.red + earlyStats.blue;
  const lateTotal = lateStats.red + lateStats.blue;
  const earlyRedPct = earlyTotal ? Math.round((earlyStats.red / earlyTotal) * 100) : 0;
  const earlyBluePct = earlyTotal ? Math.round((earlyStats.blue / earlyTotal) * 100) : 0;
  const lateRedPct = lateTotal ? Math.round((lateStats.red / lateTotal) * 100) : 0;
  const lateBluePct = lateTotal ? Math.round((lateStats.blue / lateTotal) * 100) : 0;

  // Step explanations (all JSX for consistency)
  const stepLabels = [
    <span><b>Step 1:</b> Users (dots) start off hidden.</span>,
    <span><b>Step 2:</b> All users arrive.</span>,
    <span><b>Step 3:</b> Early Split: assign groups now. Late Split: wait to assign.</span>,
    <span><b>Step 4:</b> Show drop-off. Early Split: dropped users are faded but already assigned a group. Late Split: only survivors remain.</span>,
    <span><b>Step 5:</b> Late Split: now assign groups to only the users who made it.</span>,
    <span><b>Step 6:</b> Compare final group sizes!</span>,
  ];

  return (
    <div>
      {/* Legend */}
      <div style={{ textAlign: "center", marginBottom: 12, fontSize: "1.08em" }}>
        <span style={{ color: "#f44", fontWeight: 600 }}>Red = Control</span>
        <span style={{ margin: "0 18px" }}>|</span>
        <span style={{ color: "#4af", fontWeight: 600 }}>Blue = Variant</span>
      </div>
      {/* Controls for participants and dropoff */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <label style={{ marginRight: 16 }}>
          Number of Participants:
          <input
            type="range"
            min={50}
            max={1000}
            value={participants}
            onChange={e => setParticipants(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          />
          <input
            type="number"
            min={50}
            max={1000}
            value={participants}
            onChange={e => setParticipants(Math.max(50, Math.min(1000, Number(e.target.value))))}
            style={{ marginLeft: 8, width: 60 }}
          />
        </label>
        <label>
          Drop-off (%):
          <input
            type="range"
            min={0}
            max={100}
            value={dropoffPercent}
            onChange={e => setDropoffPercent(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          />
          <input
            type="number"
            min={0}
            max={100}
            value={dropoffPercent}
            onChange={e => setDropoffPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
            style={{ marginLeft: 8, width: 60 }}
          />
          <span style={{ marginLeft: 8 }}>
            ({dropoff} users)
          </span>
        </label>
      </div>
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
          <h3 style={{ textAlign: "center", marginTop: 0 }}>Expose immediately</h3>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", minHeight: 75 }}>
            <AnimatePresence>
              {earlyDots.map((dot, i) => (
                <Dot key={i} color={dot.color} visible={dot.visible} faded={dot.faded} />
              ))}
            </AnimatePresence>
          </div>
          {step === maxStep && (
            <div style={{ marginTop: 10, textAlign: "center", fontSize: "1.1em" }}>
              <span style={{ color: "#f44", transition: "color 0.3s" }}>
                Control: {earlyStats.red} ({earlyRedPct}%)
              </span>{" | "}
              <span style={{ color: "#4af", transition: "color 0.3s" }}>
                Variant: {earlyStats.blue} ({earlyBluePct}%)
              </span>
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
          <h3 style={{ textAlign: "center", marginTop: 0 }}>Expose at first interaction</h3>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", minHeight: 75 }}>
            <AnimatePresence>
              {lateDots.map((dot, i) => (
                <Dot key={i} color={dot.color} visible={dot.visible} faded={dot.faded} />
              ))}
            </AnimatePresence>
          </div>
          {step === maxStep && (
            <div style={{ marginTop: 10, textAlign: "center", fontSize: "1.1em" }}>
              <span style={{ color: "#f44", transition: "color 0.3s" }}>
                Control: {lateStats.red} ({lateRedPct}%)
              </span>{" | "}
              <span style={{ color: "#4af", transition: "color 0.3s" }}>
                Variant: {lateStats.blue} ({lateBluePct}%)
              </span>
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
          aria-label="Previous step"
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
          aria-label="Next step"
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
          aria-label="Reset scenario"
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

SideBySideScenarios.propTypes = {
  dotsCount: PropTypes.number,
  dropoffCount: PropTypes.number,
};

export default SideBySideScenarios;
