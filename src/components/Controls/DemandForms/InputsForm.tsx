import styles from '../../../App/App.module.css';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import type { ControlCardProps, InputProps } from '../../../types';

export function ControlCard<T,>({card, inputKey, value, updateDemandConfig, isRunning}: ControlCardProps<T>) {
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

export function InputsForm<T extends Record<string, any>>({
  inputKeys,
  cards,
  inputs,
  updateDemandConfig,
  isRunning
}: InputProps<T>) {
    return (
        <MathJaxContext>
            <div className={styles.grid}>
                {inputKeys.map((inputKey) => {
                    const card = cards[inputKey];
                    const rawValue = inputs[inputKey];

                    if (!card || typeof rawValue !== 'number') {
                        return null;
                    }

                    return (
                        <div key={String(inputKey)} className={styles.fieldGroup}>
                            <ControlCard
                                card={card}
                                inputKey={inputKey}
                                value={rawValue}
                                updateDemandConfig={updateDemandConfig}
                                isRunning={isRunning}
                            />
                        </div>
                    );
                })}
            </div>
        </MathJaxContext>
    );
}