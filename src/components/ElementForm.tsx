import React from 'react';
import { ElementBeton, TypeElement, AmbianceXC, FrequenceSalage, ZoneGel } from '../types';
import { Settings2, ShieldAlert, CloudRain, Snowflake, FlaskConical, Info } from 'lucide-react';

interface Props {
  element: ElementBeton;
  onChange: (updated: ElementBeton) => void;
}

export const ElementForm: React.FC<Props> = ({ element, onChange }) => {
  const updateField = <K extends keyof ElementBeton>(key: K, value: ElementBeton[K]) => {
    onChange({ ...element, [key]: value });
  };

  const updateReponse = <K extends keyof ElementBeton['reponses']>(
    key: K,
    value: ElementBeton['reponses'][K]
  ) => {
    onChange({
      ...element,
      reponses: {
        ...element.reponses,
        [key]: value,
      },
    });
  };

  return (
    <div id="element-form-container" className="space-y-6">
      {/* 1. PARAMÈTRES GÉNÉRAUX DE L'ÉLÉMENT */}
      <section className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-100">
          <Settings2 className="w-4 h-4 text-zinc-700" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
            1. Paramètres géométriques &amp; de calcul
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nom de la face */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Nom / repère de la face analysée
            </label>
            <input
              type="text"
              value={element.nom}
              onChange={(e) => updateField('nom', e.target.value)}
              placeholder="Ex: Voile façade Ouest - Face extérieure"
              className="w-full text-sm px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-zinc-900 font-medium text-zinc-900"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Rappel : Chaque enregistrement représente une seule face (ex: face extérieure ou face intérieure).
            </p>
          </div>

          {/* Type d'élément */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Type d'élément structural
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateField('typeElement', 'voile')}
                className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-all ${
                  element.typeElement === 'voile'
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
              >
                Voile / Poteau / Poutre
              </button>
              <button
                type="button"
                onClick={() => updateField('typeElement', 'dalle')}
                className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-all ${
                  element.typeElement === 'dalle'
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
              >
                Dalle (-1 classe struct.)
              </button>
            </div>
          </div>

          {/* Durée d'utilisation de projet */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Durée d'utilisation de projet (EN 1990)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateField('dureeUtilisationProjet', 50)}
                className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-all ${
                  element.dureeUtilisationProjet === 50
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
              >
                50 ans (Standard)
              </button>
              <button
                type="button"
                onClick={() => updateField('dureeUtilisationProjet', 100)}
                className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-all ${
                  element.dureeUtilisationProjet === 100
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
              >
                100 ans (+2 classes)
              </button>
            </div>
          </div>

          {/* Diamètre barre principale ∅ */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Diamètre de l'armature principale ∅ (cmin,b = ∅)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1 flex-1">
                {[8, 10, 12, 14, 16, 20, 25, 32].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => updateField('diametreBarreMm', d)}
                    className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                      element.diametreBarreMm === d
                        ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="w-16">
                <input
                  type="number"
                  min={6}
                  max={50}
                  value={element.diametreBarreMm}
                  onChange={(e) => updateField('diametreBarreMm', Math.max(6, parseInt(e.target.value) || 12))}
                  className="w-full text-center text-xs font-mono font-bold px-2 py-1.5 bg-zinc-50 border border-zinc-300 rounded focus:bg-white focus:outline-hidden"
                />
              </div>
              <span className="text-xs text-zinc-500 font-mono">mm</span>
            </div>
          </div>

          {/* Classe de résistance béton prévue */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Classe de résistance prévisionnelle fck
            </label>
            <select
              value={element.classeResistancePrevue || 'C30/37'}
              onChange={(e) => updateField('classeResistancePrevue', e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-hidden font-medium text-zinc-900"
            >
              <option value="C20/25">C20/25 (fck = 20 MPa)</option>
              <option value="C25/30">C25/30 (fck = 25 MPa)</option>
              <option value="C30/37">C30/37 (fck = 30 MPa - standard)</option>
              <option value="C35/45">C35/45 (fck = 35 MPa - réduction tab 4.3N)</option>
              <option value="C40/50">C40/50 (fck = 40 MPa)</option>
              <option value="C45/55">C45/55 (fck = 45 MPa)</option>
            </select>
          </div>

          {/* Marge de tolérance d'exécution Δc,dev */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Tolérance d'exécution Δc,dev (EN 1992-1-1 §4.4.1.3)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateField('deltaCDevMm', 10)}
                className={`py-1.5 px-3 text-xs font-mono rounded border text-center transition-all ${
                  element.deltaCDevMm === 10
                    ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
              >
                10 mm (Recommandé)
              </button>
              <button
                type="button"
                onClick={() => updateField('deltaCDevMm', 5)}
                className={`py-1.5 px-3 text-xs font-mono rounded border text-center transition-all ${
                  element.deltaCDevMm === 5
                    ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
              >
                5 mm (Contrôle continu)
              </button>
            </div>
          </div>

          {/* Option contrôle qualité usine */}
          <div className="flex items-center">
            <label className="flex items-start gap-2.5 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={element.qualiteControleSpeciale}
                onChange={(e) => updateField('qualiteControleSpeciale', e.target.checked)}
                className="mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <span className="text-xs text-zinc-700 leading-tight">
                <strong className="text-zinc-900 font-semibold">Système qualité spécial assuré</strong>
                <span className="block text-[11px] text-zinc-500">
                  Réduction de -1 classe structurale (EN 1992-1-1 clause 4.4.1.2(5))
                </span>
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* 2. FAMILLE XC : CORROSION INDUITE PAR CARBONATATION */}
      <section className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-100">
          <CloudRain className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
            2. Carbonatation (Classe XC) — Exposition de la face
          </h3>
        </div>

        <div className="space-y-2">
          {[
            {
              id: 'interieur_sec' as AmbianceXC,
              titre: 'Face intérieure en ambiance sèche de bâtiment',
              sousTitre: 'Locaux d’habitation ou de bureaux chauffés (sec en permanence).',
              classe: 'XC1',
            },
            {
              id: 'enterree_ou_eau' as AmbianceXC,
              titre: 'Face enterrée ou en contact permanent avec l’eau',
              sousTitre: 'Fondations, radiers, parois moulées contre terre ou sous eau.',
              classe: 'XC2',
            },
            {
              id: 'exterieur_abrite' as AmbianceXC,
              titre: 'Face extérieure abritée de la pluie',
              sousTitre: 'Sous-face d’auvent, coursives couvertes, balcons protégés.',
              classe: 'XC3',
            },
            {
              id: 'exterieur_non_abrite' as AmbianceXC,
              titre: 'Face extérieure non abritée (exposée à la pluie)',
              sousTitre: 'Façades extérieures soumises aux intempéries (alternance humidité / séchage).',
              classe: 'XC4',
            },
            {
              id: 'interieur_humide' as AmbianceXC,
              titre: 'Face intérieure en ambiance modérément à fortement humide',
              sousTitre: 'Cuisines professionnelles collectives, buanderies industrielles, hall de piscines.',
              classe: 'XC3',
            },
          ].map((item) => {
            const isSelected = element.reponses.ambianceXC === item.id;
            return (
              <label
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-sky-50/70 border-sky-400 ring-1 ring-sky-400/40 text-zinc-900'
                    : 'bg-zinc-50/50 hover:bg-zinc-100/70 border-zinc-200 text-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="ambianceXC"
                  value={item.id}
                  checked={isSelected}
                  onChange={() => updateReponse('ambianceXC', item.id)}
                  className="mt-1 text-zinc-900 focus:ring-zinc-900"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900">{item.titre}</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-800">
                      {item.classe}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{item.sousTitre}</p>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {/* 3. FAMILLE XD : CHLORURES D'ORIGINE NON MARINE (SELS DE DÉVERGLAÇAGE) */}
      <section className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              3. Chlorures non marins (Classe XD)
            </h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={element.reponses.concerneParChlorures}
              onChange={(e) => updateReponse('concerneParChlorures', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
            <span className="ml-2 text-xs font-medium text-zinc-700">
              {element.reponses.concerneParChlorures ? 'Exposé' : 'Non concerné'}
            </span>
          </label>
        </div>

        {element.reponses.concerneParChlorures ? (
          <div className="space-y-4 pt-1 animate-in fade-in duration-150">
            {/* Application directe vs projections */}
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={element.reponses.applicationDirecteSelSurFace}
                  onChange={(e) => updateReponse('applicationDirecteSelSurFace', e.target.checked)}
                  className="mt-0.5 rounded border-amber-400 text-amber-800 focus:ring-amber-500"
                />
                <div>
                  <span className="text-xs font-bold text-amber-950">
                    Application directe d’agents de déverglaçage sur la face (dalles de circulation, rampes, marches)
                  </span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Concerne les surfaces recevant directement les sels de déverglaçage ou les véhicules enneigés/salés en stagnation (produit automatiquement <strong className="font-mono font-semibold">XD3</strong>).
                  </p>
                </div>
              </label>
            </div>

            {/* Distance et salage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Distance par rapport à la chaussée salée (mètres)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={element.reponses.distanceChausseeSaleeM ?? 3}
                    onChange={(e) =>
                      updateReponse(
                        'distanceChausseeSaleeM',
                        e.target.value === '' ? null : parseFloat(e.target.value)
                      )
                    }
                    className="w-full text-sm font-mono px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded focus:bg-white focus:outline-hidden font-medium"
                    placeholder="Ex: 3.5"
                  />
                  <span className="text-xs font-mono text-zinc-500">m</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Seuil normatif : &lt; 6 m = projections directes ; &ge; 6 m = aérosols chlorurés (XD1).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Fréquence de salage de la voie
                </label>
                <select
                  value={element.reponses.salageRoute || 'frequent'}
                  onChange={(e) => updateReponse('salageRoute', e.target.value as FrequenceSalage)}
                  className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-300 rounded focus:bg-white focus:outline-hidden font-medium"
                >
                  <option value="peu_frequent">Peu fréquent (voie secondaire, lotissement)</option>
                  <option value="frequent">Fréquent (voie urbaine, route nationale)</option>
                  <option value="tres_frequent">Très fréquent (autoroute, échangeur, rampe d'accès)</option>
                </select>
                <p className="text-[10px] text-zinc-500 mt-1">
                  À moins de 6 m, un salage fréquent ou très fréquent entraîne <strong className="font-mono">XD3</strong>.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic">
            Élément situé hors de portée des chaussées salées et des chlorures.
          </p>
        )}
      </section>

      {/* 4. FAMILLE XF : ATTAQUE GEL / DÉGEL */}
      <section className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-cyan-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              4. Attaque Gel / Dégel (Classe XF)
            </h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={element.reponses.exposeAuGel}
              onChange={(e) => updateReponse('exposeAuGel', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
            <span className="ml-2 text-xs font-medium text-zinc-700">
              {element.reponses.exposeAuGel ? 'Exposé au gel' : 'Hors gel'}
            </span>
          </label>
        </div>

        {element.reponses.exposeAuGel ? (
          <div className="space-y-3 pt-1 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Zone de sévérité de gel (Grand-Duché)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateReponse('zoneGel', 'faible_modere')}
                    className={`py-1.5 px-3 text-xs font-semibold rounded border text-center transition-all ${
                      element.reponses.zoneGel === 'faible_modere'
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    Gel faible / modéré
                  </button>
                  <button
                    type="button"
                    onClick={() => updateReponse('zoneGel', 'severe')}
                    className={`py-1.5 px-3 text-xs font-semibold rounded border text-center transition-all ${
                      element.reponses.zoneGel === 'severe'
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    Gel sévère
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={element.reponses.presenceAgentDeverglacage}
                    onChange={(e) => updateReponse('presenceAgentDeverglacage', e.target.checked)}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-xs text-zinc-800">
                    Présence d'agents de déverglaçage (XF2 / XF4)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={element.reponses.saturationForteEau}
                    onChange={(e) => updateReponse('saturationForteEau', e.target.checked)}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-xs text-zinc-800">
                    Forte saturation en eau (surfaces horizontales / dalles stagnantes)
                  </span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic">
            Élément situé dans un volume intérieur chauffé ou enterré sous la garde hors-gel.
          </p>
        )}
      </section>

      {/* 5. FAMILLE XA : ATTAQUE CHIMIQUE DU SOL / EAU SOUTERRAINE */}
      <section className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              5. Agressivité chimique (Classe XA)
            </h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={element.reponses.concerneParAgressiviteChimique}
              onChange={(e) => updateReponse('concerneParAgressiviteChimique', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
            <span className="ml-2 text-xs font-medium text-zinc-700">
              {element.reponses.concerneParAgressiviteChimique ? 'Exposé' : 'Non agressif'}
            </span>
          </label>
        </div>

        {element.reponses.concerneParAgressiviteChimique ? (
          <div className="space-y-3 pt-1 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Sulfates dans l'eau SO₄²⁻ (mg/l)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={element.reponses.so4EauMgL ?? ''}
                  onChange={(e) =>
                    updateReponse(
                      'so4EauMgL',
                      e.target.value === '' ? null : parseFloat(e.target.value)
                    )
                  }
                  placeholder="&le; 200 (seuil XA1: 200, XA2c: 600, XA3c: 3000)"
                  className="w-full text-xs font-mono px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Sulfates dans le sol SO₄²⁻ (mg/kg)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={element.reponses.so4SolMgKg ?? ''}
                  onChange={(e) =>
                    updateReponse(
                      'so4SolMgKg',
                      e.target.value === '' ? null : parseFloat(e.target.value)
                    )
                  }
                  placeholder="&le; 2000 (seuil XA1: 2000, XA2c: 3000, XA3c: 12000)"
                  className="w-full text-xs font-mono px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={element.reponses.autreAgressiviteChimiqueForte}
                  onChange={(e) => updateReponse('autreAgressiviteChimiqueForte', e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <span className="text-xs text-zinc-800">
                  Autre agressivité chimique forte (effluents industriels, lisier, eaux acides pH &lt; 4.5 &rarr; XA3c)
                </span>
              </label>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic">
            Sols et eaux souterraines neutres ou sans agressivité chimique particulière.
          </p>
        )}
      </section>
    </div>
  );
};
