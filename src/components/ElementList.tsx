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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-md transition-colors"
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
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs ring-2 ring-zinc-900/10'
                  : 'bg-zinc-50/70 hover:bg-white text-zinc-800 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {el.typeElement}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateElement(el.id);
                      }}
                      title="Dupliquer (ex: pour créer l'autre face du voile)"
                      className={`p-1 rounded transition-colors ${
                        isActive
                          ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                          : 'hover:bg-zinc-200 text-zinc-500'
                      }`}
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
                        className={`p-1 rounded transition-colors ${
                          isActive
                            ? 'hover:bg-zinc-800 text-zinc-400 hover:text-red-400'
                            : 'hover:bg-zinc-200 text-zinc-500 hover:text-red-600'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3
                  className={`text-sm font-semibold truncate ${
                    isActive ? 'text-white' : 'text-zinc-900'
                  }`}
                >
                  {el.nom || `Face sans nom #${index + 1}`}
                </h3>
              </div>

              {/* Metrics Pills */}
              <div className="mt-3 pt-2 border-t border-zinc-200/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-[11px] opacity-75">cnom:</span>
                  <span
                    className={`font-bold text-sm ${
                      isActive ? 'text-sky-300' : 'text-sky-700'
                    }`}
                  >
                    {cnom} mm
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-200'
                        : 'bg-zinc-200/80 text-zinc-700'
                    }`}
                  >
                    S{struct}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-200'
                        : 'bg-zinc-200/80 text-zinc-700'
                    }`}
                  >
                    {classeDet}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-zinc-800 text-emerald-300'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
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
