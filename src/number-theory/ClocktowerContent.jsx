import { t } from '../i18n/react';
import { Notebook, PrinciplePages } from '../notebook/Notebook';
import { observe, period } from './math.js';
import '../expansion/expansion.css';

export function ClocktowerContent({ level, game, engine, open, paperOpen }) {
  const x = game.x ?? level.start;
  const energy = game.energy ?? 0;
  const busy = game.walking || game.camera?.busy;
  const dials = observe(level, x);
  const divisor = game.divisor;
  const canCompare = divisor && dials.every(({ n }) => n % divisor === 0);

  return <div className="notebook-host" inert={!paperOpen}>
    <Notebook className="expansion-notebook clocktower-notebook"
      kicker={`${t('第五章')} · ${level.displayId}`} goal={level.goal} resetKey={level.id}
      feedbackKey={game.tested ? game.feedback : ''}
      action={() => engine.current?.test()} actionLabel={t('提交余数证据')}
      disabled={busy} onPrinciple={() => open('principle')}
      stats={<><span><b>x = {x}</b></span><i/><span><b>{energy} / {level.budget}</b></span></>}
      observe={
        <article className="notebook-leaf">
          {game.tested && game.feedback && <p className="clocktower-feedback" role="status">{t(game.feedback)}</p>}
          <h3>{t('转动钟盘')}</h3>
          <p className="notebook-quiet">x = 0, …, {period(level) - 1}</p>
          <div className="expansion-controls">
            {level.actions.map(amount => <button key={amount} data-clock-jump={amount}
              disabled={busy || energy >= level.budget} onClick={() => engine.current?.act('jump', amount)}>
              {amount > 0 ? `+${amount}` : `−${-amount}`}
            </button>)}
          </div>
          <h3>{t('当前余数 → 目标余数')}</h3>
          {dials.map(({ n, residue, target, matches }) => <p className="notebook-formula" key={n}>
            mod {n}: {residue} → {target} {matches ? '✓' : '○'}
          </p>)}
          {level.divisors && <div className="clocktower-proof">
            <h3>{t('选择公因数')}</h3>
            <div className="expansion-controls">
              {level.divisors.map(value => <button key={value} data-clock-divisor={value}
                disabled={busy} aria-pressed={divisor === value} onClick={() => engine.current?.act('divisor', value)}>{value}</button>)}
            </div>
            {canCompare ? <p className="notebook-formula">
              {level.residues[0] % divisor} {level.residues[0] % divisor === level.residues[1] % divisor ? '=' : '≠'} {level.residues[1] % divisor} (mod {divisor})
            </p> : divisor ? <p>{t('请选择一个能整除两个模数的数。')}</p> : null}
          </div>}
        </article>
      }
      prove={<PrinciplePages principles={level.principles}/>}
    />
  </div>;
}
