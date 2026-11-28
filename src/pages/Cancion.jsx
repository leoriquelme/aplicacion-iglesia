import { songKey } from '../lib/importar.js';
import { sePuedeEditar } from '../lib/limitesEventos.js';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getCapo, getPersonalKey, setCapo as saveCapo, setPersonalKey, useStore } from '../lib/store.jsx';
import { displayKey, guessKey, transposeKey } from '../lib/chordpro.js';
import { sortEvents, todayISO, formatLong } from '../lib/dates.js';
import SongView from '../components/SongView.jsx';
import CompartirCancion from '../components/CompartirCancion.jsx';
import ArrangementEditor from '../components/ArrangementEditor.jsx';
import Icon from '../components/Icon.jsx';
import SpotifyLogo from '../components/SpotifyLogo.jsx';
import { linkAbrir } from '../lib/spotify.js';
import { linkVerYouTube } from '../lib/youtube.js';
import YouTubeLogo from '../components/YouTubeLogo.jsx';
import ConfirmarEliminar from '../components/ConfirmarEliminar.jsx';
import { ElegirNota } from '../components/NotasCancion.jsx';
import { alternarNota, notasPorSeccion } from '../lib/notas.js';
import { LATINO, LETRAS, partesDeTono, pasosHacia } from '../lib/tonalidad.js';

