/**
 * GameGraph — the single reusable spatial graph component.
 *
 * Map is fixed (no zoom/pan). Callers supply nodes, edges, playerPos,
 * and a renderNode function.
 */
import type { GNode, GEdge, ViewBox } from '../lib/graphLayout';
import { useAnimatedPosition } from '../lib/useAnimatedPosition';
import { buildTrailPathWithStyle, edgePathSeed } from '../lib/trailPath';
import MapPlayerAvatar from './MapPlayerAvatar';
import { useId } from 'react';

interface Props {
  nodes: GNode[];
  edges: GEdge[];
  playerX: number;
  playerY: number;
  playerColor?: string;
  playerAvatar?: string;
  playerName?: string;
  /** Avatar radius on the map (viewBox units). Default 2.6. */
  playerSize?: number;
  bgImage: string;
  bgTint?: string;
  initialVb: ViewBox;
  onNodeClick: (id: string) => void;
  renderNode: (node: GNode) => React.ReactElement | null;
  header: React.ReactNode;
  /** Extra SVG elements rendered above nodes (e.g. other players' markers) */
  extraSvgContent?: React.ReactNode;
  /** Show 20×20 coordinate grid overlay */
  showGrid?: boolean;
  /** World = winding organic trails; region = straighter local paths */
  edgePathStyle?: 'world' | 'region';
  /** Fill parent height instead of 100vh (region view with quest bar) */
  fillParent?: boolean;
}

const FILTER_GLOW = 'gg-glow';

const GRID_DIVISIONS = 20;

function gridTicks(max: number): number[] {
  const step = max / GRID_DIVISIONS;
  return Array.from({ length: GRID_DIVISIONS + 1 }, (_, i) => i * step);
}

export default function GameGraph({
  nodes, edges, playerX, playerY, playerColor, playerAvatar, playerName, playerSize = 2.6,
  bgImage, bgTint, initialVb,
  onNodeClick, renderNode, header, extraSvgContent, showGrid, edgePathStyle = 'world',
  fillParent = false,
}: Props) {
  const animatedPlayer = useAnimatedPosition(playerX, playerY);
  const playerClipId = useId().replace(/:/g, '');

  const nodePos = Object.fromEntries(nodes.map((n) => [n.id, { x: n.x, y: n.y }]));
  const vbStr = `${initialVb.x} ${initialVb.y} ${initialVb.w} ${initialVb.h}`;
  const { x: vbX, y: vbY, w: vbW, h: vbH } = initialVb;
  const gridX = gridTicks(vbW);
  const gridY = gridTicks(vbH);
  const mapAspect = `${vbW} / ${vbH}`;

  return (
    <div className={`gg-wrap${fillParent ? ' gg-wrap--fill' : ''}`}>
      <div className="gg-header">{header}</div>

      <div className="gg-stage">
        <svg
          viewBox={vbStr}
          className="gg-svg"
          style={{ aspectRatio: mapAspect }}
        >
          <defs>
            <filter id={FILTER_GLOW} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.5" in="SourceGraphic" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Background ───────────────────────────────────────────────── */}
          <image
            href={bgImage}
            x={vbX} y={vbY} width={vbW} height={vbH}
            preserveAspectRatio="xMidYMid slice"
          />
          <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="#000" opacity="0.34" />
          {bgTint && (
            <rect x={vbX} y={vbY} width={vbW} height={vbH} fill={bgTint} opacity="0.14" />
          )}

          {/* ── Edges ─────────────────────────────────────────────────────── */}
          {edges.map((edge) => {
            const from = nodePos[edge.from];
            const to   = nodePos[edge.to];
            if (!from || !to) return null;

            const d = buildTrailPathWithStyle(from, to, edgePathSeed(edge.from, edge.to), edgePathStyle);

            return (
              <path
                key={`${edge.from}→${edge.to}`}
                d={d}
                fill="none"
                stroke={edge.traversed ? 'rgba(220,190,130,0.85)' : 'rgba(100,78,48,0.55)'}
                strokeWidth={edge.traversed ? 0.75 : 0.6}
                strokeDasharray="2.5 2"
                strokeLinecap="round"
              />
            );
          })}

          {/* ── Nodes ─────────────────────────────────────────────────────── */}
          {nodes.map((node) => (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              style={{ cursor: node.state !== 'locked' ? 'pointer' : 'default' }}
              onClick={() => {
                if (node.state !== 'locked') onNodeClick(node.id);
              }}
            >
              <circle r="7" fill="transparent" />
              {renderNode(node)}
            </g>
          ))}

          {/* ── Debug grid (20×20, toggleable) ──────────────────────── */}
          {showGrid && (
            <g style={{ pointerEvents: 'none' }}>
              {gridX.map((x) => (
                <line key={`gv${x}`}
                  x1={vbX + x} y1={vbY} x2={vbX + x} y2={vbY + vbH}
                  stroke="rgba(255,210,120,0.35)" strokeWidth={x % (vbW / 2) < 1 ? 0.4 : 0.2}
                />
              ))}
              {gridY.map((y) => (
                <line key={`gh${y}`}
                  x1={vbX} y1={vbY + y} x2={vbX + vbW} y2={vbY + y}
                  stroke="rgba(255,210,120,0.35)" strokeWidth={y % (vbH / 2) < 1 ? 0.4 : 0.2}
                />
              ))}
              {gridX.filter((v) => v > 0 && v < vbW).map((x) => (
                <text key={`lx${x}`}
                  x={vbX + x} y={vbY + 2.2}
                  textAnchor="middle" fontSize={1.6}
                  fill="rgba(255,210,120,0.85)"
                  fontFamily="'Inter', system-ui, sans-serif"
                  style={{ userSelect: 'none' }}
                >{Math.round(x)}</text>
              ))}
              {gridY.filter((v) => v > 0 && v < vbH).map((y) => (
                <text key={`ly${y}`}
                  x={vbX + 1.2} y={vbY + y + 0.6}
                  textAnchor="start" fontSize={1.6}
                  fill="rgba(255,210,120,0.85)"
                  fontFamily="'Inter', system-ui, sans-serif"
                  style={{ userSelect: 'none' }}
                >{Math.round(y)}</text>
              ))}
              <text x={vbX + 0.5} y={vbY + 2.2} fontSize={1.4}
                fill="rgba(255,210,120,0.6)"
                fontFamily="'Inter', system-ui, sans-serif"
                style={{ userSelect: 'none' }}
              >0</text>
            </g>
          )}

          {/* ── Other players' markers (static) ───────────────────────── */}
          {extraSvgContent}

          {/* ── Current player marker ───────────────────────────────────── */}
          <g transform={`translate(${animatedPlayer.x},${animatedPlayer.y})`}>
            {playerAvatar ? (
              <MapPlayerAvatar
                avatar={playerAvatar}
                color={playerColor}
                size={playerSize}
                pulse
                clipId={playerClipId}
                label={playerName}
              />
            ) : (
              <g style={{ pointerEvents: 'none' }}>
                <circle r="2.8" fill={playerColor ?? '#d4943a'} opacity="0.25">
                  <animate attributeName="r" values="2.8;5;2.8" dur="2.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.25;0.07;0.25" dur="2.8s" repeatCount="indefinite" />
                </circle>
                <circle r="1.4" fill={playerColor ?? '#d4943a'} />
              </g>
            )}
          </g>

        </svg>
      </div>
    </div>
  );
}
