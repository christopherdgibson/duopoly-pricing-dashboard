import { useEffect, useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import styles from '../../../App/App.module.css';``
import type { ControlCardProps, InputProps } from '../../../types';

export function ControlCard<T,>({card, inputKey, value, updateDemandConfig, checkBoundsViolation, isRunning}: ControlCardProps<T>) {
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

            if (checkBoundsViolation && checkBoundsViolation(inputKey, numVal)) {
                setLocalValue(String(value)); // Revert input display to safe value
            } else {
                updateDemandConfig(inputKey, numVal); // Valid input, update parent state normally
            }
        };

        const handleBlur = () => {
            const numVal = parseFloat(localValue);
            // On blur, if out of bounds, snap it back to the last valid value
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
  checkBoundsViolation,
  isRunning
}: InputProps<T>) {
    return (
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
                            checkBoundsViolation={checkBoundsViolation}
                            isRunning={isRunning}
                        />
                    </div>
                );
            })}
        </div>
    );
}