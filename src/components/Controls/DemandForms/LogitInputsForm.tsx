import styles from '../../../App/App.module.css';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import type { ControlsBase, LogitDemandInputs } from '../../../types';

export interface LogitDemandProps extends ControlsBase {
    inputs: LogitDemandInputs;
    updateDemandConfig: (field: keyof LogitDemandInputs, value: number, minValue?: number) => void;
}

export function LogitInputsForm({inputs, updateDemandConfig, isRunning}: LogitDemandProps) {
    return (
        <MathJaxContext>
        <div className={styles.grid}>
            {/* Product Quality */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    <span>Product Quality <MathJax inline={true}>({"\\(v_1  \\)"})</MathJax></span>
                    <span className={styles.hint}>Quality Firm 1</span>
                </label>
                <input
                    type="number"
                    className={styles.input}
                    min={0}
                    value={inputs.quality_1}
                    disabled={isRunning}
                    onChange={(e) => updateDemandConfig('quality_1', Number(e.target.value), 0)}
                />
            </div>
            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    <span>Product Quality <MathJax inline={true}>({"\\(v_2  \\)"})</MathJax></span>
                    <span className={styles.hint}>Quality Firm 2</span>
                </label>
                <input
                    type="number"
                    className={styles.input}
                    min={0}
                    value={inputs.quality_2}
                    disabled={isRunning}
                    onChange={(e) => updateDemandConfig('quality_2', Number(e.target.value), 0)}
                />
            </div>

            {/* Price Sensitivity */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    <span>Price Sensitivity (<em>&alpha;</em>)</span>
                    <span className={styles.hint}>Price sensitivity</span>
                </label>
                <input
                    type="number"
                    className={styles.input}
                    min={0.1}
                    step={0.1}
                    value={inputs.price_sensitivity}
                    disabled={isRunning}
                    onChange={(e) => updateDemandConfig('price_sensitivity', Number(e.target.value), 0.1)}
                />
            </div>

            {/* Logit Scale */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    <span>Logit Scale (<em>&mu;</em>)</span>
                    <span className={styles.hint}>Logit Scale</span>
                </label>
                <input
                    type="number"
                    className={styles.input}
                    min={0.1}
                    step={0.1}
                    value={inputs.logit_scale}
                    disabled={isRunning}
                    onChange={(e) => updateDemandConfig('logit_scale', Number(e.target.value), 0.1)}
                />
            </div>

        </div>
        </MathJaxContext>
    )
}