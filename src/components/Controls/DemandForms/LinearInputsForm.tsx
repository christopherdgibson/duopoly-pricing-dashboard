
import { InputsForm } from './InputsForm';
import type { CardInputs, DemandProps, LinearDemandInputs } from '../../../types';

import styles from '../../../App/App.module.css';

type LinearControlKeys = Exclude<keyof LinearDemandInputs, 'type'>
const LINEAR_KEYS: LinearControlKeys[] = ['demand_intercept', 'demand_slope', 'elasticity_ij'];

export function LinearInputsForm({ inputs, updateDemandConfig, isRunning }: DemandProps<LinearDemandInputs>) {
    const inputKeys = LINEAR_KEYS;
    const stepSize = 0.1;
    const cards: Record<LinearControlKeys, CardInputs> = {
        demand_intercept: {
            title: "Demand Intercept",
            latex: 'a',
            hint: "Market Size",
            min: 1,
            step: 1
        },
        demand_slope: {
            title: "Demand Slope",
            latex: 'b',
            hint: "Price Sensitivity",
            min: inputs.elasticity_ij + stepSize,
            // max: 10,
            step: stepSize
        },
        elasticity_ij: {
            title: "Cross-price Elasticity",
            latex: 'd',
            hint: "Product Similarity",
            min: 0,
            max: inputs.demand_slope - stepSize,
            step: stepSize
        }
    };

    return (
        <>
            <InputsForm<Omit<LinearDemandInputs, 'type'>>
                inputKeys={inputKeys}
                cards={cards}
                inputs={inputs}
                updateDemandConfig={updateDemandConfig}
                isRunning={isRunning}
            />
            <label className={styles.label} style={{marginTop:'10px'}}>
                <span>Note that parameters are restricted to satisfy the assumption (<em>b &gt; d</em>) to reflect that own-price demand sensitivity should exceed cross-price sensitivity.</span>
            </label>
       </>
    );
}
