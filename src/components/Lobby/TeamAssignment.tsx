import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import TeamSection from './TeamSection';
import PlayerCard from './PlayerCard';
import type { Player, Team, TeamColor } from '../../types/game.types';

// Draggable Player Wrapper
const DraggablePlayer: React.FC<{
  player: Player;
  isCurrentPlayer: boolean;
  canRemove: boolean;
  onRemove?: (playerId: string) => Promise<void>;
  onClick?: (player: Player) => void;
  isDragging: boolean;
}> = ({ player, isCurrentPlayer, canRemove, onRemove, onClick, isDragging }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: player.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <PlayerCard
        player={player}
        isCurrentPlayer={isCurrentPlayer}
        canRemove={canRemove}
        onRemove={onRemove}
        onClick={onClick}
        isDragging={isDragging}
      />
    </div>
  );
};

// Droppable Team Wrapper
const DroppableTeam: React.FC<{
  team: Team;
  players: Player[];
  currentPlayerId?: string;
  canRemovePlayer: boolean;
  onPlayerRemove?: (playerId: string) => Promise<void>;
  onPlayerClick?: (player: Player) => void;
  isDragOver: boolean;
}> = ({ team, players, currentPlayerId, canRemovePlayer, onPlayerRemove, onPlayerClick, isDragOver }) => {
  const { setNodeRef } = useDroppable({
    id: `team-${team.color}`,
  });

  return (
    <div ref={setNodeRef}>
      <TeamSection
        team={team}
        players={players}
        currentPlayerId={currentPlayerId}
        canRemovePlayer={canRemovePlayer}
        onPlayerRemove={onPlayerRemove}
        onPlayerClick={onPlayerClick}
        isDragOver={isDragOver}
      />
    </div>
  );
};

interface TeamAssignmentProps {
  players: Player[];
  teams: Team[];
  currentPlayerId?: string;
  isHost: boolean;
  onAssignPlayer: (playerId: string, teamColor: TeamColor | undefined) => Promise<void>;
  onRemovePlayer?: (playerId: string) => Promise<void>;
  className?: string;
}

const TeamAssignment: React.FC<TeamAssignmentProps> = ({
  players,
  teams,
  currentPlayerId,
  isHost,
  onAssignPlayer,
  onRemovePlayer,
  className = '',
}) => {
  const { t } = useTranslation();
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [dragOverTeam, setDragOverTeam] = useState<TeamColor | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<'drag' | 'click'>('drag');

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Get unassigned players
  const unassignedPlayers = players.filter(player => !player.team);

  // Get players by team
  const getPlayersForTeam = (teamColor: TeamColor): Player[] => {
    return players.filter(player => player.team === teamColor);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const playerId = event.active.id as string;
    const player = players.find(p => p.id === playerId);
    if (player) {
      setDraggedPlayer(player);
    }
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id;
    if (overId && typeof overId === 'string') {
      // Check if dragging over a team
      const teamColors: TeamColor[] = ['red', 'blue', 'green', 'yellow'];
      const teamColor = teamColors.find(color => overId.includes(color));
      setDragOverTeam(teamColor || null);
    } else {
      setDragOverTeam(null);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setDraggedPlayer(null);
    setDragOverTeam(null);

    if (!over) return;

    const playerId = active.id as string;
    const overId = over.id as string;

    // Determine target team
    let targetTeam: TeamColor | undefined;
    
    if (overId === 'unassigned') {
      targetTeam = undefined;
    } else {
      const teamColors: TeamColor[] = ['red', 'blue', 'green', 'yellow'];
      targetTeam = teamColors.find(color => overId.includes(color));
    }

    // Only assign if different from current team
    const player = players.find(p => p.id === playerId);
    if (player && player.team !== targetTeam) {
      try {
        await onAssignPlayer(playerId, targetTeam);
      } catch (error) {
        console.error('Failed to assign player to team:', error);
      }
    }
  };

  // Handle player click (for click mode)
  const handlePlayerClick = (player: Player) => {
    if (assignmentMode === 'click') {
      setSelectedPlayer(player);
    }
  };

  // Handle team selection in click mode
  const handleTeamSelect = async (teamColor: TeamColor | undefined) => {
    if (selectedPlayer) {
      try {
        await onAssignPlayer(selectedPlayer.id, teamColor);
        setSelectedPlayer(null);
      } catch (error) {
        console.error('Failed to assign player to team:', error);
      }
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Assignment Mode Toggle */}
      {isHost && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {t('lobby.teamAssignment')}
          </h2>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{t('lobby.assignmentMode')}:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setAssignmentMode('drag')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  assignmentMode === 'drag'
                    ? 'bg-mulik-primary-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {t('lobby.dragDrop')}
              </button>
              <button
                onClick={() => setAssignmentMode('click')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  assignmentMode === 'click'
                    ? 'bg-mulik-primary-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {t('lobby.clickAssign')}
              </button>
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Unassigned Players */}
        {unassignedPlayers.length > 0 && (
          <motion.div
            className="bg-white rounded-lg border-2 border-gray-200 p-4"
            layout
          >
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">👥</span>
              {t('lobby.waitingPlayers')} ({unassignedPlayers.length})
            </h3>
            
            <div 
              id="unassigned"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {unassignedPlayers.map((player) => (
                <motion.div
                  key={player.id}
                  layout
                >
                  {assignmentMode === 'drag' ? (
                    <DraggablePlayer
                      player={player}
                      isCurrentPlayer={player.id === currentPlayerId}
                      canRemove={isHost && !!onRemovePlayer && !player.isHost}
                      onRemove={onRemovePlayer}
                      isDragging={draggedPlayer?.id === player.id}
                    />
                  ) : (
                    <PlayerCard
                      player={player}
                      isCurrentPlayer={player.id === currentPlayerId}
                      canRemove={isHost && !!onRemovePlayer && !player.isHost}
                      onRemove={onRemovePlayer}
                      onClick={handlePlayerClick}
                      isDragging={draggedPlayer?.id === player.id}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <DroppableTeam
              key={team.color}
              team={team}
              players={getPlayersForTeam(team.color)}
              currentPlayerId={currentPlayerId}
              canRemovePlayer={isHost && !!onRemovePlayer}
              onPlayerRemove={onRemovePlayer}
              onPlayerClick={assignmentMode === 'click' ? handlePlayerClick : undefined}
              isDragOver={dragOverTeam === team.color}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedPlayer && (
            <PlayerCard
              player={draggedPlayer}
              isCurrentPlayer={draggedPlayer.id === currentPlayerId}
              isDragging={true}
              className="rotate-3 scale-105"
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Team Selection Modal (Click Mode) */}
      <AnimatePresence>
        {selectedPlayer && assignmentMode === 'click' && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPlayer(null)}
          >
            <motion.div
              className="bg-white rounded-lg p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">
                {t('lobby.assignPlayerToTeam', { name: selectedPlayer.name })}
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {teams.map((team) => (
                  <button
                    key={team.color}
                    onClick={() => handleTeamSelect(team.color)}
                    className={`
                      p-3 rounded-lg border-2 font-medium transition-all
                      ${team.color === 'red' ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' : ''}
                      ${team.color === 'blue' ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' : ''}
                      ${team.color === 'green' ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' : ''}
                      ${team.color === 'yellow' ? 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : ''}
                    `}
                  >
                    {team.name} Team
                    <div className="text-sm opacity-75">
                      {getPlayersForTeam(team.color).length} players
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleTeamSelect(undefined)}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('lobby.removeFromTeam')}
                </button>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamAssignment;
