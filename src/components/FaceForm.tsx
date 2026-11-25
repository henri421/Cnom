import React from 'react';
import { Info, TriangleAlert } from 'lucide-react';
import { CLASSES_RESISTANCE } from '../engine';
import {
  ABRASIONS,
  AMBIANCES_XC,
  CONTRE_TERRAIN,
  MODES_XD,
  NIVEAUX_DCDEV,
  Option,
  POSITIONS_FACE,
  TYPES_ELEMENT,
} from '../libelles';
import { parametres } from '../parametres-nationaux';
import {
  ElementBeton,
  ExpositionFace,
  FaceBeton,
  JeuParametres,
  NiveauDeltaCDev,
  ResultatFace,
} from '../types';

interface Props {
  element: ElementBeton;
  face: FaceBeton;
  resultat: ResultatFace;
  jeuParametres: JeuParametres;
  onChangeElement: (el: ElementBeton) => void;
  onChangeFace: (f: FaceBeton) => void;
}

const champ =
  'w-full text-sm px-2.5 py-1.5 bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-zinc-900';

// ---------------------------------------------------------------- briques

const Section: React.FC<{ titre: string; reference?: string; children: React.ReactNode }> = ({
  titre,
  reference,
  children,
}) => (
  <section className="bg-white border border-zinc-200 rounded-lg p-4">
    <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-zinc-100">
      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">{titre}</h3>
      {reference && <span className="text-[10px] font-mono text-zinc-400">{reference}</span>}
    </div>
    <div className="space-y-3">{children}</div>
  </section>
);

const Aide: React.FC<{ texte: string }> = ({ texte }) => (
  <span title={texte} className="inline-flex align-middle ml-1 text-zinc-400 cursor-help">
    <Info className="w-3.5 h-3.5" />
  </span>
);

const Case: React.FC<{
  coche: boolean;
  onChange: (v: boolean) => void;
  libelle: string;
  aide?: string;
  reference?: string;
}> = ({ coche, onChange, libelle, aide, reference }) => (
  <label className="flex items-start gap-2 cursor-pointer" title={aide}>
    <input type="checkbox" className="mt-0.5" checked={coche} onChange={(e) => onChange(e.target.checked)} />
    <span className="text-xs">
      <span className="font-semibold text-zinc-800">{libelle}</span>
      {reference && <span className="ml-1 text-[10px] font-mono text-zinc-400">{reference}</span>}
      {aide && <span className="block text-[11px] text-zinc-500">{aide}</span>}
    </span>
  </label>
);

