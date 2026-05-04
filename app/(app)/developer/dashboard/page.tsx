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

Chart.register(...registerables);

export default function DashboardPage() {
  const users = useSelector((state: RootState) => state.users.users);  
  const me = useSelector((state: RootState) => state.profil.profil)?.docs;

  const docsStats = useMemo(() => {
    // Vérification si me est undefined ou null
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

    // Vérification si docs est undefined ou null
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
  
  // Fixed: Include ALL 4 statuses in the donut chart
  useChart(donutRef, () => ({
    type: "doughnut",
    data: {
      labels: ["Approuvés", "En attente", "Brouillon", "Rejetés"],
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
            label: (c) => ` ${c.label}: ${c.raw} docs (${docsStats?.total > 0 ? Math.round((c.raw as number / docsStats?.total) * 100) : 0}%)` 
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
        label: "Documents",
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
          label: "Soumissions",
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
          label: "Approuvés",
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

  // Helper function to safely calculate percentage
  const getPercentage = (count: number) => {
    if (!docsStats || docsStats?.total === 0) return 0;
    return Math.round((count / docsStats?.total) * 100);
  };

  // Loading state
  if (!me) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c5262e] mx-auto"></div>
          <p className="mt-4 text-neutral-600">Chargement du tableau de bord...</p>
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
          <h1 className="text-2xl font-semibold text-white">Tableau de bord Développeur</h1>
          <p className="text-sm text-white/70 mt-1">{"Suivez l'activité de votre plateforme en temps réel"}</p>
        </div>
        <span className="relative z-10 text-xs font-mono text-white/60 bg-white/10 px-3 py-2 rounded-lg capitalize">
          {TODAY}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Total documents"
          value={docsStats?.total || 0}
          sub="Tous statuts confondus"
          iconColor="text-[#c5262e]"
          iconBg="bg-[#c5262e]/10"
          icon={<IconDoc />}
        />
        <KpiCard
          label="Approuvés"
          value={docsStats?.docsApproved?.length || 0}
          sub={`${getPercentage(docsStats?.docsApproved?.length || 0)}% du total`}
          valueColor="text-green-600"
          iconColor="text-green-600"
          iconBg="bg-green-50"
          icon={<IconCheck />}
        />
        <KpiCard
          label="Brouillon"
          value={docsStats?.docsDraft?.length || 0}
          sub={`${getPercentage(docsStats?.docsDraft?.length || 0)}% du total`}
          valueColor="text-slate-600"
          iconColor="text-slate-600"
          iconBg="bg-slate-50"
          icon={
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2h6M2 5h4M2 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          }
        />
        <KpiCard
          label="En attente"
          value={docsStats?.docsPending?.length || 0}
          sub={`${getPercentage(docsStats?.docsPending?.length || 0)}% du total`}
          valueColor="text-amber-600"
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          icon={<IconClock />}
        />
        <KpiCard
          label="Rejetés"
          value={docsStats?.docsRejected?.length || 0}
          sub={`${getPercentage(docsStats?.docsRejected?.length || 0)}% du total`}
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
          <p className="text-sm font-medium text-neutral-800">Répartition des documents</p>
          <p className="text-xs text-neutral-400 mt-0.5 mb-4">Par statut — {docsStats?.total || 0} documents au total</p>
          <div className="flex gap-3 mb-3 flex-wrap">
            <LegendDot color="#16a34a" label={`Approuvés ${getPercentage(docsStats?.docsApproved?.length || 0)}%`} />
            <LegendDot color="#d97706" label={`En attente ${getPercentage(docsStats?.docsPending?.length || 0)}%`} />
            <LegendDot color="#64748b" label={`Brouillon ${getPercentage(docsStats?.docsDraft?.length || 0)}%`} />
            <LegendDot color="#dc2626" label={`Rejetés ${getPercentage(docsStats?.docsRejected?.length || 0)}%`} />
          </div>
          <div className="relative h-52">
            <canvas ref={donutRef} />
          </div>
        </div>
        
        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <p className="text-sm font-medium text-neutral-800">Documents par utilisateur</p>
          <p className="text-xs text-neutral-400 mt-0.5 mb-4">Distribution des documents</p>
          <div className="relative h-52">
            <canvas ref={barRef} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-4">
        {/* Line */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <p className="text-sm font-medium text-neutral-800">Activité mensuelle</p>
          <p className="text-xs text-neutral-400 mt-0.5 mb-4">Documents soumis par mois</p>
          <div className="flex gap-3 mb-3 flex-wrap">
            <LegendDot color="#c5262e" label="Soumissions" />
            <LegendDot color="#16a34a" label="Approuvés" dashed />
          </div>
          <div className="relative h-48">
            <canvas ref={lineRef} />
          </div>
        </div>
      </div>

    </div>
  );
}