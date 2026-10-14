// Source: copy-deck.md §4.3b "Dashboard overview" rows, copied verbatim (F-26, approved by the Owner 2026-10-14 and 2026-10-15).
// The project list's rows (search, filter, no match, statuses, menu, "No sessions scheduled") are reused from the project namespace.
import { PROJECT_COPY_NAMESPACE } from "../project-copy/project-copy.copy";

export const DASHBOARD_OVERVIEW_COPY_NAMESPACE = "dashboardOverview";

/** The project namespace, re-exported so the overview's components name the reused rows through a sibling copy file. */
export const DASHBOARD_PROJECT_COPY_NAMESPACE = PROJECT_COPY_NAMESPACE;

export const DASHBOARD_OVERVIEW_COPY = {
  namespace: DASHBOARD_OVERVIEW_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      tileNewProjects: "New projects",
      tileToReview: "To review",
      tileInEditing: "In editing",
      tileDelivered: "Delivered",
      tableTitle: "Active projects",
      columnProject: "Project",
      columnNextSession: "Next session",
      columnStatus: "Status",
      columnAgreedPrice: "Agreed price",
      columnActions: "Actions",
      footerCount:
        "Showing {shown} of {total, plural, one {# active project} other {# active projects}}",
      footerLink: "View all projects",
      nextToday: "Today",
      nextTodayAt: "Today, {time}",
      waitingBadge: "{count} waiting",
      emptyActiveTitle: "No active projects",
      emptyActiveBody: "Completed and canceled projects are in the project list.",
      emptyActiveAction: "View project list",
      ringWaitingLabel: "{waiting} of {total} waiting 3 days or more",
      ringReadyLabel: "{ready} of {total} ready to edit",
      sparkLabel: "{label} per month, last 7 months",
      trendLabel: "{delta} compared with the same days last month",
    },
    id: {
      tileNewProjects: "Proyek baru",
      tileToReview: "Perlu dicek",
      tileInEditing: "Sedang diedit",
      tileDelivered: "Terkirim",
      tableTitle: "Proyek aktif",
      columnProject: "Proyek",
      columnNextSession: "Sesi berikutnya",
      columnStatus: "Status",
      columnAgreedPrice: "Harga sepakat",
      columnActions: "Aksi",
      footerCount: "Menampilkan {shown} dari {total, plural, other {# proyek aktif}}",
      footerLink: "Lihat semua proyek",
      nextToday: "Hari ini",
      nextTodayAt: "Hari ini, {time}",
      waitingBadge: "{count} menunggu",
      emptyActiveTitle: "Belum ada proyek aktif",
      emptyActiveBody: "Proyek selesai dan dibatalkan ada di daftar proyek.",
      emptyActiveAction: "Lihat daftar proyek",
      ringWaitingLabel: "{waiting} dari {total} menunggu 3 hari atau lebih",
      ringReadyLabel: "{ready} dari {total} siap diedit",
      sparkLabel: "{label} per bulan, 7 bulan terakhir",
      trendLabel: "{delta} dibandingkan dengan hari yang sama bulan lalu",
    },
  },
} as const;
