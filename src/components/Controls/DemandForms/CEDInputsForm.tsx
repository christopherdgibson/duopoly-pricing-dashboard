import { useRef, useState } from "react";
import { InputsForm } from "./InputsForm";
import { roundNumber } from "../../../utils/numberUtils";
import type { CardInputs, DemandProps, CEDInputs } from "../../../types";

import styles from "../../../App/App.module.css";

type CEDControlKeys = Exclude<keyof CEDInputs, "type">;
const CED_KEYS: CEDControlKeys[] = ["A1", "A2", "epsilon", "delta"];

export function CEDInputsForm({
    inputs,
    updateDemandConfig,
    isRunning,
}: DemandProps<CEDInputs>) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [boundsFlag, setBoundsFlag] = useState<boolean>(false);
    const inputKeys = CED_KEYS;
    const stepSize = 0.1;
    const cards: Record<keyof Omit<CEDInputs, "type">, CardInputs> = {
        A1: {
            title: "Demand Scale 1",
            latex: "A_1",
            hint: "Base Scale 1",
            min: 0.1,
            step: 1,
        },
        A2: {
            title: "Demand Scale 2",
            latex: "A_2",
            hint: "Base Scale 2",
            min: 0.1,
            step: 1,
        },
        epsilon: {
            title: "Own Elasticity",
            latex: "\\epsilon",
            hint: "Price Sensitivity",
            min: roundNumber(inputs.delta + 1 + stepSize, 1),
            max: 10,
            step: stepSize,
        },
        delta: {
            title: "Cross Elasticity",
            latex: "\\delta",
            hint: "Substitutability",
            min: 0,
            max: roundNumber(inputs.epsilon - (1 + stepSize), 1),
            step: stepSize,
        },
    };

    const checkBoundsViolation = (field: CEDControlKeys, value: number): boolean => {
        const card = cards[field];

        if (card.min !== undefined && roundNumber(value, 1) < roundNumber(card.min, 1)) {
            if (field === 'epsilon') triggerFlag();
            return true;
        }

        if (card.max !== undefined && roundNumber(value, 1) > roundNumber(card.max, 1)) {
            if (field === 'delta') triggerFlag();
            return true;
        }

        return false;
    };

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
            <InputsForm<Omit<CEDInputs, "type">>
                inputKeys={inputKeys}
                cards={cards}
                inputs={inputs}
                updateDemandConfig={updateDemandConfig}
                checkBoundsViolation={checkBoundsViolation}
                isRunning={isRunning}
            />
                <label className={`${styles.label} ${styles.boundsLabel} ${boundsFlag && styles.flag}`}>
                <span>
                    Note that parameters are restricted to satisfy the assumptions (
                    <em>&epsilon; &gt; 1</em>) and (<em>0 &le; &delta; &lt; &epsilon;</em>
                    ) to reflect that own-price demand sensitivity should exceed
                    cross-price sensitivity. The assumption (
                    <em>&epsilon; - &delta; &gt; 1</em>) ensures reasonable monopoly
                    prices.
                </span>
            </label>
        </>
    );
}
