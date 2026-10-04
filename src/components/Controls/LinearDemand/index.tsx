import styles from '../../../App/App.module.css';
import type { ControlsBase, MarketConfig } from '../../../types';

export interface LinearDemandProps extends ControlsBase {
  updateDemandConfig: <F extends keyof MarketConfig>(field: F, value: MarketConfig[F]) => void;
}

export function LinearDemandControls({payload, updateDemandConfig, isRunning}: LinearDemandProps) {
    return (
        <div className={styles.grid}>
            {/* Demand Intercept */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    <span>Demand Intercept (<em>a</em>)</span>
                    <span className={styles.hint}>Market size</span>
                </label>
                <input
                    type="number"
                    className={styles.input}
                    min={0}
                    value={payload.market.demand_intercept}
                    disabled={isRunning}
                    onChange={(e) => updateDemandConfig('demand_intercept', Number(e.target.value))}
                />
            </div>

            {/* Demand Slope */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    <span>Demand Slope (<em>b</em>)</span>
                    <span className={styles.hint}>Price sensitivity</span>
                </label>
                <input
                    type="number"
                    className={styles.input}
                    value={payload.market.demand_slope}
                    disabled={isRunning}
                    onChange={(e) => updateDemandConfig('demand_slope', Number(e.target.value))}
                />
            </div>

            {/* Cross-price Elasticity */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    <span>Cross-price Elasticity (<em>d</em>)</span>
                    <span className={styles.hint}>Product similarity</span>
                </label>
                <input
                    type="number"
                    className={styles.input}
                    value={payload.market.elasticity_ij}
                    disabled={isRunning}
                    onChange={(e) => updateDemandConfig('elasticity_ij', Number(e.target.value))}
                />
            </div>
        </div>
    )
}