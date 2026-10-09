import { ReactElement, useState } from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { ExpandableMenu } from "../ExpandableMenu";
import type { DemandTypeKey, NavTabKeys } from "../../types";

import styles from '../../App/App.module.css';
import './WelcomeView.css';

export interface QuickstartCardItem {
  title: string;
  description: string | ReactElement<any, any>;
  badge?: string;
  latexText?: string;
}

export interface WelcomeViewProps {
  marketCards?: QuickstartCardItem[];
  demandEquationCards?: QuickstartCardItem[]
  demandCards?: Record<DemandTypeKey, QuickstartCardItem[]>;
  learningCards?: QuickstartCardItem[];
  simulationCards?: QuickstartCardItem[];
}

const MARKET_COST_CARDS: QuickstartCardItem[] = [
    {
        title: "Demand Model Selection",
        badge: "Linear / Logit",
        description: "Toggle between Linear demand (direct cross-price elasticity) and Multinomial Logit (discrete choice utility with outside options)."
    },
    {
        title: "Firm Marginal Costs",
        badge: "c1, c2",
        description: "Constant marginal production costs for Firm 1 and Firm 2. Serves as the economic lower bound for sustainable competitive pricing."
    },
]
const DEMAND_EQUATION_CARDS: QuickstartCardItem[] = [
    {
        title: "Linear Demand",
        badge: "Linear",
        description: "Quantities are calculated as direct linear functions of own and rival prices.",
        latexText: "q_i = a - b\\cdot p_i + d\\cdot p_j"
    },
    {
        title: "Multinomial Logit (MNL) Demand",
        badge: "Logit",
        description:
            <>
                Market shares are computed via softmax normalization against an outside option <MathJax inline>{"\\(v_0  \\)"}</MathJax>.
            </>,
        latexText: "q_i = \\frac{e^{(v_i - \\alpha_i\\cdot p_i)/\\mu}}{e^{v_0/\\mu} + \\sum_{j=1}^{N}e^{(v_i - \\alpha_i\\cdot p_i)/\\mu}}"
    },
];

const LINEAR_DEMAND_CARDS: QuickstartCardItem[] = [
    {
        title: "Demand Intercept",
        badge: "a",
        description: "Baseline demand quantity in the Linear model when prices are zero. Defines the overall scale/size of the market."
    },
    {
        title: "Demand Slope",
        badge: "b",
        description: "Direct price responsiveness in the Linear model. Measures how much own demand falls per unit increase in own price."
    },
    {
        title: "Cross-Price Elasticity / Substitution",
        badge: "d",
        description: "Degree of product substitutability in the Linear model. Measures how much own demand increases when the competitor raises their price."
    }
];

const LOGIT_DEMAND_CARDS: QuickstartCardItem[] = [
    {
        title: "Baseline Product Qualities",
        badge: "v1, v2",
        description: "Intrinsic consumer utility or product quality for Firm 1 and Firm 2 in the Logit model, independent of price."
    },
    {
        title: "Outside Option Quality",
        badge: "v0 = 0",
        description: "Utility of the outside option (not buying from either firm), normalized to zero as a benchmark to scale market shares."
    },
    {
        title: "Price Sensitivity",
        badge: "alpha_i (α_i)",
        description: "Measures consumer sensitivity to firm i's price changes in the MNL model. Higher values mean demand drops more sharply as price increases."
    },
    {
        title: "Logit Scale / Extreme Value Variance",
        badge: "mu (μ)",
        description: "Controls unobserved consumer preference variation and product differentiation. Higher values smooth market shares, making demand less price-sensitive."
    }
];

const DEMAND_CARDS: Record<DemandTypeKey, QuickstartCardItem[]> = {
    linear: LINEAR_DEMAND_CARDS,
    logit: LOGIT_DEMAND_CARDS
}

const LEARNING_CARDS: QuickstartCardItem[] = [
    {
        title: "Learning Rate",
        badge: "alpha (α)",
        description: "Determines how aggressively agents update their Q-values or strategies based on new reward feedback. High values speed up learning but can cause instability."
    },
    {
        title: "Exploration Rate",
        badge: "epsilon (ε)",
        description: "Controls the trade-off between trying random prices (exploration) and choosing current optimal prices (exploitation). Decays over time in standard strategies."
    },
];

const SIMULATION_CARDS: QuickstartCardItem[] = [
    {
        title: "Newton-Raphson Tolerance",
        badge: "tol = 1e-8",
        description: "Controls the stopping condition for the Newton-Raphson method. The solver returns a solution when the norm of First-Order Condition (FOC) profit residuals falls below this threshold (||F(p)|| < tol), confirming a precise numerical Bertrand or Monopoly equilibrium."
    },
    {
        title: "Dynamic Price Grid Resolution",
        badge: "Dynamic Mesh",
        description: "Generates an adaptive 15×15 meshgrid that automatically rescales upper bounds to encapsulate both Bertrand and Monopoly outcomes."
    },
    {
        title: "Iteration Limit",
        badge: "max_iter = 5000",
        description: "Sets the number of iterations for the pricing algorithm to perform."
    },
    {
        title: "Window Size",
        badge: "window_size = 100",
        description: "Sets the 'bucket size' to average over for display in the chart of simulation results."
    },
    {
        title: "Convergence Threshold",
        badge: "conv_threshold = 50",
        description: "If 'Convergence' is selected, the algorithm will continue until both firms have the same optimal action for the number of iterations specified in conv_threshold."
    }
];

