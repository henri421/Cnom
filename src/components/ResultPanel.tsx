import React, { useState } from 'react';
import { DNA_W1_CATEGORIES } from '../engine';
import { genererCsv } from '../export/csv';
import { nomFichier, telecharger } from '../export/commun';
import { LigneTableau, libelleFace } from '../lignes';
import { ElementBeton, FaceBeton, ProjetCnom, ResultatFace } from '../types';
import { Coupe } from './Coupe';

interface Props {
  projet: ProjetCnom;
  lignes: LigneTableau[];
  element: ElementBeton;
  face: FaceBeton;
  resultat: ResultatFace;
  onOpenPrintView: () => void;
}

const Verdict: React.FC<{ etat: 'ok' | 'alerte' | 'refus'; titre: string; children?: React.ReactNode }> = ({
  etat,
  titre,
  children,
}) => (
  <div className={`verdict ${etat}`}>
    {titre}
    {children && <div className="detail">{children}</div>}
  </div>
);

const Grandeur: React.FC<{ symbole: React.ReactNode; libelle: string; valeur: string; retenue?: boolean }> = ({
  symbole,
  libelle,
  valeur,
  retenue,
}) => (
  <tr className={retenue ? 'retenue' : undefined}>
    <td className="symbole">{symbole}</td>
    <td className="libelle">{libelle}</td>
    <td className="valeur">{valeur}</td>
  </tr>
);

