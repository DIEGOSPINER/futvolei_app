/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, Arena, Match, MonthlyStat, Duo } from '../types';
import DynamicNotifications from './DynamicNotifications';
import { 
  User, 
  MapPin, 
  Calendar, 
  Award, 
  Trophy, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  UserPlus, 
  Users, 
  LogOut, 
  Sparkles,
  Info
} from 'lucide-react';

interface PlayerDashboardProps {
  players: Player[];
  arenas: Arena[];
  duos: Duo[];
  matches: Match[];
  loggedPlayerId: string;
  setLoggedPlayerId: (id: string) => void;
  onRegisterPlayer: (name: string, arenaId: string, photoUrl: string) => void;
  onValidateMatch: (matchId: string, playerId: string) => void;
  onRejectMatch: (matchId: string, playerId: string) => void;
}

// Preset high-quality photos for new player registration to make user boarding look awesome
const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", // Female Athlete 1
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150", // Male Athlete 1
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", // Female Athlete 2
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150", // Male Athlete 2
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"  // Female Athlete 3
];

export default function PlayerDashboard({
  players,
  arenas,
  duos,
  matches,
  loggedPlayerId,
  setLoggedPlayerId,
  onRegisterPlayer,
  onValidateMatch,
  onRejectMatch
}: PlayerDashboardProps) {
  
  // Registration Form Local States
  const [showRegForm, setShowRegForm] = useState(false);
  const [regName, setRegName] = useState('');
  const [regArenaId, setRegArenaId] = useState(arenas[0]?.id || '');
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState(0);
  const [regError, setRegError] = useState<string | null>(null);

  // Active athlete context
  const currentUser = players.find(p => p.id === loggedPlayerId) || players[0];
  const favoriteArena = arenas.find(a => a.id === currentUser?.arenaId);

  // Determine pending match validations for this active player
  // A match is pending for the active player if:
  // - status is 'pending'
  // - player is a participant (A1, A2, B1 or B2)
  // - player has NOT validated it yet (ID not in validatedBy)
  const pendingInBoxMatches = matches.filter(match => {
    const isParticipant = match.playerIds.includes(loggedPlayerId);
    const alreadyValidatedByMe = match.validatedBy.includes(loggedPlayerId);
    return match.status === 'pending' && isParticipant && !alreadyValidatedByMe;
  });

  // Also calculate matches created by other players where we are waiting for counterpart
  const matchesWaitingForOthers = matches.filter(match => {
    const isParticipant = match.playerIds.includes(loggedPlayerId);
    const alreadyValidatedByMe = match.validatedBy.includes(loggedPlayerId);
    return match.status === 'pending' && isParticipant && alreadyValidatedByMe;
  });

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError("Por favor, preencha o nome do atleta.");
      return;
    }

    if (players.some(p => p.name.toLowerCase() === regName.trim().toLowerCase())) {
      setRegError("Este nome de atleta já está cadastrado.");
      return;
    }

    onRegisterPlayer(regName.trim(), regArenaId, PRESET_AVATARS[selectedAvatarIdx]);
    setRegName('');
    setShowRegForm(false);
  };

  return (
    <div className="space-y-6" id="player-dashboard">
      
      {/* 1. TOP HEADER: CURRENT SESSION BAR & SIMULATION SWITCHER */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={currentUser?.photoUrl} 
                alt={currentUser?.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-400 bg-slate-800 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-black tracking-widest text-indigo-300 bg-indigo-950/80 border border-indigo-800/40 px-2 py-0.5 rounded-full uppercase">
                  Atleta Conectado
                </span>
                <span className="text-[9px] font-black tracking-wider text-rose-300 bg-rose-950/80 border border-rose-800/40 px-2 py-0.5 rounded-full uppercase">
                  Perfil Protegido Anti-Fraude
                </span>
              </div>
              <h2 className="font-extrabold text-lg tracking-tight text-white leading-tight mt-0.5">{currentUser?.name}</h2>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>Filiado a {favoriteArena?.name || 'Associação Avulsa'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-stretch sm:items-center">
            {/* Direct Switch Dropdown to simulate other users */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-center gap-2">
              <span className="text-[9.5px] font-bold text-slate-300 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Simular como outro:
              </span>
              <select
                value={loggedPlayerId}
                onChange={(e) => setLoggedPlayerId(e.target.value)}
                className="bg-slate-950 text-white text-xs p-1.5 px-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer w-full sm:w-auto"
                id="logged-session-swapper"
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Register New User Button */}
            <button
              onClick={() => setShowRegForm(!showRegForm)}
              id="btn-trigger-register"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Novo Cadastro</span>
            </button>
          </div>

        </div>

        {/* REGISTRATION FORM COMPONENT (EXPANDABLE) */}
        {showRegForm && (
          <div className="mt-5 p-5 bg-slate-950 rounded-2xl border border-slate-800/85 text-slate-200" id="registration-form-modal">
            <h3 className="font-extrabold text-sm text-indigo-300 flex items-center gap-1.5 mb-1">
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Novo Atleta no Circuito</span>
            </h3>
            <p className="text-[10px] text-slate-400 mb-4">Insira o nome, escolha um avatar esportivo e defina qual a quadra nativa do atleta no banco NoSQL.</p>

            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Input Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nome Completo / Apelido no Ranking</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: Pedro 'Pé de Vento'"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Favorite/Affiliated Arena selection */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Arena Príncipal de Afiliação</label>
                  <select
                    value={regArenaId}
                    onChange={(e) => setRegArenaId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    {arenas.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.city})</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Avatar Selector Presets */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Selecione uma Foto de Perfil</label>
                <div className="flex gap-3 flex-wrap">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatarIdx(idx)}
                      className={`relative rounded-2xl overflow-hidden p-0.5 border-2 transition ${
                        selectedAvatarIdx === idx ? 'border-indigo-500 scale-105 shadow-md' : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="w-12 h-12 object-cover rounded-xl" />
                      {selectedAvatarIdx === idx && (
                        <div className="absolute inset-0 bg-indigo-600/15 flex items-center justify-center">
                          <span className="text-[10px] bg-indigo-600 text-white rounded-full p-0.5">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {regError && (
                <p className="text-[11px] text-red-400 font-bold bg-red-950/20 p-2 rounded-lg border border-red-900/50 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {regError}
                </p>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegForm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Confirmar Cadastro
                </button>
              </div>

            </form>
          </div>
        )}

      </div>

      {/* Athlete Motivation Alerts / Insights Panel */}
      <DynamicNotifications 
        currentUser={currentUser}
        players={players}
        duos={duos}
        arenas={arenas}
        matches={matches}
      />

      {/* 2. ANTI-FRAUD SECTION: RESULTS TO VALIDATE INBOX */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-150 shadow-sm space-y-4" id="anti-fraud-inbox-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 leading-none">
              <span className="p-1.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <span>🔒 Caixa de Homologação Anti-Fraude ({pendingInBoxMatches.length} em espera)</span>
            </h3>
            <p className="text-[10px] text-slate-500">
              Para validar o ranking, o resultado registrado deve ser homologado por ao menos <strong>um atleta de cada dupla</strong>.
            </p>
          </div>
          
          <span className="text-[9.5px] font-black text-rose-600 font-mono bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase">
            REDIRECIONAMENTO MULTILATERAL NO FIRESTORE
          </span>
        </div>

        {/* Pending matches grid cards lists */}
        {pendingInBoxMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="list-pending-validation-matches">
            {pendingInBoxMatches.map((match) => {
              // Determine which team we are in
              const onTeamA = match.teamA.includes(currentUser.id);
              const partnerId = onTeamA 
                ? match.teamA.find(id => id !== currentUser.id) 
                : match.teamB.find(id => id !== currentUser.id);
              const partnerName = players.find(p => p.id === partnerId)?.name || 'Parceiro';
              
              const opponentIds = onTeamA ? match.teamB : match.teamA;
              const opName1 = players.find(p => p.id === opponentIds[0])?.name || 'Oponente 1';
              const opName2 = players.find(p => p.id === opponentIds[1])?.name || 'Oponente 2';

              const creatorName = players.find(p => p.id === match.createdBy)?.name || 'Outro atleta';

              // Decide how scoreboard displays relative to the logged-in player
              // This is beautiful! We show "Você e [Parceito] {A_Score} x {B_Score} [Opponents]"
              const scoreMine = onTeamA ? match.scoreA : match.scoreB;
              const scoreTheirs = onTeamA ? match.scoreB : match.scoreA;
              const isWinClaimed = (onTeamA && match.winnerTeam === 'A') || (!onTeamA && match.winnerTeam === 'B');

              return (
                <div 
                  key={match.id} 
                  className="bg-gradient-to-br from-rose-50/20 to-slate-50 border-2 border-rose-100 hover:border-rose-250 p-4 rounded-2xl relative shadow-inner space-y-3 flex flex-col justify-between"
                  id={`box-pending-${match.id}`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[8.5px] font-black text-rose-800 bg-rose-100/50 px-2 py-0.5 rounded-md uppercase tracking-wider block">
                        Aguardando Sua Validação
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 font-bold text-right shrink-0">
                        📁 {match.date}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-slate-900 leading-normal">
                        Partida cadastrada por <strong className="text-indigo-600 font-bold">{creatorName}</strong> na <strong className="text-slate-800">{match.arenaName}</strong>. 
                      </div>
                      
                      {/* Detailed Score breakdown relative to us */}
                      <div className="p-2 bg-white rounded-xl border border-slate-150 inline-flex items-center gap-3.5 font-sans justify-center w-full">
                        <div className="text-center font-bold shrink-0">
                          <span className="text-[9px] text-slate-400 block uppercase leading-none mb-1">Seu Time</span>
                          <span className="text-xs text-slate-900 block leading-tight truncate max-w-[110px]">{currentUser.name.split(' ')[0]} + {partnerName.split(' ')[0]}</span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-base font-extrabold px-3 py-1 bg-slate-50 border border-slate-200/60 rounded-xl shrink-0">
                          <span className={isWinClaimed ? 'text-emerald-600 font-black' : 'text-slate-550'}>{scoreMine}</span>
                          <span className="text-slate-300">x</span>
                          <span className={!isWinClaimed ? 'text-emerald-600 font-black' : 'text-slate-550'}>{scoreTheirs}</span>
                        </div>

                        <div className="text-center font-bold shrink-0">
                          <span className="text-[9px] text-slate-400 block uppercase leading-none mb-1">Rival</span>
                          <span className="text-xs text-slate-800 block leading-tight truncate max-w-[115px]">{opName1.split(' ')[0]} + {opName2.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end shrink-0 pt-1">
                    {/* Disagree / Reject action */}
                    <button
                      onClick={() => onRejectMatch(match.id, currentUser.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-[10.5px] transition flex items-center gap-1 truncate cursor-pointer shadow-sm"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Contestar (Fraude!)</span>
                    </button>

                    {/* Agree / Validate result action */}
                    <button
                      onClick={() => onValidateMatch(match.id, currentUser.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10.5px] transition flex items-center gap-1 truncate cursor-pointer shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmar Placar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center py-6">
            <CheckCircle2 className="w-9 h-9 text-emerald-500 mb-2 animate-bounce" />
            <strong className="text-slate-800 text-xs block font-bold leading-normal">Ambiente Inteiramente Consistente!</strong>
            <p className="text-[10px] text-slate-400 max-w-sm mt-0.5 leading-normal">
              Não há partidas de rankings envolvendo você pendentes de validação no momento. Você pode registrar uma nova partida no formulário da aba de partidas para simulá-la!
            </p>
          </div>
        )}

        {/* Explaining the awaiting on rival section */}
        {matchesWaitingForOthers.length > 0 && (
          <div className="pt-2 border-t border-dashed border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">🚀 Partidas suas que você confirmou e aguardam o rival:</span>
            <div className="flex gap-2 flex-wrap">
              {matchesWaitingForOthers.map(m => {
                const isCreator = m.createdBy === currentUser.id;
                return (
                  <span key={m.id} className="inline-flex items-center gap-1.5 text-[9.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 p-1.5 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span>
                    <span>Placar {m.scoreA}x{m.scoreB} ({m.arenaName.split(' ')[1] || m.arenaName})</span>
                    <span className="text-[8.5px] text-indigo-400 bg-indigo-100/40 px-1 py-0.2 rounded font-mono">
                      {isCreator ? "Aguardando Confirmação Rival" : "Aguardando Rival"}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* 3. MIDDLE: INDIVIDUAL METRICS GRID PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="stats-widget-grid">
        
        {/* POINTS CARD */}
        <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">Pontuação Acumulada</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-4">
            <strong className="text-2xl font-black font-mono text-slate-900 block leading-none">{currentUser?.points || 0}</strong>
            <span className="text-[10px] text-slate-400 block mt-1">Pontos de Classificação Geral</span>
          </div>
          <div className="mt-3 text-[9px] text-slate-500 border-t border-slate-50 pt-2 leading-tight">
            Ganha <strong>+3 pontos</strong> por vitória confirmada e <strong>+1 ponto</strong> por derrota confirmada.
          </div>
        </div>

        {/* PRESENCE DAYS CARD */}
        <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">Controle de Frequência</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-4">
            <strong className="text-2xl font-black font-mono text-slate-900 block leading-none">{currentUser?.presenceDays || 0}</strong>
            <span className="text-[10px] text-slate-400 block mt-1">Dias com Presença Confirmada</span>
          </div>
          <div className="mt-3 text-[9px] text-slate-500 border-t border-slate-50 pt-2 leading-tight">
            Calcula automaticamente quantos dias o atleta realizou check-in jogando no circuito.
          </div>
        </div>

        {/* MATCHES PERFORMANCE CARD */}
        <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">Histórico Homologado</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-4">
            <strong className="text-2xl font-black font-mono text-slate-900 block leading-none">{currentUser?.totalMatches || 0}</strong>
            <span className="text-[10px] text-slate-400 block mt-1">Partidas válidas disputadas</span>
          </div>
          <div className="mt-3 text-[9px] text-slate-500 border-t border-slate-50 pt-2 leading-snug">
            <span className="text-emerald-600 font-bold mr-1">{currentUser?.wins}V</span> - <span className="text-rose-500 font-bold">{currentUser?.losses}D</span>
          </div>
        </div>

        {/* WINRATE SCORE CARD */}
        <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold uppercase tracking-widest bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md">Aproveitamento</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-4">
            <strong className="text-2xl font-black font-mono text-slate-900 block leading-none">
              {((currentUser?.winRate || 0) * 100).toFixed(0)}%
            </strong>
            <span className="text-[10px] text-slate-400 block mt-1">Índice de Rendimento Individual</span>
          </div>
          <div className="mt-3 text-[9px] text-slate-500 border-t border-slate-50 pt-2 leading-tight">
            Calculado no Firestore pelo quociente entre vitórias homologadas e jogos disputados.
          </div>
        </div>

      </div>

      {/* 4. FOOTER ADVISORY: FIRESTORE TRANSACTION LOGIC ADVANCED EXPLANATION */}
      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-2.5 text-indigo-900 leading-normal text-[11px]">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong>Transações Compartilhadas do Firestore:</strong> Para evitar que atletas cadastrem placares falsificados e ganhem pontos indevidamente, o Firestore armazena as partidas com <code>status: 'pending'</code>. 
          As regras de validação no dashboard individual exigem que um adversário aprove o resultado. Uma vez homologada bilateralmente, uma <strong>Transação Atômica do Firebase SDK (Dart/Flutter runTransaction)</strong> é executada, realizando escritas paralelas em 12 documentos diferentes de forma 100% segura. Se houver concorrência de rede, o banco repete automaticamente a operação até obter a gravação consistente de todos os contadores agregados.
        </div>
      </div>

    </div>
  );
}
