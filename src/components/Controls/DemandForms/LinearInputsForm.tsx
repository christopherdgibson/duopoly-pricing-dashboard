
import { useRef, useState } from 'react';
import { InputsForm } from './InputsForm';
import type { CardInputs, DemandProps, LinearDemandInputs } from '../../../types';

import styles from '../../../App/App.module.css';

type LinearControlKeys = Exclude<keyof LinearDemandInputs, 'type'>
const LINEAR_KEYS: LinearControlKeys[] = ['demand_intercept', 'demand_slope', 'elasticity_ij'];

export function LinearInputsForm({ inputs, updateDemandConfig, isRunning }: DemandProps<LinearDemandInputs>) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [boundsFlag, setBoundsFlag] = useState<boolean>(false);
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

    const triggerFlag = (field: keyof LinearDemandInputs) => {
        // Clear any existing active timer immediately
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (field === 'demand_intercept') return;

        setBoundsFlag(true);

        timeoutRef.current = setTimeout(() => {
            setBoundsFlag(false);
            timeoutRef.current = null;
        }, 3000);
    };

    // const filteredDemandChange = <F extends keyof DemandInputsMap['linear']>(
    //     field: F,
    //     value: number,
    //     minValue?: number,
    //     maxValue?: number
    //   ) => {
    //     console.log('filteredDemandChange', 'value: ', value, 'minValue: ', minValue, 'maxValue: ', maxValue);
    //     if ((minValue && value < minValue) || (maxValue && value > maxValue)) {
    //         if (field === 'demand_intercept') return;
    //         triggerFlag(field);
    //     } else {
    //         updateDemandConfig(field as keyof LinearDemandInputs, value, minValue);
    //     }
    // }

    return (
        <>
            <InputsForm<Omit<LinearDemandInputs, 'type'>>
                inputKeys={inputKeys}
                cards={cards}
                inputs={inputs}
                updateDemandConfig={updateDemandConfig}
                onBoundsViolation={triggerFlag}
                isRunning={isRunning}
            />
            <label className={`${styles.label} ${styles.boundsLabel} ${boundsFlag && styles.flag}`}>
                <span>Note that parameters are restricted to satisfy the assumption (<em>b &gt; d</em>) to reflect that own-price demand sensitivity should exceed cross-price sensitivity.</span>
            </label>
       </>
    );
}