export const ResultPanel: React.FC<Props> = ({ projet, lignes, element, face, resultat, onOpenPrintView }) => {
  const e = resultat.enrobage;
  const [exportEnCours, setExportEnCours] = useState(false);
  const categorie = resultat.categorieRetenue;
  const mm = (v: number) => `${v} mm`;

  const exporterExcel = async () => {
    setExportEnCours(true);
    try {
      const { exporterExcel: exporter } = await import('../export/excel');
      await exporter(projet, lignes);
    } catch (err) {
      window.alert(`Export Excel impossible : ${(err as Error).message}`);
    } finally {
      setExportEnCours(false);
    }
  };

  return (
    <>
      <section className="cadre" aria-label="vérification">
        <h2>
          Vérification{' '}
          <span className="clause">
            {element.nom || 'Élément sans nom'} · {libelleFace(face)}
          </span>
        </h2>

        <div className="constat">
          <div className="libelle">Enrobage nominal retenu c<sub>nom</sub></div>
          <div className="valeur">{mm(e.cnomRetenu)}</div>
          <div className="brut">
            {e.arrondi && e.cnomBrut !== e.cnomRetenu
              ? `valeur brute ${mm(e.cnomBrut)}, arrondie au multiple de 5 mm`
              : `classes ${resultat.classesExposition.join(', ')} · ${e.classeDeterminante} déterminante, S${e.classeStructurale}`}
          </div>
        </div>

        <Coupe face={face} resultat={resultat} />

        {categorie ? (
          resultat.categorieCompatible ? (
            <Verdict etat="ok" titre={`Catégorie DNA W.1 ${categorie.code} : couvre toutes les classes retenues`} />
          ) : (
            <Verdict etat="refus" titre={`Catégorie DNA W.1 ${categorie.code} : ne couvre pas toutes les classes retenues`}>
              Catégories compatibles : {resultat.categoriesCompatibles.map((c) => c.code).join(', ') || 'aucune'}.
            </Verdict>
          )
        ) : (
          <Verdict etat="alerte" titre="Catégorie DNA W.1 : aucune ne couvre ces classes, béton sur étude" />
        )}

        {resultat.resistanceCompatible === null ? (
          <div className="attente">Classe de résistance non choisie : pas de vérification de compatibilité.</div>
        ) : resultat.resistanceCompatible ? (
          <Verdict etat="ok" titre={`${face.classeResistance} : compatible avec la catégorie retenue`} />
        ) : (
          <Verdict etat="refus" titre={`${face.classeResistance} : inférieure aux classes admises pour la catégorie`}>
            Classes admises : {resultat.classesResistanceCompatibles.join(', ') || 'aucune'}.
          </Verdict>
        )}

        {resultat.avertissements.length === 0 ? (
          <Verdict etat="ok" titre="Aucun avertissement sur l’exposition et l’enrobage" />
        ) : (
          <Verdict etat="alerte" titre={`${resultat.avertissements.length} avertissement(s)`}>
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              {resultat.avertissements.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </Verdict>
        )}

        <h3>Grandeurs</h3>
        <table className="grandeurs">
          <tbody>
            <Grandeur symbole={<>c<sub>min,b</sub></>} libelle={`adhérence, Ø${e.diametreEquivalentMm}${e.majorationDmaxMm ? ' + Dmax' : ''}`} valeur={mm(e.cminB)} />
            <Grandeur symbole={<>c<sub>min,dur</sub></>} libelle={`durabilité, ${e.classeDeterminante} / S${e.classeStructurale}`} valeur={mm(e.cminDur)} />
            {e.cminDurCorrige !== e.cminDur && (
              <Grandeur symbole={<>c<sub>min,dur</sub>′</>} libelle="corrigé des Δcdur" valeur={mm(e.cminDurCorrige)} />
            )}
            <Grandeur symbole={<>c<sub>min</sub></>} libelle={`maximum des trois, gouverné par ${e.critereCmin}`} valeur={mm(e.cmin)} />
            {e.majorationSurfaceMm > 0 && <Grandeur symbole="+" libelle="surface irrégulière" valeur={mm(e.majorationSurfaceMm)} />}
            {e.majorationAbrasionMm > 0 && <Grandeur symbole="+" libelle="couche d’abrasion" valeur={mm(e.majorationAbrasionMm)} />}
            {e.cminMajore !== e.cmin && <Grandeur symbole={<>c<sub>min</sub>′</>} libelle="majoré" valeur={mm(e.cminMajore)} />}
            <Grandeur symbole={<>Δc<sub>dev</sub></>} libelle="tolérance d’exécution" valeur={mm(e.deltaCDev)} />
            <Grandeur symbole={<>c<sub>min</sub> + Δc<sub>dev</sub></>} libelle="enrobage calculé" valeur={mm(e.cnomCalcule)} />
            {e.minimumContreTerrainMm !== null && (
              <Grandeur
                symbole="≥"
                libelle={`minimum contre terrain${e.contreTerrainGouverne ? ', déterminant' : ''}`}
                valeur={mm(e.minimumContreTerrainMm)}
              />
            )}
            {e.arrondi && e.cnomBrut !== e.cnomRetenu && <Grandeur symbole={<>c<sub>nom</sub> brut</>} libelle="avant arrondi" valeur={mm(e.cnomBrut)} />}
            <Grandeur symbole={<>c<sub>nom</sub></>} libelle="retenu" valeur={mm(e.cnomRetenu)} retenue />
          </tbody>
        </table>

        <details className="deriv">
          <summary>Cheminement complet</summary>
          <div>
            {resultat.cheminement.map((etape) => (
              <div key={etape.titre}>
                <div className="etape-titre">
                  {etape.titre} <span className="clause">{etape.reference}</span>
                </div>
                <ul>
                  {etape.lignes.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>

        <details className="deriv">
          <summary>Tableau DNA W.1 (annexe ILNAS de l’EN 206)</summary>
          <div>
            <table className="dna">
              <thead>
                <tr>
                  <th>Cat.</th>
                  <th>Usage</th>
                  <th>Classes couvertes</th>
                  <th>Résistances</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(DNA_W1_CATEGORIES).map((c) => (
                  <tr key={c.code} className={c.code === categorie?.code ? 'retenue' : undefined}>
                    <td className="mono">{c.code}</td>
                    <td>{c.description}</td>
                    <td className="classes">{[...c.classesCouvertes].join(' ')}</td>
                    <td className="classes">{c.fckPossibles.join(' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="note">Ligne surlignée : catégorie retenue pour la face.</p>
          </div>
        </details>
      </section>

      <section className="cadre" aria-label="sorties">
        <h2>Sorties</h2>
        <p className="note" style={{ marginTop: 0 }}>
          Tout le projet : {lignes.length} ligne{lignes.length > 1 ? 's' : ''}.
        </p>
        <div className="boutons">
          <button type="button" onClick={onOpenPrintView}>
            Note de calcul (PDF)
          </button>
          <button type="button" onClick={exporterExcel} disabled={exportEnCours} title="Classeur .xlsx : synthèse, justification, paramètres nationaux">
            {exportEnCours ? 'Export…' : 'Excel'}
          </button>
          <button
            type="button"
            onClick={() => telecharger(genererCsv(lignes), nomFichier(projet, 'csv'), 'text/csv;charset=utf-8')}
            title="CSV point-virgule, UTF-8 avec BOM (Excel francophone)"
          >
            CSV
          </button>
        </div>
      </section>
    </>
  );
};
