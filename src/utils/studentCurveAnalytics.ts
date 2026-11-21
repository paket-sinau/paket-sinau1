/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExamSession, SubjectId } from '../types';

export interface CurvePoint2D {
  x: number;
  y: number;
}

export interface ChartPoint extends CurvePoint2D {
  session: ExamSession;
  index: number;
  score: number;
}

export interface ChartDimensions {
  svgWidth: number;
  svgHeight: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
}

export interface StudentCurveSummary {
  totalSessions: number;
  initialScore: number;
  latestScore: number;
  delta: number;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
  passedCount: number;
  passRate: number;
}

/**
 * Filter completed sessions for a given student and optional subject,
 * sorted chronologically ascending (oldest -> newest).
 */
export function getCompletedSessionsChronological(
  sessions: ExamSession[],
  studentId: string,
  mapelFilter: string = 'semua'
): ExamSession[] {
  return sessions
    .filter((s) => {
      if (s.muridId !== studentId || s.status !== 'selesai') return false;
      if (mapelFilter !== 'semua' && s.mapelId !== mapelFilter) return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(a.waktuSelesai || a.waktuMulai).getTime() -
        new Date(b.waktuSelesai || b.waktuMulai).getTime()
    );
}

/**
 * Compute summary metrics for a student's progression curve.
 */
export function computeStudentCurveSummary(
  filteredSessions: ExamSession[],
  targetKkm: number = 75
): StudentCurveSummary {
  const totalSessions = filteredSessions.length;
  if (totalSessions === 0) {
    return {
      totalSessions: 0,
      initialScore: 0,
      latestScore: 0,
      delta: 0,
      avgScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passedCount: 0,
      passRate: 0,
    };
  }

  const scores = filteredSessions.map((s) => s.persentaseNilai || 0);
  const initialScore = scores[0];
  const latestScore = scores[totalSessions - 1];
  const delta = totalSessions > 1 ? Math.round((latestScore - initialScore) * 10) / 10 : 0;
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalSessions);
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  const passedCount = filteredSessions.filter((s) => (s.persentaseNilai || 0) >= targetKkm).length;
  const passRate = Math.round((passedCount / totalSessions) * 100);

  return {
    totalSessions,
    initialScore,
    latestScore,
    delta,
    avgScore,
    highestScore,
    lowestScore,
    passedCount,
    passRate,
  };
}

/**
 * Map chronological sessions to SVG coordinate points.
 */
export function computeChartPoints(
  filteredSessions: ExamSession[],
  dims: ChartDimensions
): ChartPoint[] {
  const totalSessions = filteredSessions.length;
  if (totalSessions === 0) return [];

  const chartWidth = dims.svgWidth - dims.paddingLeft - dims.paddingRight;
  const chartHeight = dims.svgHeight - dims.paddingTop - dims.paddingBottom;

  if (totalSessions === 1) {
    const score = filteredSessions[0].persentaseNilai || 0;
    const clampedScore = Math.min(100, Math.max(0, score));
    const x = dims.paddingLeft + chartWidth / 2;
    const y = dims.paddingTop + chartHeight - (clampedScore / 100) * chartHeight;
    return [{ x, y, session: filteredSessions[0], index: 0, score }];
  }

  const innerInset = Math.min(40, chartWidth * 0.08);
  const usableWidth = Math.max(10, chartWidth - innerInset * 2);

  return filteredSessions.map((s, idx) => {
    const x = dims.paddingLeft + innerInset + (idx / (totalSessions - 1)) * usableWidth;
    const score = s.persentaseNilai || 0;
    const clampedScore = Math.min(100, Math.max(0, score));
    const y = dims.paddingTop + chartHeight - (clampedScore / 100) * chartHeight;
    return { x, y, session: s, index: idx, score };
  });
}

/**
 * Generate smooth cubic bezier SVG path from 2D points (Catmull-Rom-like tension).
 */
export function generateSmoothCurvePath(points: CurvePoint2D[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 5;
    const cp1y = p1.y + (p2.y - p0.y) / 5;
    const cp2x = p2.x - (p3.x - p1.x) / 5;
    const cp2y = p2.y - (p3.y - p1.y) / 5;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * Generate closed area SVG path under a smooth curve down to baselineY.
 */
export function generateAreaPath(
  curvePath: string,
  points: CurvePoint2D[],
  baselineY: number
): string {
  if (!curvePath || points.length < 2) return '';
  const firstX = points[0].x.toFixed(1);
  const lastX = points[points.length - 1].x.toFixed(1);
  return `${curvePath} L ${lastX} ${baselineY.toFixed(1)} L ${firstX} ${baselineY.toFixed(1)} Z`;
}

export function resolveStudentKkm(
  customKkm: Partial<Record<SubjectId | 'umum', number>> | undefined,
  selectedMapel: string
): number {
  if (customKkm) {
    if (selectedMapel !== 'semua' && customKkm[selectedMapel as SubjectId] !== undefined) {
      return customKkm[selectedMapel as SubjectId]!;
    }
    return customKkm.umum ?? 75;
  }
  return 75;
}
