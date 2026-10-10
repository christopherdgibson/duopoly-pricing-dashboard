import { useEffect, useState } from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import styles from '../../../App/App.module.css';``
import type { ControlCardProps, InputProps } from '../../../types';

export function ControlCard<T,>({card, inputKey, value, updateDemandConfig, onBoundsViolation, isRunning}: ControlCardProps<T>) {
      const [localValue, setLocalValue] = useState<string>(String(value));

        // Sync local state if parent value changes externally
        useEffect(() => {
            setLocalValue(String(value));
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const rawText = e.target.value;
            setLocalValue(rawText);

            const numVal = parseFloat(rawText);
            if (isNaN(numVal)) return;

            // Check if bounds are violated
            const violatesMin = card.min !== undefined && numVal < card.min;
            const violatesMax = card.max !== undefined && numVal > card.max;

            if (violatesMin || violatesMax) {
                // If it's an arrow click or a finalized number out of bounds, trigger flag
                if (onBoundsViolation) onBoundsViolation(inputKey);
                setLocalValue(String(value)); // Revert input display to safe value
            } else {
                // Valid input, update parent state normally
                updateDemandConfig(inputKey, numVal);
            }
        };

        const handleBlur = () => {
            const numVal = parseFloat(localValue);
            // On blur, if they left it out of bounds, snap it back to the last valid value
            if (isNaN(numVal) || (card.min !== undefined && numVal < card.min) || (card.max !== undefined && numVal > card.max)) {
            setLocalValue(String(value));
            }
        };

    return (
        <>
            <label className={styles.label}>
                <span>{card.title} {card.latex && <MathJax inline={true}>({`\\(${card.latex}  \\)`})</MathJax>}</span>
                <span className={styles.hint}>{card.hint}</span>
            </label>
            <input
                type="number"
                className={styles.input}
                step={card.step}
                value={localValue}
                disabled={isRunning}
                onChange={handleChange}
                onBlur={handleBlur}
            />
        </>
    );
}

export function InputsForm<T extends Record<string, any>>({
  inputKeys,
  cards,
  inputs,
  updateDemandConfig,
  onBoundsViolation,
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
                                onBoundsViolation={onBoundsViolation}
                                isRunning={isRunning}
                            />
                        </div>
                    );
                })}
            </div>
        </MathJaxContext>
    );
}