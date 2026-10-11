import { useEffect, useRef, useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { roundNumber } from "../../../utils/numberUtils";
import styles from '../../../App/App.module.css';``
import type { CardInputs, ControlsBase, DemandProps, DemandTypeKey } from '../../../types';


interface InputProps<T extends Record<string, any>> extends DemandProps<T> {
  inputKeys: Array<Extract<keyof T, string>>;
  cards: Record<Extract<keyof T, string>, CardInputs>;
  boundsCallbacks?: {minCallback: (field: keyof T) => boolean, maxCallback: (field: keyof T) => boolean};
  boundsHintEl?: any;
}

interface ControlCardProps<T> extends ControlsBase {
  inputKey: T;
  value: number | DemandTypeKey | undefined;
  card: CardInputs;
  updateDemandConfig: (field: T, value: number, minValue?: number, maxValue?: number) => void;
  boundsCallbacks?: {minCallback: (field: T) => boolean, maxCallback: (field: T) => boolean};
  triggerFlag: () => void;
}

interface BoundsViolationProps<T> {
    card: CardInputs;
    field: T;
    value: number;
    boundsCallbacks?: {minCallback?: (field: T) => boolean, maxCallback?: (field: T) => boolean};
    triggerFlag?: () => void;
}

function checkBoundsViolation<T>({card, field, value, boundsCallbacks, triggerFlag}: BoundsViolationProps<T>): boolean {
    if (card.min !== undefined && roundNumber(value, 1) < roundNumber(card.min, 1)) {
        if (boundsCallbacks && boundsCallbacks.minCallback && boundsCallbacks.minCallback(field) == true&& triggerFlag) {
            triggerFlag();
        }
        return true;
    }

    if (card.max !== undefined && roundNumber(value, 1) > roundNumber(card.max, 1)) {
        if (boundsCallbacks && boundsCallbacks.maxCallback && boundsCallbacks.maxCallback(field) == true && triggerFlag) {
            triggerFlag();
        }
        return true;
    }

    return false;
};

function ControlCard<T,>({card, inputKey, value, updateDemandConfig, boundsCallbacks, triggerFlag, isRunning}: ControlCardProps<T>) {
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

        if (checkBoundsViolation({card, field: inputKey, value: numVal, boundsCallbacks, triggerFlag}) === true) {
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
  boundsCallbacks,
  boundsHintEl,
  isRunning
}: InputProps<T>) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const [boundsFlag, setBoundsFlag] = useState<boolean>(false);

    const triggerFlag = () => {
        // Clear any existing active timer immediately
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        setBoundsFlag(true);

        timeoutRef.current = setTimeout(() => {
            setBoundsFlag(false);
            timeoutRef.current = null;
        }, 3000);
    };

    return (
        <>
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
                                boundsCallbacks={boundsCallbacks}
                                triggerFlag={triggerFlag}
                                isRunning={isRunning}
                            />
                        </div>
                    );
                })}
            </div>
            {boundsHintEl !== undefined && (
                <label className={`${styles.label} ${styles.boundsLabel} ${boundsFlag && styles.flag}`}>
                    {boundsHintEl}
                </label>
            )}
        </>
    );
}