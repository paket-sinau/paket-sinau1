/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SUBJECTS } from '../data/seedData';
import { formatDuration } from '../utils/examScoring';
import {
  getCompletedSessionsChronological,
  computeStudentCurveSummary,
  computeChartPoints,
  generateSmoothCurvePath,
  generateAreaPath,
  resolveStudentKkm,
} from '../utils/studentCurveAnalytics';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Calendar,
  Clock,
  HelpCircle,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface StudentProgressCurveProps {
  studentId: string;
  studentName?: string;
  studentClass?: string;
  showFilters?: boolean;
  compact?: boolean;
  onOpenSessionDetail?: (sessionId: string) => void;
}

export const StudentProgressCurve: React.FC<StudentProgressCurveProps> = ({
  studentId,
  studentName,
  studentClass,
  showFilters = true,
  compact = false,
  onOpenSessionDetail,
}) => {
  const { sessions, users, currentUser } = useApp();
  const [selectedMapel, setSelectedMapel] = useState<string>('semua');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Identify student
  const student = useMemo(() => {
    return users.find((u) => u.id === studentId);
  }, [users, studentId]);

  const displayName = studentName || student?.nama || 'Peserta Didik';
  const displayClass = studentClass || student?.kelasId || 'Kelas SD';

  // Get student's KKM preference
  const targetKkm = useMemo(() => {
    return resolveStudentKkm(student?.customKkm, selectedMapel);
  }, [student, selectedMapel]);

  // Filtered completed sessions sorted chronologically ascending
  const filteredSessions = useMemo(() => {
    return getCompletedSessionsChronological(sessions, studentId, selectedMapel);
  }, [sessions, studentId, selectedMapel]);

  // Overall calculations
  const summary = useMemo(() => {
    return computeStudentCurveSummary(filteredSessions, targetKkm);
  }, [filteredSessions, targetKkm]);

  const {
    totalSessions,
    initialScore,
    latestScore,
    delta,
    avgScore,
    highestScore,
    lowestScore,
    passedCount,
    passRate,
  } = summary;

  // Chart Dimensions & Coordinate calculations
  const svgWidth = 800;
  const svgHeight = compact ? 220 : 300;
  const paddingLeft = 58;
  const paddingRight = 76;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Map scores to points
  const points = useMemo(() => {
    return computeChartPoints(filteredSessions, {
      svgWidth,
      svgHeight,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
    });
  }, [filteredSessions, svgHeight]);

  // Curve Paths
  const curvePath = useMemo(() => {
    return generateSmoothCurvePath(points);
  }, [points]);

  const areaPath = useMemo(() => {
    return generateAreaPath(curvePath, points, paddingTop + chartHeight);
  }, [curvePath, points, paddingTop, chartHeight]);

  // KKM Y-coordinate
  const kkmY = paddingTop + chartHeight - (Math.min(100, Math.max(0, targetKkm)) / 100) * chartHeight;

  // Grid steps (0, 25, 50, 75, 100)
  const gridLevels = [0, 25, 50, 75, 100];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Kurva Perkembangan Nilai: {displayName}</span>
                <span className="text-xs font-normal text-slate-400 font-mono">({displayClass})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grafik lintasan pencapaian dan kenaikan skor tryout dari sesi ke sesi.
              </p>
            </div>
          </div>
        </div>

        {/* Mapel filter buttons */}
        {showFilters && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedMapel('semua')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedMapel === 'semua'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua Mapel
            </button>
            {SUBJECTS.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedMapel(sub.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedMapel === sub.id
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sub.singkatan}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content: If Student has NOT taken any tryout */}
      {totalSessions === 0 ? (
        <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
            Belum Ada Data Tryout untuk {displayName}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1.5 leading-relaxed">
            {selectedMapel !== 'semua'
              ? `Peserta didik belum pernah mengerjakan tryout untuk mata pelajaran ${selectedMapel}. Silakan pilih 'Semua Mapel' atau kerjakan paket tryout ini.`
              : 'Peserta didik belum mengerjakan paket tryout. Kurva perkembangan nilai akan otomatis terbentuk secara langsung segera setelah siswa menyelesaikan sesi tryout pertamanya.'}
          </p>
          {currentUser?.role === 'murid' && (
            <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>Ayo mulai kerjakan paket soal yang tersedia di menu <strong>Paket Ujian SD</strong>!</span>
            </div>
          )}
        </div>
      ) : (
        /* If student has completed tryout sessions */
        <div>
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs">
            {/* Tryout Terkini */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5 font-semibold">
                Skor Terkini
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {latestScore}%
                </span>
                <span className="text-[10px] text-slate-400">/ 100</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                Sesi #{totalSessions}
              </span>
            </div>

            {/* Tren Perkembangan */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5 font-semibold">
                Tren Perkembangan
              </span>
              <div className="flex items-center gap-1.5">
                {delta > 0 ? (
                  <>
                    <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      <TrendingUp className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      +{delta}%
                    </span>
                  </>
                ) : delta < 0 ? (
                  <>
                    <span className="p-1 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      <TrendingDown className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-base sm:text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                      {delta}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <Minus className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-base sm:text-lg font-bold font-mono text-slate-600 dark:text-slate-400">
                      Stabil
                    </span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {totalSessions > 1 ? `Dari ${initialScore}% (awal)` : 'Ujian pertama'}
              </span>
            </div>

            {/* Rata-Rata */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5 font-semibold">
                Rata-Rata Nilai
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                {avgScore}%
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Total {totalSessions} Kali Tryout
              </span>
            </div>

            {/* Skor Tertinggi */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5 font-semibold">
                Rekor Terbaik
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {highestScore}%
                </span>
                <Award className="h-4 w-4 text-amber-500 shrink-0" />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Terendah: {lowestScore}%
              </span>
            </div>

            {/* Ketuntasan KKM */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5 font-semibold">
                Ketuntasan KKM
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                  {passRate}%
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  ({passedCount}/{totalSessions})
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Batas KKM: <strong>{targetKkm}</strong>
              </span>
            </div>
          </div>

          {/* SVG Interactive Curve Diagram */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Lintasan Kurva Tryout
                </span>
                <div className="hidden sm:flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                    <span>Kurva Nilai</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 border-b-2 border-dashed border-amber-500" />
                    <span>Garis Target KKM ({targetKkm})</span>
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Arahkan kursor pada titik lingkaran untuk melihat detail sesi
              </div>
            </div>

            {/* SVG Chart Container */}
            <div className="relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-900 p-2 sm:p-4 overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto min-w-[550px] overflow-visible select-none"
              >
                <defs>
                  {/* Gradient fill under the smooth curve */}
                  <linearGradient id={`curveGrad-${studentId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Gradient along the stroke */}
                  <linearGradient id={`strokeGrad-${studentId}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="50%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>

                  {/* Drop shadow for nodes */}
                  <filter id={`shadow-${studentId}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
                  </filter>
                </defs>

                {/* Horizontal Grid lines and percentage axis labels */}
                {gridLevels.map((lvl) => {
                  const y = paddingTop + chartHeight - (lvl / 100) * chartHeight;
                  return (
                    <g key={lvl} className="text-slate-300 dark:text-slate-700">
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={svgWidth - paddingRight}
                        y2={y}
                        stroke="currentColor"
                        strokeDasharray={lvl === 0 || lvl === 100 ? undefined : '3,3'}
                        strokeWidth={lvl === 0 ? 1.5 : 1}
                        opacity={0.6}
                      />
                      <text
                        x={paddingLeft - 10}
                        y={y + 3.5}
                        textAnchor="end"
                        fontSize="10"
                        fontWeight="600"
                        className="fill-slate-400 font-mono"
                      >
                        {lvl}%
                      </text>
                    </g>
                  );
                })}

                {/* KKM Target Reference Line (Dashed Amber Line) */}
                <g className="text-amber-500" pointerEvents="none">
                  <line
                    x1={paddingLeft}
                    y1={kkmY}
                    x2={svgWidth - paddingRight}
                    y2={kkmY}
                    stroke="#f59e0b"
                    strokeWidth="1.8"
                    strokeDasharray="5,4"
                  />
                  <rect
                    x={svgWidth - paddingRight + 6}
                    y={kkmY - 9}
                    width="62"
                    height="18"
                    rx="4"
                    fill="#f59e0b"
                  />
                  <text
                    x={svgWidth - paddingRight + 37}
                    y={kkmY + 3}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="#ffffff"
                    className="font-mono"
                  >
                    KKM {targetKkm}
                  </text>
                </g>

                {/* Shaded Area under Curve */}
                {areaPath && (
                  <path
                    d={areaPath}
                    fill={`url(#curveGrad-${studentId})`}
                    pointerEvents="none"
                  />
                )}

                {/* Main Curve Stroke */}
                {curvePath && (
                  <path
                    d={curvePath}
                    fill="none"
                    stroke={`url(#strokeGrad-${studentId})`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pointerEvents="none"
                  />
                )}

                {/* X-axis labels */}
                {points.map((pt, idx) => (
                  <text
                    key={`xlabel-${pt.session.id}`}
                    x={pt.x}
                    y={paddingTop + chartHeight + 18}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    className="fill-slate-500 dark:fill-slate-400 font-mono"
                  >
                    Tryout #{idx + 1}
                  </text>
                ))}

                {/* Interactive Points on the Curve */}
                {points.map((pt, idx) => {
                  const isHovered = hoveredPointIndex === idx;
                  const isPassed = pt.score >= targetKkm;
                  const nodeColor = isPassed ? '#10b981' : '#f59e0b';

                  return (
                    <g key={pt.session.id} className="group">
                      {/* Vertical tracking line on hover */}
                      {isHovered && (
                        <line
                          x1={pt.x}
                          y1={paddingTop}
                          x2={pt.x}
                          y2={paddingTop + chartHeight}
                          stroke="#6366f1"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                          opacity="0.8"
                          pointerEvents="none"
                        />
                      )}

                      {/* Halo ring */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 12 : 7}
                        fill={isHovered ? '#6366f1' : '#ffffff'}
                        fillOpacity={isHovered ? 0.25 : 1}
                        stroke={isHovered ? '#4f46e5' : nodeColor}
                        strokeWidth={isHovered ? 3 : 2.5}
                        filter={`url(#shadow-${studentId})`}
                        className="transition-all duration-200"
                        pointerEvents="none"
                      />

                      {/* Inner dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 4.5 : 3}
                        fill={isHovered ? '#4f46e5' : nodeColor}
                        className="transition-all duration-200"
                        pointerEvents="none"
                      />

                      {/* Score label badge floating above node */}
                      <g
                        transform={`translate(${pt.x}, ${pt.y - (isHovered ? 18 : 12)})`}
                        pointerEvents="none"
                      >
                        <rect
                          x="-18"
                          y="-10"
                          width="36"
                          height="14"
                          rx="4"
                          fill={isHovered ? '#1e1b4b' : isPassed ? '#065f46' : '#78350f'}
                          opacity={isHovered ? 0.95 : 0.85}
                        />
                        <text
                          x="0"
                          y="0"
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="700"
                          fill="#ffffff"
                          className="font-mono"
                        >
                          {pt.score}%
                        </text>
                      </g>

                      {/* Accessible hit target */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="18"
                        fill="transparent"
                        className="cursor-pointer focus:outline-none"
                        role="button"
                        tabIndex={0}
                        aria-label={`Tryout #${idx + 1}: ${pt.session.paketJudul}, nilai ${pt.score}%`}
                        onMouseEnter={() => setHoveredPointIndex(idx)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                        onFocus={() => setHoveredPointIndex(idx)}
                        onBlur={() => setHoveredPointIndex(null)}
                        onClick={() => onOpenSessionDetail && onOpenSessionDetail(pt.session.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (onOpenSessionDetail) onOpenSessionDetail(pt.session.id);
                          }
                        }}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Hovered Point Detailed Card Preview */}
            {hoveredPointIndex !== null && points[hoveredPointIndex] && (
              <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/80 dark:bg-indigo-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white font-mono font-bold text-sm shrink-0">
                    #{hoveredPointIndex + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {points[hoveredPointIndex].session.paketJudul}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(
                          points[hoveredPointIndex].session.waktuSelesai ||
                            points[hoveredPointIndex].session.waktuMulai
                        ).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(points[hoveredPointIndex].session.durasiDetikTerpakai)}
                      </span>
                      <span>·</span>
                      <span className="uppercase font-mono font-bold text-[10px] text-indigo-600 dark:text-indigo-400">
                        {points[hoveredPointIndex].session.mapelId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                      {points[hoveredPointIndex].score}%
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-block ${
                        points[hoveredPointIndex].score >= targetKkm
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {points[hoveredPointIndex].score >= targetKkm ? 'Lulus KKM' : 'Di Bawah KKM'}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3">
                    <div>Benar: <strong className="text-emerald-600">{points[hoveredPointIndex].session.jumlahBenar}</strong></div>
                    <div>Salah: <strong className="text-rose-600">{points[hoveredPointIndex].session.jumlahSalah}</strong></div>
                  </div>

                  {onOpenSessionDetail && (
                    <button
                      type="button"
                      onClick={() => onOpenSessionDetail(points[hoveredPointIndex].session.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <span>Lihat Evaluasi</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* List Table of Completed Tryouts for this student */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                <span>Daftar Riwayat Sesi Tryout Peserta Didik ({filteredSessions.length})</span>
              </h4>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2 px-3 w-16">Urutan</th>
                      <th className="py-2 px-3">Paket Soal Tryout</th>
                      <th className="py-2 px-3">Mapel</th>
                      <th className="py-2 px-3 text-center">Tanggal Pengerjaan</th>
                      <th className="py-2 px-3 text-center">Durasi</th>
                      <th className="py-2 px-3 text-center">B / S / K</th>
                      <th className="py-2 px-3 text-right">Skor Tryout</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredSessions.map((ses, idx) => {
                      const score = ses.persentaseNilai || 0;
                      const isPassed = score >= targetKkm;
                      return (
                        <tr
                          key={ses.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2 px-3 font-mono font-bold text-slate-500">
                            #{idx + 1}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {ses.paketJudul}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {ses.mapelId.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center text-slate-500 whitespace-nowrap">
                            {new Date(ses.waktuSelesai || ses.waktuMulai).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-500 whitespace-nowrap">
                            {formatDuration(ses.durasiDetikTerpakai)}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            <span className="text-emerald-600 font-bold">{ses.jumlahBenar}</span> /{' '}
                            <span className="text-rose-600 font-bold">{ses.jumlahSalah}</span> /{' '}
                            <span className="text-slate-400">{ses.jumlahKosong}</span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                            {score}%
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isPassed
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {isPassed ? 'TUNTAS' : 'REMEDIAL'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
