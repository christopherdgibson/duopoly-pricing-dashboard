import styles from '../../../App/App.module.css';
import type { ControlsBase, LogitDemandInputs } from '../../../types';

export interface LogitDemandProps extends ControlsBase {
    inputs: LogitDemandInputs;
    updateDemandConfig: (field: keyof LogitDemandInputs, value: number) => void;
}

export function LinearDemandControls({inputs, updateDemandConfig, isRunning}: LogitDemandProps) {
    return (
        <div className={styles.grid}>
            {/* Market Size */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    <span>Demand Intercept (<em>a</em>)</span>
                    <span className={styles.hint}>Market size</span>
                </label>
                <input
                    type="number"
                    className={styles.input}
                    min={0}
                    value={inputs.market_size}
                    disabled={isRunning}
                    onChange={(e) => updateDemandConfig('market_size', Number(e.target.value))}
                />
            </div>

            {/* Price Sensitivity */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    <span>Demand Slope (<em>b</em>)</span>
                    <span className={styles.hint}>Price sensitivity</span>
                </label>
                <input
                    type="number"
                    className={styles.input}
                    value={inputs.price_sensitivity}
                    disabled={isRunning}
                    onChange={(e) => updateDemandConfig('price_sensitivity', Number(e.target.value))}
                />
            </div>

        </div>
    )
}