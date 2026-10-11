import { InputsForm } from "./InputsForm";
import { roundNumber } from "../../../utils/numberUtils";
import type { CardInputs, DemandProps, CEDInputs } from "../../../types";

type CEDControlKeys = Exclude<keyof CEDInputs, "type">;
const CED_KEYS: CEDControlKeys[] = ["A1", "A2", "epsilon", "delta"];

export function CEDInputsForm({
    inputs,
    updateDemandConfig,
    isRunning,
}: DemandProps<CEDInputs>) {
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

    return (
        <>
            <InputsForm<Omit<CEDInputs, "type">>
                inputKeys={inputKeys}
                cards={cards}
                inputs={inputs}
                updateDemandConfig={updateDemandConfig}
                boundsCallbacks={{
                        minCallback: (field) => {return field === 'epsilon'},
                        maxCallback: (field) => {return field === 'delta'}
                    }
                }
                boundsHintEl={
                    <span>
                        Note that parameters are restricted to satisfy the assumptions (
                        <em>&epsilon; &gt; 1</em>) and (<em>0 &le; &delta; &lt; &epsilon;</em>
                        ) to reflect that own-price demand sensitivity should exceed
                        cross-price sensitivity. The assumption (
                        <em>&epsilon; - &delta; &gt; 1</em>) ensures reasonable monopoly
                        prices.
                    </span>
                }
                isRunning={isRunning}
            />
        </>
    );
}
