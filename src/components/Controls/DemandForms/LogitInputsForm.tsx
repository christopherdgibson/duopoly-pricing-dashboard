import styles from '../../../App/App.module.css';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import type { CardInputs, ControlCardProps, DemandProps, LogitDemandInputs } from '../../../types';

type LogitControlKeys = Exclude<keyof LogitDemandInputs, 'type' | 'outside_utility' |'nesting_parameter'>

const LOGIT_CARDS: Record<LogitControlKeys, CardInputs> = {
  quality_1: {
    title: "Firm 1 Quality",
    latex: 'v_1',
    hint: "Utility relative to v0",
    min: 0,
    max: 10,
    step: 0.1
  },
  quality_2: {
    title: "Firm 2 Quality",
    latex: 'v_2',
    hint: "Utility relative to v0",
    min: 0,
    max: 10,
    step: 0.1
  },
  price_sensitivity: {
    title: "Price Sensitivity",
    latex: '\\alpha',
    // hint: "Marginal disutility of price",
    min: 0.1,
    max: 5.0,
    step: 0.1
  },
  logit_scale: {
    title: "Logit Scale",
    latex: '\\mu',
    hint: "Product differentiation",
    min: 0.1,
    max: 5.0,
    step: 0.1
  }
};

function ControlCard({card, inputKey, value, updateDemandConfig, isRunning}: ControlCardProps<LogitDemandInputs>) {
    return (
        <>
            <label className={styles.label}>
                <span>{card.title} {card.latex && <MathJax inline={true}>({`\\(${card.latex}  \\)`})</MathJax>}</span>
                <span className={styles.hint}>{card.hint}</span>
            </label>
            <input
                type="number"
                className={styles.input}
                min={card.min}
                max={card.max}
                step={card.step}
                value={value}
                disabled={isRunning}
                onChange={(e) => updateDemandConfig(inputKey, Number(e.target.value), card.min)}
            />
        </>
    );
}

export function LogitInputsForm({inputs, updateDemandConfig, isRunning}: DemandProps<LogitDemandInputs>) {
    const keys: LogitControlKeys[] = ['quality_1', 'quality_2', 'price_sensitivity', 'logit_scale'];
    const cards = LOGIT_CARDS;

    return (
        <MathJaxContext>
            <div className={styles.grid}>
                {keys.map((inputKey, idx) => (
                    <div 
                        key={idx} 
                        className={styles.fieldGroup}
                    >
                        {cards[inputKey] && <ControlCard
                            card={cards[inputKey]}
                            inputKey={inputKey}
                            value={inputs[inputKey]}
                            updateDemandConfig={updateDemandConfig}
                            isRunning={isRunning}                       
                        />}

                </div>
                ))}
            </div>
        </MathJaxContext>
    )
}
