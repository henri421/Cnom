import { useEffect, useMemo, useState } from 'react';
import { calculerFace } from './engine';
import { CLE_STOCKAGE, chargerDepuisStockage } from './migration';
import { copierFace, creerElementParDefaut, creerProjetExemple, nouvelId } from './modele';
import { ElementBeton, FaceBeton, ProjetCnom } from './types';
import { Header } from './components/Header';
import { ProjectInfo } from './components/ProjectInfo';
import { ProjectTable } from './components/ProjectTable';
import { FaceForm } from './components/FaceForm';
import { ResultPanel } from './components/ResultPanel';
import { PrintReport } from './components/PrintReport';
import { LigneTableau, Selection } from './lignes';

function premiereSelection(elements: ElementBeton[]): Selection | null {
  const el = elements.find((e) => e.faces.length > 0);
  return el ? { elementId: el.id, faceId: el.faces[0].id } : null;
}

function deplacer<T>(liste: T[], index: number, sens: -1 | 1): T[] {
  const cible = index + sens;
  if (index < 0 || cible < 0 || cible >= liste.length) return liste;
  const copie = [...liste];
  [copie[index], copie[cible]] = [copie[cible], copie[index]];
  return copie;
}

export default function App() {
  const [projet, setProjet] = useState<ProjetCnom>(
    () => chargerDepuisStockage(localStorage) ?? creerProjetExemple()
  );
  const [selection, setSelection] = useState<Selection | null>(() => premiereSelection(projet.elements));
  const [isPrintView, setIsPrintView] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(projet));
    } catch {
      // stockage indisponible (navigation privee) : sans effet sur le calcul
    }
  }, [projet]);

  const lignes: LigneTableau[] = useMemo(() => {
    const res: LigneTableau[] = [];
    projet.elements.forEach((element, indexElement) => {
      element.faces.forEach((face, indexFace) => {
        res.push({
          element,
          face,
          indexElement,
          indexFace,
          resultat: calculerFace(face, element, projet.jeuParametres),
        });
      });
    });
    return res;
  }, [projet]);

  const ligneActive = lignes.find(
    (l) => l.element.id === selection?.elementId && l.face.id === selection?.faceId
  );

  // ------------------------------------------------------------------ mutations
  const setElements = (elements: ElementBeton[]) => setProjet((p) => ({ ...p, elements }));

  const majElement = (elementId: string, fn: (el: ElementBeton) => ElementBeton) =>
    setProjet((p) => ({ ...p, elements: p.elements.map((e) => (e.id === elementId ? fn(e) : e)) }));

  const majFace = (elementId: string, face: FaceBeton) =>
    majElement(elementId, (el) => ({ ...el, faces: el.faces.map((f) => (f.id === face.id ? face : f)) }));

  const trouverFace = (elementId: string, faceId: string) => {
    const element = projet.elements.find((e) => e.id === elementId);
    const face = element?.faces.find((f) => f.id === faceId);
    return element && face ? { element, face } : null;
  };

  const insererFaceApres = (elementId: string, apresFaceId: string | null, face: FaceBeton) => {
    majElement(elementId, (el) => {
      const i = apresFaceId ? el.faces.findIndex((f) => f.id === apresFaceId) : el.faces.length - 1;
      const faces = [...el.faces];
      faces.splice(i + 1, 0, face);
      return { ...el, faces };
    });
    setSelection({ elementId, faceId: face.id });
  };

  const handleNouvelElement = () => {
    const el = creerElementParDefaut(`Élément ${projet.elements.length + 1}`);
    setElements([...projet.elements, el]);
    setSelection({ elementId: el.id, faceId: el.faces[0].id });
  };

  const handleDupliquerLigne = (elementId: string, faceId: string) => {
    const t = trouverFace(elementId, faceId);
    if (!t) return;
    const copie = copierFace(t.face);
    copie.repere = t.face.repere ? `${t.face.repere} copie` : 'copie';
    insererFaceApres(elementId, faceId, copie);
  };

  const handleNouvelleLigneDepuis = () => {
    if (!ligneActive) return;
    const copie = copierFace(ligneActive.face);
    copie.repere = '';
    insererFaceApres(ligneActive.element.id, ligneActive.face.id, copie);
  };

  const handleCopierVersElement = (elementId: string, faceId: string, cibleId: string) => {
    const t = trouverFace(elementId, faceId);
    if (!t) return;
    const copie = copierFace(t.face);
    if (cibleId === 'nouveau') {
      const el: ElementBeton = { ...t.element, id: nouvelId('elem'), nom: `${t.element.nom} copie`, faces: [copie] };
      setElements([...projet.elements, el]);
      setSelection({ elementId: el.id, faceId: copie.id });
    } else {
      insererFaceApres(cibleId, null, copie);
    }
  };

  const handleSupprimerLigne = (elementId: string, faceId: string) => {
    const restant = projet.elements
      .map((e) => (e.id === elementId ? { ...e, faces: e.faces.filter((f) => f.id !== faceId) } : e))
      .filter((e) => e.faces.length > 0);
    setElements(restant);
    if (selection?.faceId === faceId) {
      const memeElement = restant.find((e) => e.id === elementId);
      setSelection(
        memeElement ? { elementId, faceId: memeElement.faces[0].id } : premiereSelection(restant)
      );
    }
  };

  const handleDeplacerLigne = (elementId: string, faceId: string, sens: -1 | 1) =>
    majElement(elementId, (el) => ({
      ...el,
      faces: deplacer(el.faces, el.faces.findIndex((f) => f.id === faceId), sens),
    }));

  const handleDupliquerElement = (elementId: string) => {
    const i = projet.elements.findIndex((e) => e.id === elementId);
    if (i < 0) return;
    const source = projet.elements[i];
    const el: ElementBeton = {
      ...source,
      id: nouvelId('elem'),
      nom: `${source.nom} copie`,
      faces: source.faces.map(copierFace),
    };
    const elements = [...projet.elements];
    elements.splice(i + 1, 0, el);
    setElements(elements);
    setSelection({ elementId: el.id, faceId: el.faces[0].id });
  };

  const handleSupprimerElement = (elementId: string) => {
    const restant = projet.elements.filter((e) => e.id !== elementId);
    setElements(restant);
    if (selection?.elementId === elementId) setSelection(premiereSelection(restant));
  };

  const handleDeplacerElement = (elementId: string, sens: -1 | 1) =>
    setElements(deplacer(projet.elements, projet.elements.findIndex((e) => e.id === elementId), sens));

  const handleAjouterFace = (elementId: string) => {
    const el = projet.elements.find((e) => e.id === elementId);
    const derniere = el?.faces[el.faces.length - 1];
    if (!derniere) return;
    const copie = copierFace(derniere);
    copie.repere = '';
    insererFaceApres(elementId, derniere.id, copie);
  };

  const remplacerProjet = (nouveau: ProjetCnom) => {
    setProjet(nouveau);
    setSelection(premiereSelection(nouveau.elements));
  };

  if (isPrintView) {
    return <PrintReport projet={projet} lignes={lignes} onClose={() => setIsPrintView(false)} />;
  }

  return (
    <>
      <Header projet={projet} />

      <main className="page">
        <ProjectInfo
          projet={projet}
          onChange={setProjet}
          onChargerProjet={remplacerProjet}
          onExemple={() => remplacerProjet(creerProjetExemple())}
        />

        <ProjectTable
          lignes={lignes}
          elements={projet.elements}
          selection={selection}
          onSelect={setSelection}
          onNouvelElement={handleNouvelElement}
          onNouvelleLigneDepuis={handleNouvelleLigneDepuis}
          onDupliquerLigne={handleDupliquerLigne}
          onCopierVersElement={handleCopierVersElement}
          onSupprimerLigne={handleSupprimerLigne}
          onDeplacerLigne={handleDeplacerLigne}
          onDupliquerElement={handleDupliquerElement}
          onSupprimerElement={handleSupprimerElement}
          onDeplacerElement={handleDeplacerElement}
          onAjouterFace={handleAjouterFace}
        />

        {ligneActive ? (
          <div className="travail">
            <div className="colonne">
              <FaceForm
                element={ligneActive.element}
                face={ligneActive.face}
                resultat={ligneActive.resultat}
                jeuParametres={projet.jeuParametres}
                onChangeElement={(el) => majElement(el.id, () => el)}
                onChangeFace={(f) => majFace(ligneActive.element.id, f)}
              />
            </div>
            <div className="colonne">
              <ResultPanel
                projet={projet}
                lignes={lignes}
                element={ligneActive.element}
                face={ligneActive.face}
                resultat={ligneActive.resultat}
                onOpenPrintView={() => setIsPrintView(true)}
              />
            </div>
          </div>
        ) : (
          <div className="attente">Aucune ligne sélectionnée. Ajoutez un élément pour commencer.</div>
        )}
      </main>

      <footer className="page">
        Enrobage nominal : EN 1992-1-1 (4.4.1) et EN 206 (annexe ILNAS, tableau DNA W.1). Calcul local dans le
        navigateur, aucune donnée transmise.
      </footer>
    </>
  );
}
