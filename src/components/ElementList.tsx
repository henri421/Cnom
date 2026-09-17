import React from 'react';
import { ElementBeton, ResultatCalculElement } from '../types';
import { Plus, Copy, Trash2, Layers, ShieldCheck, ChevronRight } from 'lucide-react';

interface Props {
  elements: ElementBeton[];
  activeElementId: string;
  onSelectElement: (id: string) => void;
  onAddElement: () => void;
  onDuplicateElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  calculsMap: Record<string, ResultatCalculElement>;
}

export const ElementList: React.FC<Props> = ({
  elements,
  activeElementId,
  onSelectElement,
  onAddElement,
  onDuplicateElement,
  onDeleteElement,
  calculsMap,
}) => {
  return (
    <div id="element-list-panel" className="bg-white border border-zinc-200 rounded-lg overflow-hidden mb-6">
      {/* Header bar of list */}
      <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-600" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
            Éléments &amp; Faces du projet ({elements.length})
          </h2>
          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            • 1 élément = 1 face exposée
          </span>
        </div>
        <button
          onClick={onAddElement}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 rounded-md transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle face</span>
        </button>
      </div>

      {/* Grid or Horizontal Carousel of Elements */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {elements.map((el, index) => {
          const isActive = el.id === activeElementId;
          const calc = calculsMap[el.id];
          const cnom = calc?.enrobage.cnom ?? '--';
          const classeDet = calc?.enrobage.classeDeterminante ?? '--';
          const struct = calc?.modificateurs.classeFinale ?? '--';
          const cat = calc?.categorieOptimale ? `Cat. ${calc.categorieOptimale.code}` : '--';

          return (
            <div
              key={el.id}
              onClick={() => onSelectElement(el.id)}
              className={`group relative p-3 rounded-lg border transition-all cursor-pointer text-left flex flex-col justify-between ${
                isActive
                  ? 'bg-white text-zinc-950 border-zinc-500 ring-1 ring-zinc-500/20 shadow-xs'
                  : 'bg-zinc-50/60 hover:bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 inline-block"></span>
                    )}
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {el.typeElement}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateElement(el.id);
                      }}
                      title="Dupliquer (ex: pour créer l'autre face du voile)"
                      className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {elements.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Supprimer "${el.nom}" ?`)) {
                            onDeleteElement(el.id);
                          }
                        }}
                        title="Supprimer cette face"
                        className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-semibold truncate text-zinc-900">
                  {el.nom || `Face sans nom #${index + 1}`}
                </h3>
              </div>

              {/* Metrics Pills */}
              <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-[11px] text-zinc-500">cnom:</span>
                  <span className="font-bold text-sm text-zinc-900 font-mono">
                    {cnom} mm
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                    S{struct}
                  </span>
                  <span className="px-1.5 py-0.5 rounded font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                    {classeDet}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-50 text-zinc-700 border border-zinc-200">
                    {cat}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