function Choix<T extends string>({
  options,
  valeur,
  onChange,
  nom,
}: {
  options: Option<T>[];
  valeur: T;
  onChange: (v: T) => void;
  nom: string;
}) {
  return (
    <div className="space-y-1">
      {options.map((o) => (
        <label key={o.valeur} className="flex items-start gap-2 cursor-pointer" title={o.aide}>
          <input
            type="radio"
            name={nom}
            className="mt-0.5"
            checked={valeur === o.valeur}
            onChange={() => onChange(o.valeur)}
          />
          <span className="text-xs">
            <span className="font-medium text-zinc-800">{o.libelle}</span>
            {o.aide && <span className="block text-[11px] text-zinc-500">{o.aide}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}

const Nombre: React.FC<{
  libelle: string;
  valeur: number | null;
  onChange: (v: number | null) => void;
  unite?: string;
  aide?: string;
  min?: number;
  max?: number;
  step?: number;
  vide?: boolean;
}> = ({ libelle, valeur, onChange, unite, aide, min, max, step = 1, vide = false }) => (
  <label className="block text-xs font-semibold text-zinc-700">
    {libelle}
    {aide && <Aide texte={aide} />}
    <div className="flex items-center gap-1">
      <input
        type="number"
        className={`${champ} font-mono`}
        value={valeur ?? ''}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange(Number.isFinite(v) ? v : vide ? null : (min ?? 0));
        }}
      />
      {unite && <span className="text-[11px] text-zinc-500">{unite}</span>}
    </div>
  </label>
);

// ---------------------------------------------------------------- formulaire

export const FaceForm: React.FC<Props> = ({ element, face, resultat, jeuParametres, onChangeElement, onChangeFace }) => {
  const p = parametres(jeuParametres);
  const maj = <K extends keyof FaceBeton>(k: K, v: FaceBeton[K]) => onChangeFace({ ...face, [k]: v });
  const majExpo = <F extends keyof ExpositionFace>(famille: F, v: Partial<ExpositionFace[F]>) =>
    onChangeFace({ ...face, exposition: { ...face.exposition, [famille]: { ...face.exposition[famille], ...v } } });
  const expo = face.exposition;
  const s = resultat.structurales.find((x) => x.classe === resultat.enrobage.classeDeterminante);

  const plageDev =
    face.deltaCDev.niveau === 'assurance_qualite'
      ? p.deltaCDev.assuranceQualite
      : face.deltaCDev.niveau === 'mesure_rejet'
        ? p.deltaCDev.mesureRejet
        : null;

  return (
    <div className="space-y-4">
      {/* 1. Identification */}
      <Section titre="1. Identification">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-zinc-700">
            Élément
            <input
              className={champ}
              value={element.nom}
              placeholder="Ex. : Voile V12 axe B"
              onChange={(e) => onChangeElement({ ...element, nom: e.target.value })}
            />
          </label>
          <label className="block text-xs font-semibold text-zinc-700">
            Type d’élément
            <Aide texte="Le type sert à l’identification ; il n’impose plus la minoration de dalle (question explicite à l’étape 4)." />
            <select
              className={champ}
              value={element.typeElement}
              onChange={(e) => onChangeElement({ ...element, typeElement: e.target.value as ElementBeton['typeElement'] })}
            >
              {TYPES_ELEMENT.map((t) => (
                <option key={t.valeur} value={t.valeur}>
                  {t.libelle}
                </option>
              ))}
            </select>
          </label>
          {element.typeElement === 'autre' && (
            <label className="block text-xs font-semibold text-zinc-700">
              Type (libellé libre)
              <input
                className={champ}
                value={element.typeAutre}
                onChange={(e) => onChangeElement({ ...element, typeAutre: e.target.value })}
              />
            </label>
          )}
          <label className="block text-xs font-semibold text-zinc-700">
            Face
            <select
              className={champ}
              value={face.position}
              onChange={(e) => maj('position', e.target.value as FaceBeton['position'])}
            >
              {POSITIONS_FACE.map((t) => (
                <option key={t.valeur} value={t.valeur}>
                  {t.libelle}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-zinc-700">
            Repère de la face (facultatif)
            <input
              className={champ}
              value={face.repere}
              placeholder="Ex. : niveau -1, zone rampe"
              onChange={(e) => maj('repere', e.target.value)}
            />
          </label>
        </div>
      </Section>

      {/* 2. Exposition */}
      <Section titre="2. Exposition" reference="EN 206, tableaux 1 et 2">
        <p className="text-[11px] text-zinc-500">
          Cocher toutes les familles qui s’appliquent simultanément à la face. Sans famille cochée, la face est en X0.
        </p>

        <div className="border border-zinc-200 rounded-md p-3">
          <Case
            coche={expo.xc.actif}
            onChange={(v) => majExpo('xc', { actif: v })}
            libelle="XC : corrosion induite par carbonatation"
            aide="Tout béton armé exposé à l’air et à l’humidité. Ex. : toute face d’un élément en béton armé, sauf ambiance très sèche (X0)."
          />
          {expo.xc.actif && (
            <div className="mt-2 ml-6">
              <Choix nom={`xc-${face.id}`} options={AMBIANCES_XC} valeur={expo.xc.ambiance} onChange={(v) => majExpo('xc', { ambiance: v })} />
            </div>
          )}
        </div>

        <div className="border border-zinc-200 rounded-md p-3">
          <Case
            coche={expo.xd.actif}
            onChange={(v) => majExpo('xd', { actif: v })}
            libelle="XD : corrosion induite par les chlorures (hors eau de mer)"
            aide="Sels de déverglaçage, eaux chlorurées. Ex. : parking, rampe, abords de voirie salée, piscine."
          />
          {expo.xd.actif && (
            <div className="mt-2 ml-6">
              <Choix nom={`xd-${face.id}`} options={MODES_XD} valeur={expo.xd.mode} onChange={(v) => majExpo('xd', { mode: v })} />
            </div>
          )}
        </div>

        <div className="border border-zinc-200 rounded-md p-3">
          <Case
            coche={expo.xf.actif}
            onChange={(v) => majExpo('xf', { actif: v })}
            libelle="XF : attaque gel-dégel"
            aide="Face extérieure exposée au gel en étant humide. Ex. : façade, acrotère, dalle extérieure."
          />
          {expo.xf.actif && (
            <div className="mt-2 ml-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] font-semibold text-zinc-600 mb-1">Saturation en eau</div>
                <Choix
                  nom={`xf-sat-${face.id}`}
                  options={[
                    { valeur: 'moderee', libelle: 'Modérée', aide: 'Surfaces verticales exposées à la pluie.' },
                    { valeur: 'forte', libelle: 'Forte', aide: 'Surfaces horizontales où l’eau stagne ; zones de projection.' },
                  ]}
                  valeur={expo.xf.saturation}
                  onChange={(v) => majExpo('xf', { saturation: v })}
                />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-zinc-600 mb-1">Agents de déverglaçage</div>
                <Case
                  coche={expo.xf.deverglacage}
                  onChange={(v) => majExpo('xf', { deverglacage: v })}
                  libelle="Présence de sels de déverglaçage"
                  aide="Projections ou application directe. Sans sel : XF1/XF3 ; avec sel : XF2/XF4."
                />
              </div>
            </div>
          )}
        </div>

        <div className="border border-zinc-200 rounded-md p-3">
          <Case
            coche={expo.xa.actif}
            onChange={(v) => majExpo('xa', { actif: v })}
            libelle="XA : attaque chimique (sol, eaux souterraines)"
            aide="Sur la base d’une analyse du sol ou de l’eau. Ex. : fondation dans un sol gypseux, eaux séléniteuses."
          />
          {expo.xa.actif && (
            <div className="mt-2 ml-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Nombre
                libelle="SO4²⁻ dans l’eau"
                unite="mg/l"
                vide
                min={0}
                valeur={expo.xa.so4EauMgL}
                onChange={(v) => majExpo('xa', { so4EauMgL: v })}
                aide="XA1 de 200 à 600, XA2 jusqu’à 3000, XA3 au-delà (EN 206 tableau 2)."
              />
              <Nombre
                libelle="SO4²⁻ dans le sol"
                unite="mg/kg"
                vide
                min={0}
                valeur={expo.xa.so4SolMgKg}
                onChange={(v) => majExpo('xa', { so4SolMgKg: v })}
                aide="XA1 de 2000 à 3000, XA2 jusqu’à 12000, XA3 au-delà (EN 206 tableau 2)."
              />
              <div className="sm:col-span-2">
                <Case
                  coche={expo.xa.autreForte}
                  onChange={(v) => majExpo('xa', { autreForte: v })}
                  libelle="Autre agressivité forte constatée → XA3"
                  aide="Acidité marquée, CO2 agressif, ammonium, magnésium, effluents ou lisier selon l’analyse."
                />
              </div>
            </div>
          )}
        </div>

        <div className="text-xs">
          Classes retenues :{' '}
          <span className="font-mono font-bold">{resultat.classesExposition.join(', ')}</span>
        </div>
      </Section>

      {/* 3. Beton */}
      <Section titre="3. Béton" reference="EN 206, annexe ILNAS, tableau DNA W.1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-zinc-700">
            Catégorie DNA W.1
            <Aide texte="Catégorie proposée : la moins sévère couvrant toutes les classes retenues. Une autre catégorie compatible peut être imposée." />
            <select
              className={champ}
              value={face.categorieDna ?? ''}
              onChange={(e) => maj('categorieDna', e.target.value || null)}
            >
              <option value="">Proposée : {resultat.categorieProposee?.code ?? 'sur étude'}</option>
              {resultat.categoriesCompatibles.map((c) => (
                <option key={c.code} value={c.code}>
                  Catégorie {c.code}
                </option>
              ))}
              {face.categorieDna && !resultat.categorieCompatible && (
                <option value={face.categorieDna}>Catégorie {face.categorieDna} (incompatible)</option>
              )}
            </select>
          </label>
          <label className="block text-xs font-semibold text-zinc-700">
            Classe de résistance
            <Aide texte="✓ : classes listées pour la catégorie retenue. Une classe inférieure à la plus faible d’entre elles déclenche un avertissement." />
            <select
              className={champ}
              value={face.classeResistance ?? ''}
              onChange={(e) => maj('classeResistance', e.target.value || null)}
            >
              <option value="">Non choisie</option>
              {CLASSES_RESISTANCE.map((c) => (
                <option key={c} value={c}>
                  {c}
                  {resultat.classesResistanceCompatibles.includes(c) ? ' ✓' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
        {resultat.categorieRetenue && (
          <p className="text-[11px] text-zinc-500">{resultat.categorieRetenue.description}</p>
        )}
        {resultat.resistanceCompatible === false && (
          <p className="text-[11px] text-amber-700 flex items-center gap-1">
            <TriangleAlert className="w-3.5 h-3.5" />
            {face.classeResistance} est inférieure aux classes admises par la catégorie {resultat.categorieRetenue?.code} (
            {resultat.classesResistanceCompatibles.join(', ')}).
          </p>
        )}
      </Section>

      {/* 4. Classe structurale */}
      <Section titre="4. Classe structurale" reference="EN 1992-1-1, 4.4.1.2(5), tableau 4.3N">
        <p className="text-[11px] text-zinc-500">
          Base S{p.classeStructuraleBase} (durée d’utilisation de 50 ans). Les modulations sont appliquées pour chaque
          classe XC et XD retenue, puis la classe donnant le cmin,dur le plus élevé est conservée.
        </p>
        <Case
          coche={face.dureeUtilisation === 100}
          onChange={(v) => maj('dureeUtilisation', v ? 100 : 50)}
          libelle={`Durée d’utilisation de projet de 100 ans (+${p.majorationDuree100})`}
          aide="Catégorie de durée d’utilisation 5 de l’EN 1990. Ex. : ponts, ouvrages monumentaux."
        />
        <div className="text-xs pl-6 text-zinc-600">
          Classe de résistance (−{p.minorationResistance}) : appliquée automatiquement si la classe choisie atteint le seuil
          propre à chaque classe d’exposition ({resultat.structurales.map((x) => `${x.classe} ≥ ${x.seuilResistance}`).join(' ; ')}).
        </div>
        <Case
          coche={face.assimilableDalle}
          onChange={(v) => maj('assimilableDalle', v)}
          libelle={`Élément assimilable à une dalle (−${p.minorationDalle})`}
          aide="Géométrie de dalle ET position des armatures non affectée par le procédé de construction. Ex. : dalle coulée en place, voile préfabriqué coulé à plat ; non pour une poutre ou un poteau."
        />
        <Case
          coche={face.maitriseQualite}
          onChange={(v) => maj('maitriseQualite', v)}
          libelle={`Maîtrise particulière de la qualité de production du béton (−${p.minorationQualite})`}
          aide="Contrôle de production renforcé et documenté. Ex. : usine de préfabrication certifiée avec contrôle continu."
        />
        <table className="w-full text-[11px] mt-2 border border-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="text-left px-2 py-1">Classe</th>
              <th className="text-left px-2 py-1">Modulations</th>
              <th className="text-right px-2 py-1">Classe</th>
              <th className="text-right px-2 py-1">cmin,dur</th>
            </tr>
          </thead>
          <tbody>
            {resultat.structurales.map((x) => (
              <tr key={x.classe} className={`border-t border-zinc-100 ${x === s ? 'font-bold' : ''}`}>
                <td className="px-2 py-1 font-mono">{x.classe}</td>
                <td className="px-2 py-1">
                  S{x.base}
                  {x.modificateurs
                    .filter((m) => m.actif)
                    .map((m) => ` ${m.valeur > 0 ? '+' : ''}${m.valeur}`)
                    .join('')}
                  {x.brute !== x.retenue && ` = ${x.brute}, borné`}
                </td>
                <td className="px-2 py-1 text-right font-mono">S{x.retenue}</td>
                <td className="px-2 py-1 text-right font-mono">{x.cminDur} mm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* 5. Enrobage */}
      <Section titre="5. Enrobage" reference="EN 1992-1-1, 4.4.1">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Nombre
            libelle="Diamètre Ø"
            unite="mm"
            min={5}
            max={50}
            valeur={face.diametreBarreMm}
            onChange={(v) => maj('diametreBarreMm', v ?? 12)}
            aide="Barre la plus proche du parement (cadres compris). cmin,b = Ø (tableau 4.2)."
          />
          <Nombre
            libelle="Barres par paquet"
            min={1}
            max={4}
            valeur={face.nombreBarresPaquet}
            onChange={(v) => maj('nombreBarresPaquet', Math.max(1, Math.round(v ?? 1)))}
            aide="1 = barre isolée. Pour un paquet, cmin,b = φn = Ø·√nb (8.9.1(2))."
          />
          <Nombre
            libelle="Dmax granulat"
            unite="mm"
            min={4}
            max={63}
            valeur={face.dmaxMm}
            onChange={(v) => maj('dmaxMm', v ?? 22)}
            aide="Si Dmax > 32 mm, cmin,b est majoré de 5 mm (tableau 4.2)."
          />
          <label className="block text-xs font-semibold text-zinc-700">
            Abrasion
            <Aide texte="Couche sacrificielle k1, k2, k3 (5, 10, 15 mm recommandés), 4.4.1.2(13)." />
            <select
              className={champ}
              value={face.abrasion}
              onChange={(e) => maj('abrasion', e.target.value as FaceBeton['abrasion'])}
            >
              {ABRASIONS.map((a) => (
                <option key={a.valeur} value={a.valeur} title={a.aide}>
                  {a.libelle}
                  {a.valeur !== 'aucune' ? ` : +${p.abrasion[a.valeur]} mm` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Nombre
            libelle="Δcdur,γ"
            unite="mm"
            valeur={face.deltaCDurGammaMm}
            onChange={(v) => maj('deltaCDurGammaMm', v ?? 0)}
            aide={`Marge de sécurité additionnelle, 4.4.1.2(6) ; ${p.deltaCDurGamma} mm par défaut.`}
          />
          <Nombre
            libelle="Δcdur,st"
            unite="mm"
            min={0}
            valeur={face.deltaCDurStMm}
            onChange={(v) => maj('deltaCDurStMm', v ?? 0)}
            aide={`Réduction pour acier inoxydable, 4.4.1.2(7) ; ${p.deltaCDurSt} mm par défaut.`}
          />
          <Nombre
            libelle="Δcdur,add"
            unite="mm"
            min={0}
            valeur={face.deltaCDurAddMm}
            onChange={(v) => maj('deltaCDurAddMm', v ?? 0)}
            aide={`Réduction pour protection supplémentaire (revêtement...), 4.4.1.2(8) ; ${p.deltaCDurAdd} mm par défaut.`}
          />
        </div>

        <Case
          coche={face.surfaceIrreguliere}
          onChange={(v) => maj('surfaceIrreguliere', v)}
          libelle={`Surface irrégulière ou granulats apparents (+${p.majorationSurfaceIrreguliere} mm)`}
          reference="4.4.1.2(11)"
          aide="Ex. : béton désactivé, bouchardé, parement à relief."
        />

        <div>
          <div className="text-xs font-semibold text-zinc-700 mb-1">
            Tolérance d’exécution Δcdev <span className="text-[10px] font-mono text-zinc-400">4.4.1.3</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <label className="sm:col-span-2 block text-xs">
              <select
                className={champ}
                value={face.deltaCDev.niveau}
                title={NIVEAUX_DCDEV.find((n) => n.valeur === face.deltaCDev.niveau)?.aide}
                onChange={(e) => {
                  const niveau = e.target.value as NiveauDeltaCDev;
                  const valeurMm =
                    niveau === 'standard'
                      ? p.deltaCDev.standard
                      : niveau === 'assurance_qualite'
                        ? p.deltaCDev.assuranceQualite.max
                        : p.deltaCDev.mesureRejet.max;
                  maj('deltaCDev', { niveau, valeurMm });
                }}
              >
                {NIVEAUX_DCDEV.map((n) => (
                  <option key={n.valeur} value={n.valeur} title={n.aide}>
                    {n.libelle}
                  </option>
                ))}
              </select>
              <span className="block text-[11px] text-zinc-500 mt-1">
                {NIVEAUX_DCDEV.find((n) => n.valeur === face.deltaCDev.niveau)?.aide}
              </span>
            </label>
            {plageDev ? (
              <Nombre
                libelle={`Valeur (${plageDev.min} à ${plageDev.max})`}
                unite="mm"
                min={plageDev.min}
                max={plageDev.max}
                valeur={face.deltaCDev.valeurMm}
                onChange={(v) => maj('deltaCDev', { ...face.deltaCDev, valeurMm: v ?? plageDev.max })}
              />
            ) : (
              <div className="text-xs font-mono pb-2">{p.deltaCDev.standard} mm</div>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-zinc-700 mb-1">
            Bétonnage contre terrain <span className="text-[10px] font-mono text-zinc-400">4.4.1.3(4)</span>
          </div>
          <Choix
            nom={`terrain-${face.id}`}
            options={CONTRE_TERRAIN.map((o) => ({
              ...o,
              libelle:
                o.valeur === 'prepare'
                  ? `${o.libelle} : cnom ≥ ${p.contreTerrain.prepare} mm`
                  : o.valeur === 'sol'
                    ? `${o.libelle} : cnom ≥ ${p.contreTerrain.sol} mm`
                    : o.libelle,
            }))}
            valeur={face.betonnageContreTerrain}
            onChange={(v) => maj('betonnageContreTerrain', v)}
          />
        </div>

        <Case
          coche={face.arrondi5mm}
          onChange={(v) => maj('arrondi5mm', v)}
          libelle="Arrondir cnom au multiple de 5 mm supérieur"
          aide="La valeur brute et la valeur retenue sont toutes deux affichées."
        />
      </Section>
    </div>
  );
};
