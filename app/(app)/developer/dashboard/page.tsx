/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useMemo, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { MONTHS, TODAY } from "@/constant";
import { useChart } from "@/hooks/useAppChart";
import IconDoc from "@/components/icons/IconDoc";
import IconCheck from "@/components/icons/IconCheck";
import IconClock from "@/components/icons/IconClock";
import { IconX } from "@/components/icons/IconX";
import { LegendDot } from "@/components/LegendDot";
import KpiCard from "@/components/KpiCard";
import { useTranslation } from "react-i18next";

Chart.register(...registerables);

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');
  
  const users = useSelector((state: RootState) => state.users.users);  
  const me = useSelector((state: RootState) => state.profil.profil)?.docs;

  const docsStats = useMemo(() => {
    if (!me || !Array.isArray(me)) {
      return {
        total: 0,
        docsApproved: [],
        docsRejected: [],
        docsPending: [],
        docsDraft: []
      };
    }
    
    const total = me.length || 1;
    const docsApproved = me?.filter((item: any) => item.status === "approve" || item.status === "approved") || [];
    const docsDraft = me?.filter((item: any) => item.status === "draft") || [];
    const docsRejected = me?.filter((item: any) => item.status === "rejected") || [];
    const docsPending = me?.filter((item: any) => item.status === "pending") || [];
    
    return { total, docsApproved, docsRejected, docsPending, docsDraft };
  }, [me]);
  
  const donutRef = useRef<HTMLCanvasElement>(null);
  const barRef   = useRef<HTMLCanvasElement>(null);
  const lineRef  = useRef<HTMLCanvasElement>(null);

  const textColor = "rgba(115,115,115,0.9)";
  const gridColor = "rgba(0,0,0,0.06)";
  
  function getMonthlyStats(docs: any[]) {
    const submissions = Array(12).fill(0);
    const approved = Array(12).fill(0);

    if (!docs || !Array.isArray(docs)) {
      return { submissions, approved };
    }

    docs.forEach((doc) => {
      if (doc && doc.submissionDate) {
        const date = new Date(doc.submissionDate);
        const month = date.getMonth();

        submissions[month]++;

        if (doc.status === "approve" || doc.status === "approved") {
          approved[month]++;
        }
      }
    });

    return { submissions, approved };
  }
  
  const { submissions, approved } = getMonthlyStats(me);
  
  useChart(donutRef, () => ({
    type: "doughnut",
    data: {
      labels: [t('approuved'), t('inProgress'), t('draft'), t('rejected')],
      datasets: [{
        data: [
          docsStats?.docsApproved.length, 
          docsStats?.docsPending.length, 
          docsStats?.docsDraft.length,
          docsStats?.docsRejected.length
        ],
        backgroundColor: ["#16a34a", "#d97706", "#64748b", "#dc2626"],
        borderWidth: 0,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: { display: false },
        tooltip: { 
          callbacks: { 
            label: (c) => ` ${c.label}: ${c.raw} ${t('documents')} (${docsStats?.total > 0 ? Math.round((c.raw as number / docsStats?.total) * 100) : 0}%)` 
          } 
        },
      },
    },
  }));

  useChart(barRef, () => ({
    type: "bar",
    data: {
      labels: users && users.length > 0 ? users.map((d) => d.name.split(" ")[0] + " " + d.name.split(" ")[1]?.[0] + ".") : [],
      datasets: [{
        label: t('documents'),
        data: users && users.length > 0 ? users.map((d) => d.docs?.length || 0) : [],
        backgroundColor: ["#c5262e", "#e05a60", "#ea868a", "#f2b3b5"],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 }, stepSize: 2 }, beginAtZero: true },
      },
    },
  }));
  
  useChart(lineRef, () => ({
    type: "line",
    data: {
      labels: MONTHS,
      datasets: [
        {
          label: t('soumissions'),
          data: submissions,
          borderColor: "#c5262e",
          backgroundColor: "rgba(197,38,46,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#c5262e",
        },
        {
          label: t('approuved'),
          data: approved,
          borderColor: "#16a34a",
          backgroundColor: "transparent",
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          borderDash: [4, 3],
          pointRadius: 3,
          pointBackgroundColor: "#16a34a",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 }, stepSize: 1 }, beginAtZero: true },
      },
    },
  }));

  const getPercentage = (count: number) => {
    if (!docsStats || docsStats?.total === 0) return 0;
    return Math.round((count / docsStats?.total) * 100);
  };

  if (!me) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c5262e] mx-auto"></div>
          <p className="mt-4 text-neutral-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#c5262e] px-8 py-6 flex items-center justify-between">
        <div className="absolute -right-10 -top-14 w-52 h-52 rounded-full bg-white/5" />
        <div className="absolute right-16 top-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative z-10">
          <h1 className="text-2xl font-semibold text-white">{t('headTitleDev')}</h1>
          <p className="text-sm text-white/70 mt-1">{t('headDesc')}</p>
        </div>
        <span className="relative z-10 text-xs font-mono text-white/60 bg-white/10 px-3 py-2 rounded-lg capitalize">
          {TODAY}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard
          label={t('totalDoc')}
          value={docsStats?.total || 0}
          sub={t('totalDocDesc')}
          iconColor="text-[#c5262e]"
          iconBg="bg-[#c5262e]/10"
          icon={<IconDoc />}
        />
        <KpiCard
          label={t('approuved')}
          value={docsStats?.docsApproved?.length || 0}
          sub={`${getPercentage(docsStats?.docsApproved?.length || 0)}% ${t('du')} ${t('total')}`}
          valueColor="text-green-600"
          iconColor="text-green-600"
          iconBg="bg-green-50"
          icon={<IconCheck />}
        />
        <KpiCard
          label={t('draft')}
          value={docsStats?.docsDraft?.length || 0}
          sub={`${getPercentage(docsStats?.docsDraft?.length || 0)}% ${t('du')} ${t('total')}`}
          valueColor="text-slate-600"
          iconColor="text-slate-600"
          iconBg="bg-slate-50"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v16H4z M8 8h8v8H8z" />
            </svg>
          }
        />
        <KpiCard
          label={t('inProgress')}
          value={docsStats?.docsPending?.length || 0}
          sub={`${getPercentage(docsStats?.docsPending?.length || 0)}% ${t('du')} ${t('total')}`}
          valueColor="text-amber-600"
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          icon={<IconClock />}
        />
        <KpiCard
          label={t('rejected')}
          value={docsStats?.docsRejected?.length || 0}
          sub={`${getPercentage(docsStats?.docsRejected?.length || 0)}% ${t('du')} ${t('total')}`}
          valueColor="text-red-600"
          iconColor="text-red-600"
          iconBg="bg-red-50"
          icon={<IconX />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Donut */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <p className="text-sm font-medium text-neutral-800">{t('graphUnTitle')}</p>
          <p className="text-xs text-neutral-400 mt-0.5 mb-4">
            {t('par')} {t('statut')} — {docsStats?.total || 0} {t('documents')} {t('au')} {t('total')}
          </p>
          <div className="flex gap-3 mb-3 flex-wrap">
            <LegendDot color="#16a34a" label={`${t('approuved')} ${getPercentage(docsStats?.docsApproved?.length || 0)}%`} />
            <LegendDot color="#d97706" label={`${t('inProgress')} ${getPercentage(docsStats?.docsPending?.length || 0)}%`} />
            <LegendDot color="#64748b" label={`${t('draft')} ${getPercentage(docsStats?.docsDraft?.length || 0)}%`} />
            <LegendDot color="#dc2626" label={`${t('rejected')} ${getPercentage(docsStats?.docsRejected?.length || 0)}%`} />
          </div>
          <div className="relative h-52">
            <canvas ref={donutRef} />
          </div>
        </div>
        
        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <p className="text-sm font-medium text-neutral-800">{t('graphDeuxTitle')}</p>
          <p className="text-xs text-neutral-400 mt-0.5 mb-4">{t('graphDeuxDesc')}</p>
          <div className="relative h-52">
            <canvas ref={barRef} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <p className="text-sm font-medium text-neutral-800">{t('graphTroiTitle')}</p>
          <p className="text-xs text-neutral-400 mt-0.5 mb-4">{t('graphTroiDesc')}</p>
          <div className="flex gap-3 mb-3 flex-wrap">
            <LegendDot color="#c5262e" label={t('soumissions')} />
            <LegendDot color="#16a34a" label={t('approuved')} dashed />
          </div>
          <div className="relative h-48">
            <canvas ref={lineRef} />
          </div>
        </div>
      </div>

    </div>
  );
}