export default function Cancion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { songs, events, settings, deleteSong, saveEvent, saveSong, can, favorites = [], toggleFavorite, myNotes = {}, setMyNotes } = useStore();
  // Si se abrió desde un evento, el tono lo fijó quien armó el culto.
  const fromEvent = params.get('ev') ? events.find((e) => e.id === params.get('ev')) : null;
  // Tono personal: cada músico guarda su propio tono en su equipo.
  const [personalSteps, setStepsState] = useState(() => getPersonalKey(id));
  const setSteps = (n) => {
    setStepsState(n);
    setPersonalKey(id, n);
  };
  useEffect(() => setStepsState(getPersonalKey(id)), [id]);
  const steps = fromEvent ? Number(params.get('t')) || 0 : personalSteps;
  // Capo personal: el tono suena igual, pero los acordes se muestran con formas más fáciles.
  const [capo, setCapoState] = useState(() => getCapo(id));
  useEffect(() => setCapoState(getCapo(id)), [id]);
  const setCapo = (n) => {
    setCapoState(n);
    saveCapo(id, n);
  };
  const [added, setAdded] = useState('');
  const [editOrder, setEditOrder] = useState(false);
  const [editNotes, setEditNotes] = useState(false);
  const [noteFor, setNoteFor] = useState(null);
  const [verHoja, setVerHoja] = useState(null);
  const song = songs.find((s) => s.id === id);

  if (!song) {
    return (
      <div className="page">
        <p>No se encontró la canción.</p>
        <Link to="/canciones">← Volver a canciones</Link>
      </div>
    );
  }

  const shownOrder = fromEvent?.items.find((i) => i.songId === song.id && i.order?.length)?.order || song.order;
  // Abierta desde un evento: el orden que se edita es el de ese evento (no el general de la canción).
  const ordenDelEvento = Boolean(fromEvent && can.events && sePuedeEditar(fromEvent));
  const guardarOrden = (order) => {
    if (ordenDelEvento) saveEvent({ ...fromEvent, items: fromEvent.items.map((i) => (i.songId === song.id ? { ...i, order } : i)) });
    else saveSong({ ...song, order });
  };
  const puedeEditarOrden = fromEvent ? ordenDelEvento : can.edit;
  const directorNotes = song.notes || [];
  const misNotas = myNotes[song.id] || [];
  const saveDirector = (list) => saveSong({ ...song, notes: list });
  const saveMias = (list) => setMyNotes?.(song.id, list);
  const removeNote = (section, n) => (n.mine ? saveMias(alternarNota(misNotas, section, n.id)) : saveDirector(alternarNota(directorNotes, section, n.id)));

  // Solo los próximos eventos (nunca los pasados).
  const upcoming = sortEvents(events.filter((e) => e.date >= todayISO()));


  const addToEvent = (eventId) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;
    saveEvent({ ...ev, items: [...ev.items, { songId: song.id, transpose: steps }] });
    setAdded(`Agregada a "${ev.name}"`);
  };

  const tono = songKey(song);
  const tonoActual = displayKey(tono, steps, settings.notation);
  const hoja = verHoja;
  const setHoja = setVerHoja;

  return (
    <div className="page cancion">
      <div className="cancion-barra">
        <Link to="/canciones" className="barra-btn atras" aria-label="Volver a canciones" title="Canciones">‹</Link>
        <div className="barra-grupo">
          <Link className="barra-btn barra-presentar" to={`/presentar/cancion/${song.id}?t=${steps}`} title="Presentar"><Icon name="play" /> Presentar</Link>
          {setMyNotes && (
            <button type="button" className={`barra-btn ${editNotes ? 'on' : ''}`} onClick={() => setEditNotes(!editNotes)} aria-pressed={editNotes} aria-label="Notas" title="Notas">
              <Icon name="note" />
            </button>
          )}
          {can.events && upcoming.length > 0 && (
            <label className="barra-btn" title="Agregar a un evento">
              <Icon name="calendar" />
              <select className="barra-select" value="" onChange={(e) => addToEvent(e.target.value)} aria-label="Agregar a un evento">
                <option value="">+ Agregar a un evento…</option>
                {upcoming.map((e) => (
                  <option key={e.id} value={e.id}>{e.name} · {formatLong(e.date)}</option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="barra-grupo">
          <button type="button" className="barra-btn barra-tono" onClick={() => setHoja('tono')} aria-label="Cambiar tono" title="Tono">
            {tonoActual || 'Tono'}
            {steps !== 0 && <span className="barra-badge">{steps > 0 ? `+${steps}` : steps}</span>}
          </button>
          {can.edit && (
            <Link className="barra-btn" to={`/canciones/${song.id}/editar`} aria-label="Editar canción" title="Editar"><Icon name="edit" /></Link>
          )}
        </div>
      </div>

      <h1 className="cancion-titulo">
        {song.title}{' '}
        {toggleFavorite && (
          <button
            className={`fav-star ${favorites.includes(song.id) ? 'on' : ''}`}
            onClick={() => toggleFavorite(song.id)}
            aria-pressed={favorites.includes(song.id)}
            title={favorites.includes(song.id) ? 'Quitar de mis favoritas' : 'Agregar a mis favoritas (solo tú las ves)'}
          >
            {favorites.includes(song.id) ? '★' : '☆'}
          </button>
        )}
      </h1>
      <p className="cancion-meta">
        {[song.author, song.bpm && `${song.bpm} BPM`, song.compas].filter(Boolean).join(' • ')}
        {linkAbrir(song.spotify) && (
          <a className="spotify-btn" href={linkAbrir(song.spotify)} target="_blank" rel="noopener noreferrer" title="Abrir esta canción en Spotify">
            <SpotifyLogo /> Escuchar en Spotify
          </a>
        )}
        {linkVerYouTube(song.youtube) && (
          <a className="spotify-btn youtube-btn" href={linkVerYouTube(song.youtube)} target="_blank" rel="noopener noreferrer" title="Ver el video en YouTube">
            <YouTubeLogo /> Ver en YouTube
          </a>
        )}
      </p>
      {(fromEvent || capo > 0) && (
        <p className="cancion-aviso muted small">
          {fromEvent && <>Tono del servicio <Link to={`/eventos/${fromEvent.id}`}>“{fromEvent.name}”</Link>. </>}
          {capo > 0 && <>Capo {capo}{tono ? `: tocas como en ${displayKey(tono, steps - capo, settings.notation)}, suena en ${tonoActual}` : ''}.</>}
        </p>
      )}
      {added && <p className="ok cancion-agregada">✓ {added}</p>}

      {!editOrder && (
        <nav className="orden-fila" aria-label="Orden de la canción">
          <ArrangementEditor
            content={song.content}
            order={shownOrder}
            readOnly
            compact
            onPick={(i) => document.getElementById(`seccion-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          />
          {puedeEditarOrden && (
            <button className="orden-editar" onClick={() => setEditOrder(true)} title="Editar el orden" aria-label="Editar el orden">
              <Icon name="edit" />
            </button>
          )}
        </nav>
      )}

      {/* Editando el orden: la letra a la izquierda y el orden en una columna a la derecha (en celular, arriba). */}
      <div className={editOrder ? 'song-layout orden-editando' : undefined}>
        <div className="song-layout-letra">
          {editNotes && <p className="muted small notas-ayuda">Toca “+ Nota” en una parte.</p>}
          <SongView content={song.content} songKey={tono} steps={steps - capo} order={shownOrder} settings={settings}
            className="song-tarjetas"
            notes={notasPorSeccion(directorNotes, misNotas)}
            onAddNote={editNotes ? setNoteFor : undefined}
            onRemoveNote={editNotes ? removeNote : undefined}
            canEditDirector={can.edit}
          />
        </div>
        {editOrder && (
          <aside className="order-panel" aria-label="Editar el orden">
            <div className="row between">
              <h3>Orden</h3>
              <button className="btn small primary" onClick={() => setEditOrder(false)}>✓ Listo</button>
            </div>
            <p className="muted small">{ordenDelEvento ? `Orden solo para “${fromEvent.name}” · ` : ''}Toca una parte para sumarla al final · Arrastra ⠿ para mover · + repite</p>
            <ArrangementEditor content={song.content} order={ordenDelEvento ? shownOrder : song.order} onChange={guardarOrden} />
          </aside>
        )}
      </div>
      {noteFor && (
        <ElegirNota
          section={noteFor}
          canDirector={can.edit}
          director={directorNotes}
          mias={misNotas}
          onDirector={saveDirector}
          onMia={saveMias}
          onClose={() => setNoteFor(null)}
        />
      )}

      <CompartirCancion song={song} />

      {can.delete && <ConfirmarEliminar text="Eliminar canción" question={`¿Eliminar "${song.title}"?`}
        onConfirm={() => deleteSong(song.id)} onDone={() => navigate('/canciones')} />}

      {hoja === 'tono' && (
        <CambiarTonalidad
          tono={tono || guessKey(song.content)} steps={steps} capo={capo} notation={settings.notation}
          fijo={fromEvent ? fromEvent.name : ''}
          onGuardar={(nuevoSteps, nuevoCapo) => { if (!fromEvent) setSteps(nuevoSteps); setCapo(nuevoCapo); setHoja(null); }}
          onCerrar={() => setHoja(null)}
        />
      )}
    </div>
  );
}

/** "½ tono", "1 tono", "1½ tonos"… a partir de semitonos. */
function enTonos(semitonos) {
  const enteros = Math.floor(semitonos / 2);
  const medio = semitonos % 2 === 1;
  if (!enteros) return '½ tono';
  return `${enteros}${medio ? '½' : ''} ${enteros === 1 && !medio ? 'tono' : 'tonos'}`;
}

/** Hoja "Cambiar tonalidad": tocar la nota, ♭ / ♯ y el capo. Se aplica al tocar Guardar. */
function CambiarTonalidad({ tono, steps, capo, notation, fijo, onGuardar, onCerrar }) {
  const inicial = partesDeTono(transposeKey(tono, steps)) || { letra: 'C', alt: '' };
  const [letra, setLetra] = useState(inicial.letra);
  const [alt, setAlt] = useState(inicial.alt);
  const [cejilla, setCejilla] = useState(capo);
  const nuevos = tono && !fijo ? pasosHacia(tono, letra, alt) : steps;
  const nombre = (k) => displayKey(tono, k, notation);
  const cambio = nuevos !== steps || cejilla !== capo;
  const alternar = (a) => setAlt((x) => (x === a ? '' : a));
  return createPortal(
    <div className="modal-fondo hoja-fondo" role="dialog" aria-modal="true" aria-label="Cambiar tonalidad" onClick={onCerrar}>
      <div className="hoja-abajo" onClick={(e) => e.stopPropagation()}>
        <div className="hoja-cabeza">
          <button type="button" className="hoja-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
          <h2>Cambiar tonalidad</h2>
        </div>
        {tono ? (
          <>
            <p className="hoja-original">Original {nombre(0)}{fijo ? ` · fijado por "${fijo}"` : ''}</p>
            <div className={`notas-grilla ${fijo ? 'fijo' : ''}`} role="radiogroup" aria-label="Nota">
              {LETRAS.map((l) => (
                <button key={l} type="button" role="radio" aria-checked={l === letra} disabled={!!fijo}
                  className={`nota-btn ${l === letra ? 'elegida' : ''}`} onClick={() => setLetra(l)}>
                  {notation === 'latino' ? LATINO[l] : l}
                </button>
              ))}
            </div>
            <div className="alteraciones">
              <button type="button" disabled={!!fijo} className={alt === 'b' ? 'elegida' : ''} aria-pressed={alt === 'b'} onClick={() => alternar('b')}>♭</button>
              <span aria-hidden="true" />
              <button type="button" disabled={!!fijo} className={alt === '#' ? 'elegida' : ''} aria-pressed={alt === '#'} onClick={() => alternar('#')}>♯</button>
            </div>
            <p className="hoja-resultado">Tono: <strong>{nombre(nuevos)}</strong>{nuevos ? ` (${nuevos > 0 ? '+' : ''}${nuevos})` : ''}</p>
          </>
        ) : <p className="muted">Esta canción no tiene tono elegido.</p>}
        <h3 className="hoja-sub">Capo</h3>
        <div className="cejilla">
          <button type="button" onClick={() => setCejilla((c) => Math.max(0, c - 1))} disabled={cejilla === 0} aria-label="Bajar capo">⌄</button>
          <span className="cejilla-num">{cejilla}{tono && <small> ({nombre(nuevos - cejilla)})</small>}</span>
          <button type="button" onClick={() => setCejilla((c) => Math.min(7, c + 1))} disabled={cejilla === 7} aria-label="Subir capo">⌃</button>
          {cejilla > 0 && <span className="muted small">Tocas como en {tono ? nombre(nuevos - cejilla) : '…'} · {enTonos(cejilla)} más abajo</span>}
        </div>
        <button type="button" className="btn primary big hoja-guardar" disabled={!cambio} onClick={() => onGuardar(nuevos, cejilla)}>Guardar</button>
      </div>
    </div>,
    document.body,
  );
}
