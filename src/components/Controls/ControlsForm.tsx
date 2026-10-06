import { useState } from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import styles from '../../App/App.module.css';
import { LinearInputsForm } from './DemandForms/LinearInputsForm';
import type { ControlsBase, DemandInputs, DemandInputsMap, LinearDemandInputs, DemandTypeKey, SimulationPayload } from '../../types';

export interface ControlsProps extends ControlsBase {
  payload: SimulationPayload;
  onChange: (updatedParams: SimulationPayload) => void;
  handleModelTypeChange: (newModel: "linear" | "logit") => void
  onRunSimulation: () => void;
}

export default function Controls({payload, handleModelTypeChange, onChange, onRunSimulation, isRunning}: ControlsProps) {
  const [asymmetricCost, setAsymmetricCost] = useState<boolean>(false);
  const demandInputs: DemandInputs = payload.market.demand_inputs;

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

  const handleCostChange = (value: number) => {
    onChange({
      ...payload,
      market: {
        ...payload.market,
        marginal_cost_1: value,
        // If symmetric, automatically sync cost 2 to cost 1
        ...(!asymmetricCost && { marginal_cost_2: value }),
      },
    });
  };

  const handleDemandChange = <F extends keyof DemandInputsMap[typeof payload.market.demand_type]>(
    field: F,
    value: number
  ) => {
    onChange({
      ...payload,
      market: {
        ...payload.market,
        demand_inputs: {
          ...payload.market.demand_inputs,
          [field]: value,
        },
      } as typeof payload.market, // Cast ensures TS knows the union shape remains intact
    });
  };

  const toggleAsymmetricCost = (checked:boolean) => {
    setAsymmetricCost(checked);
    if (!checked) {
      handleConfigChange('market', 'marginal_cost_2', payload.market.marginal_cost_1)
    }
  };

  return (
    <MathJaxContext>
      <div className={styles.controlsCard}>
        <div className={styles.header}>
          <h2 className={styles.title}>Model Parameters</h2>
          <span className={styles.badge}>Q-Learning Duopoly</span>
        </div>
        <h3 className={styles.subTitle}>Market Demand</h3>
        <div className={styles.grid}>
          {/* Market Demand */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Demand Curve (<em>q</em>)</span>
              <span className={styles.hint}>Firm Demand</span>
            </label>
            <select
              className={styles.input}
              value={payload.market.demand_type}
              // disabled={isRunning}
              disabled={true}
              onChange={(e) => handleModelTypeChange(e.target.value as DemandTypeKey)}
              // onChange={(e) => handleConfigChange('market', 'demand_type', e.target.value as DemandTypeKey)}
            >
              <option value={'linear'}>Linear Demand</option>
              <option value={'logit'}>Logit Demand</option>
            </select>
          </div>
          <div className={styles.selectedDropdown}>
            {payload.market.demand_type === 'linear' && 
              <MathJax>
                {"\\(q_i = a - b\\cdot p_i + d\\cdot p_j\\)"}
              </MathJax>
            }
            {payload.market.demand_type === 'logit' && 
              <MathJax>
                {"\\(q_i = \\frac{e^{\\frac{a_i - p_i}{\\mu}}}{1 + \\sum_{j=1}^{N}e^{\\frac{a_j - p_j}{\\mu}}}  \\)"}
              </MathJax>
            }
          </div>
        </div>
        <h3 className={styles.subTitle}>Demand Parameters</h3>
        {demandInputs && demandInputs.type=='linear' && <LinearInputsForm inputs={demandInputs} updateDemandConfig={(field, value) => handleDemandChange(field as keyof typeof payload.market.demand_inputs, value)} isRunning={isRunning} />}

        {/* Marginal Cost */}
        <h3 className={styles.subTitle}>Cost Parameters</h3>
        <div className={styles.flexGrid}>        
          <div className={`${styles.fieldGroup} ${styles.flexGroup}`}>
            <label className={styles.label}>
              <span>Marginal Cost 1 <MathJax inline={true}>({"\\(c_1  \\)"})</MathJax></span>
              <span className={styles.hint}>Firm 1 unit cost</span>
            </label>
            <input
              type="number"
              className={styles.input}
              min={0}
              value={payload.market.marginal_cost_1}
              disabled={isRunning}
              onChange={(e) => handleCostChange(Number(e.target.value))}
            />
          </div>

          <div className={`${styles.fieldGroup} ${styles.shrinkGroup}`}>
            <label className={styles.label}>
              <span>Asymmetric?</span>
            </label>
            <div className={styles.inputLeft}>
            <input 
                  type="checkbox"
                  className={styles.input}
                  disabled={isRunning}
                  onChange={(e) => toggleAsymmetricCost(e.target.checked)}
                />
          </div>
          </div>
          <div className={`${styles.fieldGroup} ${styles.flexGroup}`}>
            <label className={styles.label}>
              <span>Marginal Cost 2 <MathJax inline={true}>({"\\(c_2  \\)"})</MathJax></span>
              <span className={styles.hint}>Firm 2 unit cost</span>
            </label>
                <input
                  type="number"
                  className={styles.input}
                  min={0}
                  value={payload.market.marginal_cost_2}
                  disabled={!asymmetricCost || isRunning}
                  onChange={(e) => handleConfigChange('market', 'marginal_cost_2', Number(e.target.value))}
                />
          </div>
        </div>

        <h3 className={styles.subTitle}>Learning Parameters</h3>
        <div className={styles.grid}>
          {/* Learning Rate (Alpha) */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Learning Rate (<em>&alpha;</em>)</span>
              <span className={styles.hint}>0.01 - 1.0</span>
            </label>
            <div className={styles.inputGroup}>
              <div className={styles.inputLeft}>
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
              <input
                className={styles.inputSlider}
                type="range"
                value={payload.market.alpha}
                min={0.01}
                max={1.0}
                step={0.01}
                onChange={(e) => handleConfigChange('market', 'alpha', Number(parseFloat(e.target.value).toFixed(2)))} />
            </div>
          </div>

          {/* Epsilon */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Exploration (<em>&epsilon;</em>)</span>
              <span className={styles.hint}>Initial rate</span>
            </label>
            <div className={styles.inputGroup}>
              <div className={styles.inputLeft}>
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
              <input
                className={styles.inputSlider}
                type="range"
                value={payload.market.epsilon}
                disabled={isRunning}
                min={0.0}
                max={1.0}
                step={0.05}
                onChange={(e) => handleConfigChange('market', 'epsilon', Number(parseFloat(e.target.value).toFixed(2)))}/>
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
            <div className={styles.inputGroup}>
              <div className={styles.inputLeft}>
                <input
                  type="checkbox"
                  className={styles.input}
                  disabled={isRunning}
                  onChange={(e) => handleConfigChange('run', 'convergence', e.target.checked)}
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
    </MathJaxContext>
  );
};

// export default Controls;