function CardGrid({cards}: {cards: QuickstartCardItem[]}) {
    return (
        <div className="welcome-grid">
            {cards.map((card, idx) => (
                <div 
                    key={idx} 
                    className={"welcome-card-outer"}
                >
                    <div className={'welcome-card-item'}>
                        <h4 className="welcome-card-title">
                            {card.title}
                            {card.badge && <span className="welcome-badge">{card.badge}</span>}
                        </h4>
                        <p className="welcome-card-text">{card.description}</p>
                    </div>
              </div>
            ))}
        </div>
    )
}

function DemandCardGrid({cards}: {cards: QuickstartCardItem[]}) {
    return (
        <div className="welcome-models-container">
            {cards.map((card, idx) => (
                <div 
                    key={idx}
                    className={'welcome-card-outer'}
                >
                    <div className="welcome-card-item">
                        <h4 className="welcome-card-title">
                            {card.title}
                            {card.badge && <span className="welcome-badge">{card.badge}</span>}
                        </h4>
                        <p className="welcome-card-text">{card.description}</p>
                        <code className="welcome-code-block">
                            <MathJax>
                                {`\\( ${card.latexText} \\)`}
                            </MathJax>
                        </code>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function WelcomeView({
    marketCards = MARKET_COST_CARDS,
    demandEquationCards = DEMAND_EQUATION_CARDS,
    demandCards = DEMAND_CARDS,
    learningCards = LEARNING_CARDS,
    simulationCards = SIMULATION_CARDS
}: WelcomeViewProps) {
    const [activeTab, setActiveTab] = useState<NavTabKeys>('market');

    return (
        <>
            <ExpandableMenu
                className={styles.welcomeCard}
                title={"Executive Guide & Simulation Instructions"}
                classTitle={"welcome-subtitle"}
                style={{ maxWidth: "56rem", margin: "auto" }} //TODO: condition background on expanded
                startExpanded={true}
                expandElement={
                    <>
                        {/* Tab Navigation */}
                        <div className="welcome-nav-tabs">
                            <button
                                onClick={() => setActiveTab('market')}
                                className={`welcome-tab-btn ${activeTab === 'market' ? 'active' : ''}`}
                            >
                                Market & Costs
                            </button>
                            <button
                                onClick={() => setActiveTab('demand-parameters')}
                                className={`welcome-tab-btn ${activeTab === 'demand-parameters' ? 'active' : ''}`}
                            >
                                Demand Parameters
                            </button>
                            <button
                                onClick={() => setActiveTab('learning-simulation')}
                                className={`welcome-tab-btn ${activeTab === 'learning-simulation' ? 'active' : ''}`}
                            >
                                Learning & Simulation
                            </button>
                            <button
                                onClick={() => setActiveTab('show-all')}
                                className={`welcome-tab-btn ${activeTab === 'show-all' ? 'active' : ''}`}
                            >
                                Show All
                            </button>
                        </div>

                        {/* Tab 1: Market & Cost Inputs */}
                        {(activeTab === 'market' || activeTab === 'show-all') && (
                            <MathJaxContext>
                                <h3 className="welcome-section-heading">Market & Cost Inputs</h3>
                                <CardGrid cards={marketCards}/>
                                <DemandCardGrid cards={demandEquationCards}/>
                            </MathJaxContext>
                        )}

                        {/* Tab 2: Demand Parameters */}
                        {(activeTab === 'demand-parameters' || activeTab === 'show-all') && (
                            <div>
                                <h3 className="welcome-section-heading">Demand Parameters</h3>
                                <h4 className="welcome-section-subheading">Linear Demand</h4>
                                <CardGrid cards={demandCards['linear']}/>

                                <h4 className="welcome-section-subheading">Logit Demand</h4>
                                <CardGrid cards={demandCards['logit']}/>
                            </div>
                        )}

                        {/* Tab 3: Learning & Simulation Parameters */}
                        {(activeTab === 'learning-simulation' || activeTab === 'show-all') && (
                            <div>
                                {/* Learning Parameters */}
                                <h3 className="welcome-section-heading">Learning Parameters</h3>
                                <CardGrid cards={learningCards}/>

                                {/* Simulation & Convergence Parameters */}
                                <h3 className="welcome-section-heading">Simulation & Solver Parameters</h3>
                                <CardGrid cards={simulationCards}/>
                            </div>
                        )}
                    </>
                }
            />
        </>
    );
};
