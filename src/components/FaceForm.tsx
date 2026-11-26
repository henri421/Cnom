import React from 'react';
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
import { ElementBeton, ExpositionFace, FaceBeton, JeuParametres, NiveauDeltaCDev, ResultatFace } from '../types';

interface Props {
  element: ElementBeton;
  face: FaceBeton;
  resultat: ResultatFace;
  jeuParametres: JeuParametres;
  onChangeElement: (el: ElementBeton) => void;
  onChangeFace: (f: FaceBeton) => void;
}

// ---------------------------------------------------------------- briques

const Case: React.FC<{ coche: boolean; onChange: (v: boolean) => void; libelle: React.ReactNode; aide?: string }> = ({
  coche,
  onChange,
  libelle,
  aide,
}) => (
  <label className="case" title={aide}>
    <input type="checkbox" checked={coche} onChange={(e) => onChange(e.target.checked)} />
    <span>
      {libelle}
      {aide && <span className="aide">{aide}</span>}
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
    <div className="choix">
      {options.map((o) => (
        <label key={o.valeur} className="case" title={o.aide}>
          <input type="radio" name={nom} checked={valeur === o.valeur} onChange={() => onChange(o.valeur)} />
          <span>
            {o.libelle}
            {o.aide && <span className="aide">{o.aide}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}

const Nombre: React.FC<{
  libelle: React.ReactNode;
  valeur: number | null;
  onChange: (v: number | null) => void;
  unite?: string;
  aide?: string;
  min?: number;
  max?: number;
  vide?: boolean;
}> = ({ libelle, valeur, onChange, unite, aide, min, max, vide = false }) => (
  <label title={aide}>
    <span>{libelle}</span>
    <span className="unite">
      <input
        type="number"
        value={valeur ?? ''}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange(Number.isFinite(v) ? v : vide ? null : (min ?? 0));
        }}
      />
      <small>{unite ?? ''}</small>
    </span>
  </label>
);

// ---------------------------------------------------------------- formulaire

export const FaceForm: React.FC<Props> = ({ element, face, resultat, jeuParametres, onChangeElement, onChangeFace }) => {
  const p = parametres(jeuParametres);
  const maj = <K extends keyof FaceBeton>(k: K, v: FaceBeton[K]) => onChangeFace({ ...face, [k]: v });
  const majExpo = <F extends keyof ExpositionFace>(famille: F, v: Partial<ExpositionFace[F]>) =>
    onChangeFace({ ...face, exposition: { ...face.exposition, [famille]: { ...face.exposition[famille], ...v } } });
  const expo = face.exposition;
  const niveauDev = NIVEAUX_DCDEV.find((n) => n.valeur === face.deltaCDev.niveau);
  const plageDev =
    face.deltaCDev.niveau === 'assurance_qualite'
      ? p.deltaCDev.assuranceQualite
      : face.deltaCDev.niveau === 'mesure_rejet'
        ? p.deltaCDev.mesureRejet
        : null;

  return (
    <section className="cadre" id="saisie" aria-label="saisie de la face">
      <h2>Saisie de la ligne</h2>

      <fieldset>
        <legend>1. Identification</legend>
        <label>
          <span>Élément</span>
          <input
            type="text"
            value={element.nom}
            placeholder="Voile V12 axe B"
            onChange={(e) => onChangeElement({ ...element, nom: e.target.value })}
          />
        </label>
        <label title="Le type sert à l’identification ; il n’impose pas la minoration de dalle (question explicite à l’étape 4).">
          <span>Type d’élément</span>
          <select
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
          <label>
            <span>Type (libellé libre)</span>
            <input type="text" value={element.typeAutre} onChange={(e) => onChangeElement({ ...element, typeAutre: e.target.value })} />
          </label>
        )}
        <label>
          <span>Face</span>
          <select value={face.position} onChange={(e) => maj('position', e.target.value as FaceBeton['position'])}>
            {POSITIONS_FACE.map((t) => (
              <option key={t.valeur} value={t.valeur}>
                {t.libelle}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Repère de la face</span>
          <input type="text" value={face.repere} placeholder="facultatif" onChange={(e) => maj('repere', e.target.value)} />
        </label>
      </fieldset>

      <fieldset>
        <legend>
          2. Exposition <span className="clause">EN 206, tableaux 1 et 2</span>
        </legend>
        <p className="note" style={{ marginTop: 0 }}>
          Cocher toutes les familles qui s’appliquent à la face. Sans famille cochée, la face est en X0.
        </p>

        <Case
          coche={expo.xc.actif}
          onChange={(v) => majExpo('xc', { actif: v })}
          libelle="XC : carbonatation"
          aide="Tout béton armé exposé à l’air et à l’humidité, sauf ambiance très sèche (X0)."
        />
        {expo.xc.actif && (
          <Choix nom={`xc-${face.id}`} options={AMBIANCES_XC} valeur={expo.xc.ambiance} onChange={(v) => majExpo('xc', { ambiance: v })} />
        )}

        <Case
          coche={expo.xd.actif}
          onChange={(v) => majExpo('xd', { actif: v })}
          libelle="XD : chlorures (hors eau de mer)"
          aide="Sels de déverglaçage, eaux chlorurées. Ex. : parking, rampe, abords de voirie salée, piscine."
        />
        {expo.xd.actif && (
          <Choix nom={`xd-${face.id}`} options={MODES_XD} valeur={expo.xd.mode} onChange={(v) => majExpo('xd', { mode: v })} />
        )}

        <Case
          coche={expo.xf.actif}
          onChange={(v) => majExpo('xf', { actif: v })}
          libelle="XF : gel-dégel"
          aide="Face extérieure exposée au gel en étant humide. Ex. : façade, acrotère, dalle extérieure."
        />
        {expo.xf.actif && (
          <div className="choix">
            <div className="sous-groupe">Saturation en eau</div>
            <Choix
              nom={`xf-sat-${face.id}`}
              options={[
                { valeur: 'moderee', libelle: 'Modérée', aide: 'Surfaces verticales exposées à la pluie.' },
                { valeur: 'forte', libelle: 'Forte', aide: 'Surfaces horizontales où l’eau stagne ; zones de projection.' },
              ]}
              valeur={expo.xf.saturation}
              onChange={(v) => majExpo('xf', { saturation: v })}
            />
            <Case
              coche={expo.xf.deverglacage}
              onChange={(v) => majExpo('xf', { deverglacage: v })}
              libelle="Sels de déverglaçage"
              aide="Sans sel : XF1 ou XF3 ; avec sel : XF2 ou XF4."
            />
          </div>
        )}

        <Case
          coche={expo.xa.actif}
          onChange={(v) => majExpo('xa', { actif: v })}
          libelle="XA : attaque chimique"
          aide="Sur analyse du sol ou de l’eau. Ex. : fondation dans un sol gypseux."
        />
        {expo.xa.actif && (
          <div className="choix">
            <Nombre
              libelle={<>SO<sub>4</sub><sup>2−</sup> dans l’eau</>}
              unite="mg/l"
              vide
              min={0}
              valeur={expo.xa.so4EauMgL}
              onChange={(v) => majExpo('xa', { so4EauMgL: v })}
              aide="XA1 de 200 à 600, XA2 jusqu’à 3000, XA3 au-delà (EN 206, tableau 2)."
            />
            <Nombre
              libelle={<>SO<sub>4</sub><sup>2−</sup> dans le sol</>}
              unite="mg/kg"
              vide
              min={0}
              valeur={expo.xa.so4SolMgKg}
              onChange={(v) => majExpo('xa', { so4SolMgKg: v })}
              aide="XA1 de 2000 à 3000, XA2 jusqu’à 12000, XA3 au-delà (EN 206, tableau 2)."
            />
            <Case
              coche={expo.xa.autreForte}
              onChange={(v) => majExpo('xa', { autreForte: v })}
              libelle="Autre agressivité forte → XA3"
              aide="Acidité marquée, CO2 agressif, ammonium, magnésium, effluents ou lisier selon l’analyse."
            />
          </div>
        )}
        <p className="note">
          Classes retenues : <span className="mono">{resultat.classesExposition.join(', ')}</span>
        </p>
      </fieldset>

      <fieldset>
        <legend>
          3. Béton <span className="clause">tableau DNA W.1</span>
        </legend>
        <label title="Catégorie proposée : la moins sévère couvrant toutes les classes retenues.">
          <span>Catégorie DNA W.1</span>
          <select value={face.categorieDna ?? ''} onChange={(e) => maj('categorieDna', e.target.value || null)}>
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
        <label title="✓ : classes listées pour la catégorie retenue. Une classe inférieure à la plus faible d’entre elles est refusée.">
          <span>Classe de résistance</span>
          <select value={face.classeResistance ?? ''} onChange={(e) => maj('classeResistance', e.target.value || null)}>
            <option value="">Non choisie</option>
            {CLASSES_RESISTANCE.map((c) => (
              <option key={c} value={c}>
                {c}
                {resultat.classesResistanceCompatibles.includes(c) ? ' ✓' : ''}
              </option>
            ))}
          </select>
        </label>
        {resultat.categorieRetenue && <p className="note">{resultat.categorieRetenue.description}</p>}
      </fieldset>

      <fieldset>
        <legend>
          4. Classe structurale <span className="clause">EN 1992-1-1, tableau 4.3N</span>
        </legend>
        <p className="note" style={{ marginTop: 0 }}>
          Base S{p.classeStructuraleBase} (50 ans). Les modulations s’appliquent à chaque classe XC et XD retenue ; la classe
          qui donne le cmin,dur le plus élevé est conservée.
        </p>
        <Case
          coche={face.dureeUtilisation === 100}
          onChange={(v) => maj('dureeUtilisation', v ? 100 : 50)}
          libelle={`Durée d’utilisation de 100 ans (+${p.majorationDuree100})`}
          aide="Catégorie de durée d’utilisation 5 de l’EN 1990. Ex. : ponts, ouvrages monumentaux."
        />
        <p className="note">
          Classe de résistance (−{p.minorationResistance}) : appliquée d’office si la classe choisie atteint le seuil de chaque
          classe d’exposition ({resultat.structurales.map((x) => `${x.classe} ≥ ${x.seuilResistance}`).join(' ; ')}).
        </p>
        <Case
          coche={face.assimilableDalle}
          onChange={(v) => maj('assimilableDalle', v)}
          libelle={`Élément assimilable à une dalle (−${p.minorationDalle})`}
          aide="Géométrie de dalle et position des armatures non affectée par le procédé de construction. Ex. : dalle coulée en place ; non pour une poutre ou un poteau."
        />
        <Case
          coche={face.maitriseQualite}
          onChange={(v) => maj('maitriseQualite', v)}
          libelle={`Maîtrise particulière de la qualité du béton (−${p.minorationQualite})`}
          aide="Contrôle de production renforcé et documenté. Ex. : usine de préfabrication certifiée."
        />
      </fieldset>

      <fieldset>
        <legend>
          5. Enrobage <span className="clause">EN 1992-1-1, 4.4.1</span>
        </legend>
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
          libelle={<>D<sub>max</sub> du granulat</>}
          unite="mm"
          min={4}
          max={63}
          valeur={face.dmaxMm}
          onChange={(v) => maj('dmaxMm', v ?? 22)}
          aide="Si Dmax > 32 mm, cmin,b est majoré de 5 mm (tableau 4.2)."
        />
        <Nombre
          libelle={<>Δc<sub>dur,γ</sub></>}
          unite="mm"
          valeur={face.deltaCDurGammaMm}
          onChange={(v) => maj('deltaCDurGammaMm', v ?? 0)}
          aide={`Marge de sécurité additionnelle, 4.4.1.2(6) ; ${p.deltaCDurGamma} mm par défaut.`}
        />
        <Nombre
          libelle={<>Δc<sub>dur,st</sub></>}
          unite="mm"
          min={0}
          valeur={face.deltaCDurStMm}
          onChange={(v) => maj('deltaCDurStMm', v ?? 0)}
          aide={`Réduction pour acier inoxydable, 4.4.1.2(7) ; ${p.deltaCDurSt} mm par défaut.`}
        />
        <Nombre
          libelle={<>Δc<sub>dur,add</sub></>}
          unite="mm"
          min={0}
          valeur={face.deltaCDurAddMm}
          onChange={(v) => maj('deltaCDurAddMm', v ?? 0)}
          aide={`Réduction pour protection supplémentaire, 4.4.1.2(8) ; ${p.deltaCDurAdd} mm par défaut.`}
        />
        <label title="Couche sacrificielle k1, k2, k3 (5, 10, 15 mm recommandés), 4.4.1.2(13).">
          <span>Abrasion</span>
          <select value={face.abrasion} onChange={(e) => maj('abrasion', e.target.value as FaceBeton['abrasion'])}>
            {ABRASIONS.map((a) => (
              <option key={a.valeur} value={a.valeur} title={a.aide}>
                {a.libelle}
                {a.valeur !== 'aucune' ? ` : +${p.abrasion[a.valeur]} mm` : ''}
              </option>
            ))}
          </select>
        </label>
        <Case
          coche={face.surfaceIrreguliere}
          onChange={(v) => maj('surfaceIrreguliere', v)}
          libelle={`Surface irrégulière ou granulats apparents (+${p.majorationSurfaceIrreguliere} mm)`}
          aide="4.4.1.2(11). Ex. : béton désactivé, bouchardé, parement à relief."
        />

        <div className="sous-groupe">
          Tolérance d’exécution Δc<sub>dev</sub>, 4.4.1.3
        </div>
        <label title={niveauDev?.aide}>
          <span>Niveau</span>
          <select
            value={face.deltaCDev.niveau}
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
        </label>
        <p className="note" style={{ marginTop: 0 }}>
          {niveauDev?.aide}
        </p>
        {plageDev && (
          <Nombre
            libelle={`Δcdev retenu (${plageDev.min} à ${plageDev.max})`}
            unite="mm"
            min={plageDev.min}
            max={plageDev.max}
            valeur={face.deltaCDev.valeurMm}
            onChange={(v) => maj('deltaCDev', { ...face.deltaCDev, valeurMm: v ?? plageDev.max })}
          />
        )}

        <div className="sous-groupe">Bétonnage contre terrain, 4.4.1.3(4)</div>
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
        <Case
          coche={face.arrondi5mm}
          onChange={(v) => maj('arrondi5mm', v)}
          libelle="Arrondir cnom au multiple de 5 mm supérieur"
          aide="La valeur brute et la valeur retenue sont toutes deux affichées."
        />
      </fieldset>
    </section>
  );
};
