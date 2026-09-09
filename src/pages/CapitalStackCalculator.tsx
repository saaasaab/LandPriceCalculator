import { Link } from 'react-router-dom';
import { usePersistedState2 } from '../hooks/usePersistedState';
import { EAllStates, EPageNames } from '../utils/types';
import { DEFAULT_VALUES } from '../utils/constants';
import { formatNumberWithCommas, removeCommas, roundAndLocalString, roundToDecimal } from '../utils/utils';
import { routes } from '../config/routes';
import ShareButton from '../components/ShareButton';
import InputRow from '../components/RowTypes/InputRow';
import OutputRow from '../components/RowTypes/OutputRow';
import './DynamicTable.scss';
import './CapitalStackCalculator.scss';

const formatPercentInput = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) return '0';
    return String(roundToDecimal(value, 2));
};

const amountFromPercent = (total: number, percentValue: string) => {
    const percent = removeCommas(percentValue);
    return formatNumberWithCommas(Math.round(total * percent / 100));
};

const payClaim = (remaining: number, claim: number) => {
    const paid = Math.min(Math.max(remaining, 0), Math.max(claim, 0));
    return {
        paid,
        unpaid: Math.max(claim - paid, 0),
        remaining: remaining - paid,
    };
};

const CapitalStackCalculator = ({ isMobile, page }: { isMobile: boolean; page: EPageNames; }) => {
    const queryParams = new URLSearchParams(window.location.search);
    const defaults = DEFAULT_VALUES[page];

    const [totalCapital, setTotalCapital] = usePersistedState2(page, EAllStates.capitalStackTotal, defaults.capitalStackTotal, queryParams);
    const [seniorAmount, setSeniorAmount] = usePersistedState2(page, EAllStates.seniorDebtAmount, defaults.seniorDebtAmount, queryParams);
    const [seniorRate, setSeniorRate] = usePersistedState2(page, EAllStates.seniorDebtRate, defaults.seniorDebtRate, queryParams);
    const [mezzanineEnabled, setMezzanineEnabled] = usePersistedState2(page, EAllStates.mezzanineEnabled, defaults.mezzanineEnabled, queryParams);
    const [mezzanineAmount, setMezzanineAmount] = usePersistedState2(page, EAllStates.mezzanineAmount, defaults.mezzanineAmount, queryParams);
    const [mezzanineRate, setMezzanineRate] = usePersistedState2(page, EAllStates.mezzanineRate, defaults.mezzanineRate, queryParams);
    const [preferredEnabled, setPreferredEnabled] = usePersistedState2(page, EAllStates.preferredEnabled, defaults.preferredEnabled, queryParams);
    const [preferredAmount, setPreferredAmount] = usePersistedState2(page, EAllStates.preferredAmount, defaults.preferredAmount, queryParams);
    const [preferredRate, setPreferredRate] = usePersistedState2(page, EAllStates.preferredRate, defaults.preferredRate, queryParams);
    const [noi, setNoi] = usePersistedState2(page, EAllStates.noi, defaults.noi, queryParams);

    const total = removeCommas(totalCapital);
    const senior = Math.max(removeCommas(seniorAmount), 0);
    const mezzOn = mezzanineEnabled === 'true';
    const prefOn = preferredEnabled === 'true';
    const mezz = mezzOn ? Math.max(removeCommas(mezzanineAmount), 0) : 0;
    const pref = prefOn ? Math.max(removeCommas(preferredAmount), 0) : 0;
    const allocated = senior + mezz + pref;
    const overage = Math.max(allocated - total, 0);
    const common = Math.max(total - allocated, 0);
    const hasOverage = overage > 0.5;

    const pct = (amount: number) => (total > 0 ? (amount / total) * 100 : 0);
    const seniorPct = pct(senior);
    const mezzPct = pct(mezz);
    const prefPct = pct(pref);
    const commonPct = pct(common);

    const seniorCoupon = senior * removeCommas(seniorRate) / 100;
    const mezzCoupon = mezz * removeCommas(mezzanineRate) / 100;
    const prefCoupon = pref * removeCommas(preferredRate) / 100;
    const paidAmount = senior + mezz + pref;
    const paidCost = seniorCoupon + mezzCoupon + prefCoupon;
    const weightedPaidCost = paidAmount > 0 ? paidCost / paidAmount : 0;

    const annualNoi = removeCommas(noi);
    const seniorPay = payClaim(annualNoi, seniorCoupon);
    const mezzPay = payClaim(seniorPay.remaining, mezzCoupon);
    const prefPay = payClaim(mezzPay.remaining, prefCoupon);
    const residualToCommon = Math.max(prefPay.remaining, 0);
    const seniorShortfall = seniorPay.unpaid;

    const bands = [
        common > 0 ? { id: 'common', name: 'Common equity', amount: common, percent: commonPct, rateLabel: 'Residual', tone: 'common' } : null,
        pref > 0 ? { id: 'pref', name: 'Preferred equity', amount: pref, percent: prefPct, rateLabel: `${formatPercentInput(removeCommas(preferredRate))}%`, tone: 'pref' } : null,
        mezz > 0 ? { id: 'mezz', name: 'Mezzanine debt', amount: mezz, percent: mezzPct, rateLabel: `${formatPercentInput(removeCommas(mezzanineRate))}%`, tone: 'mezz' } : null,
        senior > 0 ? { id: 'senior', name: 'Senior debt', amount: senior, percent: seniorPct, rateLabel: `${formatPercentInput(removeCommas(seniorRate))}%`, tone: 'senior' } : null,
    ].filter((band): band is NonNullable<typeof band> => Boolean(band));

    const params = {
        capitalStackTotal: totalCapital,
        seniorDebtAmount: seniorAmount,
        seniorDebtRate: seniorRate,
        mezzanineEnabled,
        mezzanineAmount,
        mezzanineRate,
        preferredEnabled,
        preferredAmount,
        preferredRate,
        noi,
    };

    return (
        <div className="capital-stack">
            <div className="capital-stack-layout">
                <div className="group-section capital-stack-inputs">
                    <div className="input-fields-container has-bottom-border">
                        <div className="input-grouping">Deal size</div>
                        <InputRow
                            isMobile={isMobile}
                            setInput={setTotalCapital}
                            cellValues={['Total capitalization ($)', totalCapital]}
                            description="Purchase price or total project cost the stack must fund"
                        />
                        <InputRow
                            isMobile={isMobile}
                            setInput={setNoi}
                            cellValues={['Annual NOI ($)', noi]}
                            description="Optional. Used to walk cash down the stack after each layer's annual claim"
                        />

                        <div className="input-grouping">Senior debt</div>
                        <InputRow
                            isMobile={isMobile}
                            setInput={setSeniorAmount}
                            cellValues={['Senior debt ($)', seniorAmount]}
                            description="First-lien mortgage or senior loan. Paid first, usually the lowest rate"
                        />
                        <InputRow
                            isMobile={isMobile}
                            isPercent
                            setInput={(value) => setSeniorAmount(amountFromPercent(total, value))}
                            cellValues={['Senior debt (%)', formatPercentInput(seniorPct)]}
                            description="Share of total capitalization"
                        />
                        <InputRow
                            isMobile={isMobile}
                            isPercent
                            setInput={setSeniorRate}
                            cellValues={['Senior coupon (%)', seniorRate]}
                            description="Annual interest rate on senior debt"
                        />

                        <div className="input-grouping">
                            <label className="capital-stack-toggle">
                                <input
                                    type="checkbox"
                                    checked={mezzOn}
                                    onChange={(event) => setMezzanineEnabled(event.target.checked ? 'true' : 'false')}
                                />
                                Mezzanine debt
                            </label>
                        </div>
                        {mezzOn ? (
                            <>
                                <InputRow
                                    isMobile={isMobile}
                                    setInput={setMezzanineAmount}
                                    cellValues={['Mezzanine debt ($)', mezzanineAmount]}
                                    description="Optional middle-layer debt. Paid after senior debt"
                                />
                                <InputRow
                                    isMobile={isMobile}
                                    isPercent
                                    setInput={(value) => setMezzanineAmount(amountFromPercent(total, value))}
                                    cellValues={['Mezzanine debt (%)', formatPercentInput(mezzPct)]}
                                    description="Share of total capitalization"
                                />
                                <InputRow
                                    isMobile={isMobile}
                                    isPercent
                                    setInput={setMezzanineRate}
                                    cellValues={['Mezzanine coupon (%)', mezzanineRate]}
                                    description="Annual interest rate on mezzanine debt"
                                />
                            </>
                        ) : null}

                        <div className="input-grouping">
                            <label className="capital-stack-toggle">
                                <input
                                    type="checkbox"
                                    checked={prefOn}
                                    onChange={(event) => setPreferredEnabled(event.target.checked ? 'true' : 'false')}
                                />
                                Preferred equity
                            </label>
                        </div>
                        {prefOn ? (
                            <>
                                <InputRow
                                    isMobile={isMobile}
                                    setInput={setPreferredAmount}
                                    cellValues={['Preferred equity ($)', preferredAmount]}
                                    description="Equity with a stated return, paid after debt and before common equity"
                                />
                                <InputRow
                                    isMobile={isMobile}
                                    isPercent
                                    setInput={(value) => setPreferredAmount(amountFromPercent(total, value))}
                                    cellValues={['Preferred equity (%)', formatPercentInput(prefPct)]}
                                    description="Share of total capitalization"
                                />
                                <InputRow
                                    isMobile={isMobile}
                                    isPercent
                                    setInput={setPreferredRate}
                                    cellValues={['Preferred return (%)', preferredRate]}
                                    description="Annual preferred return before common equity is paid"
                                />
                            </>
                        ) : null}

                        <div className="input-grouping">Common equity (residual)</div>
                        <div className="input-row is-greyed-out">
                            <div className="info-cell">
                                <h4>Common equity ($)</h4>
                                <div className="description-cell is-visible">
                                    Whatever remains after senior, mezzanine, and preferred layers
                                </div>
                            </div>
                            <div className="input-cell">
                                <span className="capital-stack-residual">{hasOverage ? '—' : `$${roundAndLocalString(common)}`}</span>
                            </div>
                        </div>
                        <div className="input-row is-greyed-out">
                            <div className="info-cell">
                                <h4>Common equity (%)</h4>
                            </div>
                            <div className="input-cell">
                                <span className="capital-stack-residual">{hasOverage ? '—' : `${formatPercentInput(commonPct)}%`}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="capital-stack-visual" aria-label="Capital stack diagram">
                    <div className="capital-stack-visual-header">
                        <h2>Capital stack</h2>
                        <p>Last paid at the top. First paid at the bottom.</p>
                    </div>

                    {hasOverage ? (
                        <p className="capital-stack-warning" role="alert">
                            Layers total ${roundAndLocalString(allocated)}, which is ${roundAndLocalString(overage)} over capitalization. Reduce a layer so the stack fits the deal.
                        </p>
                    ) : null}

                    <div className="capital-stack-bands">
                        {bands.length === 0 ? (
                            <div className="capital-stack-band capital-stack-band--empty">
                                <div className="capital-stack-band-name">No layers yet</div>
                                <div className="capital-stack-band-meta">Enter a total and at least one layer to draw the stack.</div>
                            </div>
                        ) : null}
                        {bands.map((band) => (
                            <div
                                key={band.id}
                                className={`capital-stack-band capital-stack-band--${band.tone}${band.percent < 12 ? ' is-compact' : ''}`}
                                style={{ flexGrow: band.amount, flexShrink: 0, flexBasis: 0 }}
                            >
                                <div className="capital-stack-band-name">{band.name}</div>
                                <div className="capital-stack-band-meta">
                                    ${roundAndLocalString(band.amount)} · {formatPercentInput(band.percent)}% · {band.rateLabel}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

            <div className="group-section">
                <div className="output-fields-container">
                    <OutputRow
                        isMobile={isMobile}
                        cellValues={['LTV', `${formatPercentInput(seniorPct)}%`]}
                        description="Senior debt divided by total capitalization"
                    />
                    <OutputRow
                        isMobile={isMobile}
                        cellValues={['Total leverage', `${formatPercentInput(pct(senior + mezz))}%`]}
                        description="Senior plus mezzanine debt divided by total capitalization"
                    />
                    <OutputRow
                        isMobile={isMobile}
                        cellValues={['Equity', `${formatPercentInput(pct(pref + common))}%`]}
                        description="Preferred plus common equity as a share of total capitalization"
                    />
                    <OutputRow
                        isMobile={isMobile}
                        cellValues={['Weighted cost of paid layers', `${formatPercentInput(weightedPaidCost * 100)}%`]}
                        description="Amount-weighted coupon on senior, mezzanine, and preferred layers. Common equity is residual, not a stated coupon."
                    />
                    {annualNoi > 0 ? (
                        <>
                            <OutputRow
                                isMobile={isMobile}
                                cellValues={['Senior annual claim', `$${roundAndLocalString(seniorPay.paid)}`]}
                                description={seniorShortfall > 0
                                    ? `NOI covers this layer first. Shortfall of $${roundAndLocalString(seniorShortfall)}.`
                                    : 'Annual interest claim on senior debt, paid from NOI first'}
                            />
                            {mezzOn ? (
                                <OutputRow
                                    isMobile={isMobile}
                                    cellValues={['Mezzanine annual claim', `$${roundAndLocalString(mezzPay.paid)}`]}
                                    description={mezzPay.unpaid > 0
                                        ? `Unpaid claim of $${roundAndLocalString(mezzPay.unpaid)} after senior debt.`
                                        : 'Paid after senior debt from remaining NOI'}
                                />
                            ) : null}
                            {prefOn ? (
                                <OutputRow
                                    isMobile={isMobile}
                                    cellValues={['Preferred annual claim', `$${roundAndLocalString(prefPay.paid)}`]}
                                    description={prefPay.unpaid > 0
                                        ? `Unpaid claim of $${roundAndLocalString(prefPay.unpaid)} after debt.`
                                        : 'Paid after debt from remaining NOI'}
                                />
                            ) : null}
                            <OutputRow
                                isMobile={isMobile}
                                cellValues={['Residual cash to common', `$${roundAndLocalString(residualToCommon)}`]}
                                description="NOI left after every stated claim above common equity"
                            />
                        </>
                    ) : null}
                </div>

                <p className="capital-stack-note">
                    This tool shows how the deal is funded. For GP and LP profit splits after preferred return hurdles, use the{' '}
                    <Link to={routes.WATERFALL}>waterfall distribution calculator</Link>.
                </p>

                <ShareButton params={params} />
            </div>
        </div>
    );
};

export default CapitalStackCalculator;
