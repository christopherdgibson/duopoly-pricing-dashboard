import { InputsForm } from './InputsForm';
import type { CardInputs, DemandProps, LogitDemandInputs } from '../../../types';

type LogitControlKeys = Exclude<keyof LogitDemandInputs, 'type' | 'outside_utility' |'nesting_parameter'>
const LOGIT_KEYS: LogitControlKeys[] = ['quality_1', 'quality_2', 'price_sensitivity', 'logit_scale'];

const LOGIT_CARDS: Record<LogitControlKeys, CardInputs> = {
  quality_1: {
    title: "Firm 1 Quality",
    latex: 'v_1',
    hint: "Utility relative to v0",
    min: 0,
    max: 10,
    step: 0.1
  },
  quality_2: {
    title: "Firm 2 Quality",
    latex: 'v_2',
    hint: "Utility relative to v0",
    min: 0,
    max: 10,
    step: 0.1
  },
  price_sensitivity: {
    title: "Price Sensitivity",
    latex: '\\alpha',
    min: 0.1,
    max: 5.0,
    step: 0.1
  },
  logit_scale: {
    title: "Logit Scale",
    latex: '\\mu',
    hint: "Product differentiation",
    min: 0.1,
    max: 5.0,
    step: 0.1
  }
};

export function LogitInputsForm({ inputs, updateDemandConfig, isRunning }: DemandProps<LogitDemandInputs>) {
  return (
    <InputsForm<Omit<LogitDemandInputs, 'type' | 'outside_utility' | 'nesting_parameter'>>
      inputKeys={LOGIT_KEYS}
      cards={LOGIT_CARDS}
      inputs={inputs}
      updateDemandConfig={updateDemandConfig}
      isRunning={isRunning}
    />
  );
}
