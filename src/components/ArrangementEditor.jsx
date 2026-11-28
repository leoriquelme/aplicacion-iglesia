import { useEffect, useRef, useState } from 'react';
import ConfirmX from './ConfirmX.jsx';
import {
  MARKER, MAX_CUSTOM, sectionAbbr, sectionLabel, cleanCustomName, flattenGroups, groupOrder, isMarker, markerName, parseSong, sectionKind,
  validCustomName,
} from '../lib/chordpro.js';

// Secciones que se pueden agregar al orden aunque no tengan letra (solo una marca).
const MARKERS = ['INTRO', 'INTERLUDIO', 'INSTRUMENTAL', 'FINAL'];
const CUSTOM = '__personalizada__';

/**
 * Orden de las secciones en una columna vertical:
 * arrastrar para mover, − / + para repetir (×2, ×3…), ✕ para quitar
 * y una lista desplegable para agregar secciones o marcas sin letra.
 * `order` es una lista de nombres; vacío o undefined = orden original.
 */
export default function ArrangementEditor({ content, order, onChange, fallbackOrder, resetLabel = 'Orden original', readOnly = false, compact = false, onPick }) {
  const sections = parseSong(content);
  const names = new Set(sections.map((s) => s.name));
  const base = (order?.length ? order : fallbackOrder?.length ? fallbackOrder : sections.map((s) => s.name))
    .filter((n) => names.has(n) || isMarker(n));
  const groups = groupOrder(base);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [writing, setWriting] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [actual, setActual] = useState(0);
  const listRef = useRef(null);
  const drag = useRef(null);

  if (sections.length === 0) return <p className="muted small">La canción no tiene secciones.</p>;

  const commit = (g) => onChange(flattenGroups(g));
  const setTimes = (i, times) => commit(groups.map((g, k) => (k === i ? { ...g, times } : g)));
  const move = (from, to) => {
    if (from === null || to === null || from === to || from + 1 === to) return;
    const list = [...groups];
    const [item] = list.splice(from, 1);
    list.splice(to > from ? to - 1 : to, 0, item);
    commit(list);
  };
  // Arrastrar con mouse o con el dedo (eventos "pointer"). Con el dedo se arrastra desde ⠿
  // para que el resto de la fila deje mover la página.
  const overIndex = (y) => {
    const items = [...(listRef.current?.querySelectorAll('.order-item') || [])];
    const k = items.findIndex((el) => { const r = el.getBoundingClientRect(); return y < r.top + r.height / 2; });
    return k === -1 ? items.length : k;
  };
  const endDrag = () => { drag.current = null; setDragFrom(null); setDragOver(null); };
  const dragProps = (i) => (readOnly ? {} : {
    onPointerDown: (e) => {
      if (e.button > 0 || e.target.closest('button, input, select')) return;
      if (e.pointerType !== 'mouse' && !e.target.closest('.grip')) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      drag.current = { from: i, over: i };
      setDragFrom(i);
      setDragOver(i);
    },
    onPointerMove: (e) => {
      if (!drag.current) return;
      const over = overIndex(e.clientY);
      if (over !== drag.current.over) { drag.current.over = over; setDragOver(over); }
    },
    onPointerUp: () => {
      if (!drag.current) return;
      const { from, over } = drag.current;
      endDrag();
      move(from, over);
    },
    onPointerCancel: endDrag,
  });
  const add = (name) => commit([...groups, { name, times: 1 }]);

  const customMarkers = [...new Set(base.filter(isMarker).map(markerName).filter((n) => sectionKind(n) === 'custom'))];
  const customFull = customMarkers.length >= MAX_CUSTOM;

  const choose = (value) => {
    if (!value) return;
    if (value === CUSTOM) { setWriting(true); setError(''); return; }
    add(value);
  };
  const addCustom = () => {
    const name = cleanCustomName(text);
    if (!validCustomName(name)) { setError('Usa al menos 3 letras, que no sea un acorde ni un tipo de la lista.'); return; }
    if (!customMarkers.includes(name) && customFull) { setError(`Máximo ${MAX_CUSTOM} personalizadas.`); return; }
    add(MARKER + name);
    setText(''); setWriting(false); setError('');
  };

  const isCustom = Boolean(order?.length);

  // Vista compacta: marca la parte que se está viendo mientras se baja por la canción.
  useEffect(() => {
    if (!compact || typeof IntersectionObserver === 'undefined') return undefined;
    const els = groups.map((_, i) => document.getElementById(`seccion-${i}`)).filter(Boolean);
    if (!els.length) return undefined;
    const obs = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).map((e) => Number(e.target.id.split('-')[1]));
      if (visible.length) setActual(Math.min(...visible));
    }, { rootMargin: '-25% 0px -65% 0px' });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [compact, groups.length, content]); // eslint-disable-line react-hooks/exhaustive-deps

  // Vista compacta (solo lectura): puntos pastel con la letra de cada parte, sin números.
  if (compact) {
    return (
      <ol className="order-rail-list">
        {groups.map((g, i) => {
          const label = isMarker(g.name) ? markerName(g.name) : sectionLabel(g.name);
          const nombre = `${label}${g.times > 1 ? ` ×${g.times}` : ''}`;
          return (
            <li key={i} className={`rail-item k-${sectionKind(label)} ${i === actual ? 'actual' : ''}`}>
              <button type="button" onClick={() => { setActual(i); onPick?.(i); }} title={nombre} aria-label={nombre} aria-current={i === actual ? 'true' : undefined}>
                <span className="rail-abbr">{sectionAbbr(label)}</span>
                {g.times > 1 && <span className="rail-times">×{g.times}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <div className="arrangement">
      <ol className={`order-list ${dragFrom !== null ? 'is-dragging' : ''}`} ref={listRef}>
        {groups.map((g, i) => {
          const label = isMarker(g.name) ? markerName(g.name) : sectionLabel(g.name);
          const kind = sectionKind(label);
          return (
            <li
              key={i}
              className={`order-item k-${kind} ${dragFrom === i ? 'dragging' : ''} ${dragOver === i && dragFrom !== null && dragFrom !== i && dragFrom + 1 !== i ? 'drop-before' : ''}`}
              {...dragProps(i)}
              title={readOnly ? label : 'Arrastra para mover'}
            >
              {!readOnly && <span className="grip" aria-hidden="true">⠿</span>}
              <span className="order-num">{i + 1}</span>
              <span className="order-name">
                {label}
                {isMarker(g.name) && <span className="muted small"> · sin letra</span>}
              </span>
              {g.times > 1 && <span className="times">×{g.times}</span>}
              {!readOnly && (
                <span className="order-actions">
                  <button type="button" className="mini" aria-label={`Una vez menos ${label}`} title="Repetir una vez menos" disabled={g.times === 1} onClick={() => setTimes(i, g.times - 1)}>−</button>
                  <button type="button" className="mini" aria-label={`Repetir ${label}`} title="Repetir (×2, ×3…)" disabled={g.times >= 4} onClick={() => setTimes(i, g.times + 1)}>+</button>
                  <ConfirmX label={`Quitar ${label}`} disabled={groups.length === 1} onConfirm={() => commit(groups.filter((_, k) => k !== i))} />
                </span>
              )}
            </li>
          );
        })}
        {!readOnly && (
          <li className={`order-end ${dragOver === groups.length && dragFrom !== null ? 'drop-before' : ''}`} />
        )}
      </ol>
      {!readOnly && (
        <>
          <div className="orden-sumar" role="group" aria-label="Sumar una parte al final del orden">
            <span className="orden-sumar-titulo muted small">Sumar al final:</span>
            {sections.map((s) => {
              const label = sectionLabel(s.name);
              return (
                <button key={s.name} type="button" className={`orden-chip k-${sectionKind(label)}`} onClick={() => add(s.name)} title={`Sumar ${label} al final`} aria-label={`Sumar ${label} al final`}>
                  <span className="orden-chip-abbr">{sectionAbbr(label)}</span> {label}
                </button>
              );
            })}
          </div>
          <select className="section-select" value="" onChange={(e) => choose(e.target.value)} aria-label="Agregar sección al orden">
            <option value="">＋ Otras (intro, final…)</option>
            <optgroup label="De la letra">
              {sections.map((s) => <option key={s.name} value={s.name}>{sectionLabel(s.name)}</option>)}
            </optgroup>
            <optgroup label="Sin letra (solo una marca)">
              {MARKERS.map((m) => <option key={m} value={MARKER + m}>{m}</option>)}
              {customMarkers.map((m) => <option key={m} value={MARKER + m}>{m}</option>)}
              <option value={CUSTOM} disabled={customFull}>
                ✎ Personalizada…{customFull ? ` (ya hay ${MAX_CUSTOM})` : ` (quedan ${MAX_CUSTOM - customMarkers.length})`}
              </option>
            </optgroup>
          </select>
          {writing && (
            <div className="row gap wrap">
              <input
                className="sec-input grow"
                autoFocus
                value={text}
                placeholder="Ej. SOLO DE GUITARRA"
                onChange={(e) => setText(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addCustom(); }
                  if (e.key === 'Escape') setWriting(false);
                }}
              />
              <button type="button" className="btn small primary" onClick={addCustom}>Agregar</button>
              <button type="button" className="btn small ghost" onClick={() => { setWriting(false); setError(''); }}>✕</button>
            </div>
          )}
          {error && <p className="error small">{error}</p>}
          {isCustom && (
            <button type="button" className="btn ghost small" onClick={() => onChange(undefined)}>
              ↺ {resetLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
