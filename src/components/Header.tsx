import React from 'react';
import { ProjetCnom } from '../types';

interface Props {
  projet: ProjetCnom;
}

/** Barre commune de la suite et en-tete de l'outil (WebAedificium/DESIGN.md). */
export const Header: React.FC<Props> = ({ projet }) => (
  <>
    <nav className="barre" aria-label="suite d'outils">
      <div className="barre-corps">
        <span className="barre-nom">Aedificium &middot; Enrobage</span>
        <a className="barre-lien" href="https://henri421.github.io/WebAedificium/" target="_blank" rel="noopener">
          Suite Aedificium &#8599;
        </a>
      </div>
    </nav>
    <header className="page entete">
      <h1>Enrobage et classes d’exposition</h1>
      <p className="sous-titre">
        Une ligne par face d’élément : classes d’exposition (EN 206 et tableau DNA W.1 de l’annexe ILNAS), classe
        structurale (EN 1992-1-1, tableau 4.3N) et enrobage nominal (EN 1992-1-1, 4.4.1), avec le cheminement complet.
      </p>
      {projet.jeuParametres === 'LU' ? (
        <p className="avertissement">
          Jeu ANL Luxembourg : les valeurs de l’annexe nationale de l’EN 1992-1-1 n’ont pas pu être vérifiées ; les
          valeurs recommandées sont reprises en attendant.
        </p>
      ) : (
        <p className="avertissement">
          Valeurs recommandées de l’EN 1992-1-1 : l’annexe nationale peut les modifier.
        </p>
      )}
    </header>
  </>
);
