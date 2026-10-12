import styles from "./TradeProgressSteps.module.css";

type Props = {
  tone: "buy" | "sell";
  currentStep: 2 | 3;
};

const steps = ["Request Details", "Confirm", "Completed"] as const;

export default function TradeProgressSteps({ tone, currentStep }: Props) {
  return (
    <nav
      className={`${styles.steps} ${tone === "buy" ? styles.buy : styles.sell}`}
      aria-label="Trade progress"
    >
      {steps.map((label, index) => {
        const step = index + 1;
        const isDone = step < currentStep;
        const isActive = step === currentStep;

        return (
          <div className={styles.item} key={label}>
            {index > 0 && (
              <span
                className={`${styles.line} ${index < currentStep ? styles.lineDone : ""}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`${styles.step} ${isDone ? styles.done : ""} ${isActive ? styles.active : ""}`}
              aria-current={isActive ? "step" : undefined}
            >
              <b>{step}</b>
              <span>{label}</span>
            </span>
          </div>
        );
      })}
    </nav>
  );
}
