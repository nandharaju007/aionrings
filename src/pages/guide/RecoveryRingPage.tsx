import { GuideArticle } from "@/components/GuideArticle";

export default function RecoveryRingPage() {
  return (
    <GuideArticle
      path="/smart-ring-guide/recovery-ring"
      metaTitle="Recovery Ring: HRV, Readiness & Training Load Explained | aiOn"
      metaDescription="How a recovery tracking ring builds a readiness score from HRV, resting heart rate, sleep and strain — what a low score really means and how to train around it."
      eyebrow="Guide · Recovery"
      breadcrumbName="Recovery ring"
      h1="Recovery ring: what a readiness score is made of, and how to use it"
      intro="Recovery is the difference between training that builds you and training that drains you. A recovery ring watches the overnight signals that show whether your body has absorbed recent load, and condenses them into a single readiness number. Here is what goes into that number, what it can and cannot tell you, and how to act on it."
      sections={[
        {
          id: "inputs",
          h: "What goes into a readiness score",
          bullets: [
            "Heart-rate variability overnight — the clearest single marker of whether your nervous system has settled.",
            "Resting heart rate, and how quickly it dropped after you fell asleep.",
            "Sleep quantity and consistency versus your own recent average.",
            "Recent strain: training volume and intensity over the last few days.",
            "Skin-temperature deviation, which often rises before you consciously feel run down.",
          ],
        },
        {
          id: "baseline",
          h: "Why baselines beat absolute numbers",
          body: [
            "HRV and resting heart rate differ enormously between people. A 40 ms HRV can be excellent for one person and low for another, so any score that compares you to a population average is close to meaningless.",
            "A useful recovery ring learns your personal range over a few weeks, then reports today as a deviation from that range. That is why the first two weeks of wear are calibration, not judgement.",
          ],
        },
        {
          id: "reading-score",
          h: "How to read a low, medium or high score",
          table: {
            head: ["Readiness", "Likely picture", "Reasonable response"],
            rows: [
              ["High", "HRV at or above baseline, RHR low, sleep solid", "Good day for a hard session or a demanding workday"],
              ["Moderate", "One or two signals slightly off baseline", "Train, but keep intensity moderate and protect tonight's sleep"],
              ["Low", "HRV down, RHR up, short or broken sleep", "Ease off, prioritise sleep, hydration and lighter movement"],
            ],
          },
        },
        {
          id: "misreads",
          h: "Common misreads",
          body: [
            "A single low score is not a verdict. Alcohol, a late heavy meal, a hot room, travel, or a late workout can all suppress overnight HRV without meaning you are overtrained.",
            "Equally, a high score after a poor night can happen — the score is an estimate, not a truth. Sustained multi-day trends are what should change your plans.",
          ],
        },
        {
          id: "aion",
          h: "How aiOn handles recovery",
          body: [
            "aiOn reduces the morning to one number and one action. Instead of asking you to interpret four charts, the app tells you what changed against your baseline and what to do differently today — then shows the contributing factors if you want the detail.",
          ],
        },
      ]}
      faqs={[
        {
          q: "How long before a recovery ring gives useful scores?",
          a: "Typically one to two weeks of consistent wear, because the score is calculated against your personal baseline rather than a population average.",
        },
        {
          q: "Should I skip training when readiness is low?",
          a: "Not necessarily. A single low score is often explained by alcohol, late food, travel or a late session. Use it as a prompt to adjust intensity, and treat a multi-day downward trend more seriously.",
        },
        {
          q: "Does a recovery ring replace how I feel?",
          a: "No. Subjective feel is still the most important input. The ring is there to catch drift you would otherwise miss and to give context to how you feel.",
        },
        {
          q: "Is recovery data medical advice?",
          a: "No. aiOn is a general wellness product and does not diagnose, treat, cure or prevent any condition. Speak to a qualified healthcare professional about medical concerns.",
        },
      ]}
      related={[
        { to: "/smart-ring-guide/sleep-tracking-ring", label: "Sleep tracking ring: how it works and what it measures" },
        { to: "/smart-ring-guide/stress-tracking-ring", label: "Stress tracking ring: reading your daytime balance" },
        { to: "/smart-ring-guide", label: "The complete smart ring guide" },
      ]}
    />
  );
}
