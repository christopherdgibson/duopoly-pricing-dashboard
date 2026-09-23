import Slider from 'react-input-slider';
import styles from './Controls.module.css';
import type { SimulationPayload } from '../../types';

interface ControlsProps {
  payload: SimulationPayload;
  onChange: (updatedParams: SimulationPayload) => void;
  onRunSimulation: () => void;
  isRunning: boolean;
}

// export const Controls: React.FC<ControlsProps> = ({
export default function Controls({payload, onChange, onRunSimulation, isRunning}: ControlsProps) {

  const handleConfigChange = <S extends keyof SimulationPayload, F extends keyof SimulationPayload[S]> (
    section: S,
    field: F,
    value: SimulationPayload[S][F]
  ) => {
    onChange({
      ...payload,
      [section]: {
        ...payload[section],
        [field]: value,
      },
    });
  };

  return (
    <div className={styles.controlsCard}>
      <div className={styles.header}>
        <h2 className={styles.title}>Model Parameters</h2>
        <span className={styles.badge}>Q-Learning Duopoly</span>
      </div>
      <h3 className={styles.subTitle}>Demand Parameters</h3>
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
            value={payload.market.demand_intercept}
            disabled={isRunning}
            onChange={(e) => handleConfigChange('market', 'demand_intercept', Number(e.target.value))}
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
            onChange={(e) => handleConfigChange('market', 'demand_slope', Number(e.target.value))}
          />
        </div>

        {/* Marginal Cost */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span>Marginal Cost (<em>c</em>)</span>
            <span className={styles.hint}>Unit cost</span>
          </label>
          <input
            type="number"
            className={styles.input}
            value={payload.market.marginal_cost_1}
            disabled={isRunning}
            onChange={(e) => handleConfigChange('market', 'marginal_cost_1', Number(e.target.value))}
          />
        </div>
        {/* <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span>Marginal Cost 2 (<em>c2</em>)</span>
            <span className={styles.hint}>Unit cost</span>
          </label>
          <input
            type="number"
            className={styles.input}
            value={payload.market.marginal_cost_2}
            disabled={isRunning}
            onChange={(e) => handleConfigChange('market', 'marginal_cost_2', Number(e.target.value))}
          />
        </div> */}
      </div>

      <h3 className={styles.subTitle}>Learning Parameters</h3>
      <div className={styles.grid}>
        {/* Learning Rate (Alpha) */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span>Learning Rate (<em>&alpha;</em>)</span>
            <span className={styles.hint}>0.01 - 1.0</span>
          </label>
          <div className={styles.slider}>
            <div className={styles.sliderValue}>
              <input
                type="number"
                className={styles.input}
                value={payload.market.alpha}
                disabled={isRunning}
                min={0.01}
                max={1.0}
                step={0.01}
                onChange={(e) => handleConfigChange('market', 'alpha', Number(e.target.value))}
              />
            </div>
            <Slider
              axis="x"
              x={payload.market.alpha}
              disabled={isRunning}
              xmin={0.01}
              xmax={1.0}
              xstep={0.01}
              onChange={(e) => handleConfigChange('market', 'alpha', Number(e.x.toFixed(2)))}/>
          </div>
        </div>

        {/* Epsilon */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span>Exploration (<em>&epsilon;</em>)</span>
            <span className={styles.hint}>Initial rate</span>
          </label>
          <div className={styles.slider}>
            <div className={styles.sliderValue}>
              <input
                type="number"
                className={styles.input}
                value={payload.market.epsilon}
                disabled={isRunning}
                min={0.0}
                max={1.0}
                step={0.05}
                onChange={(e) => handleConfigChange('market', 'epsilon', Number(e.target.value))}
              />
            </div>
            <Slider
              axis="x"
              x={payload.market.epsilon}
              disabled={isRunning}
              xmin={0.0}
              xmax={1.0}
              xstep={0.05}
              onChange={(e) => handleConfigChange('market', 'epsilon', Number(e.x.toFixed(2)))}/>
          </div>
        </div>
      </div>

      <h3 className={styles.subTitle}>Simulation Parameters</h3>
      <div className={styles.grid}>
        {/* Episodes */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span>Episodes</span>
            <span className={styles.hint}>Total iterations</span>
          </label>
          <input
            type="number"
            className={styles.input}
            value={payload.run.episodes}
            disabled={payload.run.convergence || isRunning}
            min={100}
            step={100}
            onChange={(e) => handleConfigChange('run', 'episodes', Number(e.target.value))}
          />
        </div>

        {/* Window Size */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span>Window Size</span>
            <span className={styles.hint}>Number iterations per group</span>
          </label>
          <input
            type="number"
            className={styles.input}
            value={payload.run.window_size}
            disabled={isRunning}
            min={1}
            max={payload.run.episodes}
            step={1}
            onChange={(e) => handleConfigChange('run', 'window_size', Number(e.target.value))}
          />
        </div>

        {/* Convergence */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span>Convergence</span>
            <span className={styles.hint}>Episodes for convergence</span>
          </label>
          <div className={styles.slider}>
            <div className={styles.sliderValue}>
              <input
                type="checkbox"
                className={styles.input}
                disabled={isRunning}
                onChange={(e) => handleConfigChange('run', 'convergence', e.target.checked)}
                // onChange={() => setConvergence(prev => !prev)}
              />
            </div>
              <input
                type="number"
                className={styles.input}
                value={payload.run.converge_threshold}
                disabled={!payload.run.convergence || isRunning}
                min={1}
                max={payload.run.episodes}
                step={1}
                onChange={(e) => handleConfigChange('run', 'converge_threshold', Number(e.target.value))}
              />
          </div>
    
          
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.primaryButton}
          onClick={onRunSimulation}
          disabled={isRunning}
        >
          {isRunning ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </div>
    </div>
  );
};

// export default Controls;