import type { AppLocale } from "@/shared/locale/locale.types";

export interface PolicySection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly items?: readonly string[];
}

export interface PrivacyPolicyCopy {
  readonly title: string;
  readonly intro: string;
  readonly sections: readonly PolicySection[];
  readonly contactEmail: string;
}

// Copy from docs/operations/privacy-policy-draft.md (ID) and privacy-policy-draft-en.md (EN).
// Owner approved the drafts on 2026-10-21; lawyer review still pending.
export const PRIVACY_POLICY_COPY: Readonly<Record<AppLocale, PrivacyPolicyCopy>> = {
  en: {
    title: "Privacy Policy",
    intro:
      "Shutrly is an app that helps photographers and studios manage projects, client photo selections, services, and invoices. This policy explains what data we collect, why, and your rights.",
    sections: [
      {
        heading: "1. Information we collect",
        paragraphs: [],
        items: [
          "Account: name, email address, and login data. If you sign in with Google, we receive your Google account ID, name, and email address. We do not store your Google profile photo.",
          "Business data: studio name, services, packages, schedules, and invoices you enter.",
          "Client data: client name, email or WhatsApp number, projects, photo selection status, and gallery link expiry dates.",
          "Galleries and selections: Google Drive folder links you enter, gallery settings, and the photos selected by clients.",
          "Waitlist sign-ups: the email address submitted on the landing page.",
          "Technical data: IP address and basic request records for security and rate limiting.",
        ],
      },
      {
        heading: "2. Photos and Google Drive",
        paragraphs: [
          "Shutrly reads photos from the Google Drive folders you link, only when a gallery is shown or a selection is made. We do not copy or store your photos on our servers. The original photos stay in your Google Drive. You are responsible for setting the Drive sharing permissions correctly.",
        ],
      },
      {
        heading: "3. How we use information",
        paragraphs: [
          "We use information to run the service: show projects and galleries, save client selections, send sign-in and password reset emails, send launch emails to waitlist sign-ups who agreed, keep the service secure, and fix problems. We do not sell your personal information and do not use it for advertising.",
        ],
      },
      {
        heading: "4. Service providers",
        paragraphs: [
          "We use third-party service providers to store data, send email, run the application, and provide Google sign-in. They process data only on our instructions and may not use it for other purposes.",
          "WhatsApp messages are sent by you, from your own WhatsApp. Shutrly only creates links that contain a prepared text. We do not read or store WhatsApp conversations.",
        ],
      },
      {
        heading: "5. Email",
        paragraphs: [
          "Emails sent by Shutrly include sign-in links, password resets, and service notifications. Waitlist sign-ups receive launch emails only, and can ask to be removed at any time.",
        ],
      },
      {
        heading: "6. Cookies and sessions",
        paragraphs: [
          "Shutrly uses cookies to keep you signed in and to remember your language preference. We do not use advertising cookies. If you turn cookies off, sign-in may not work.",
        ],
      },
      {
        heading: "7. Security",
        paragraphs: [
          "We apply reasonable technical and organisational measures, including encrypted connections, access controls, request rate limits, and encrypted storage of passwords. No method of electronic storage or transmission is completely secure. You are responsible for keeping your account password and gallery passwords safe.",
        ],
      },
      {
        heading: "8. Retention and deletion",
        paragraphs: [
          "Account and business data are kept while your account is active. Client and gallery data are kept while the project is managed, or until you delete it. Waitlist contacts are kept until the waitlist closes or you ask to be removed. Entries never invited are deleted no later than 12 months after sign-up.",
          "To request account deletion, email hello@shutrly.space. Some security records or legal obligations may be kept as required by applicable law.",
        ],
      },
      {
        heading: "9. Responsibilities of business users",
        paragraphs: [
          "If you enter data about clients or photos of other people, you are responsible for having the legal basis and consent required. Shutrly processes that data on your behalf.",
        ],
      },
      {
        heading: "10. Your rights",
        paragraphs: [
          "Under Indonesia's Personal Data Protection Law (Law No. 27 of 2022), you may request access to, correction of, a copy of, restriction of, or deletion of your personal data, and you may withdraw consent. We verify requests to protect your account and other people's data.",
        ],
      },
      {
        heading: "11. Changes to this policy and contact",
        paragraphs: [
          "We may update this policy. The latest version and its update date will be on this page. For questions or privacy requests, contact hello@shutrly.space.",
        ],
      },
    ],
    contactEmail: "hello@shutrly.space",
  },
  id: {
    title: "Kebijakan Privasi",
    intro:
      "Shutrly adalah aplikasi untuk fotografer dan studio mengelola proyek, pilihan foto klien, layanan, dan invoice. Kebijakan ini menjelaskan data apa yang kami kumpulkan, untuk apa, dan hak Anda.",
    sections: [
      {
        heading: "1. Informasi yang kami kumpulkan",
        paragraphs: [],
        items: [
          "Akun: nama, alamat email, dan data login. Jika Anda login dengan Google, kami menerima ID akun Google, nama, dan alamat email. Foto profil Google tidak kami simpan.",
          "Data bisnis: nama studio, layanan, paket, jadwal, dan invoice yang Anda masukkan.",
          "Data klien: nama klien, email atau nomor WhatsApp, proyek, status pilihan foto, dan tanggal kedaluwarsa tautan galeri.",
          "Galeri dan pilihan: tautan folder Google Drive yang Anda masukkan, pengaturan galeri, dan foto yang dipilih klien.",
          "Pendaftar daftar tunggu: alamat email yang dikirim dari halaman utama.",
          "Data teknis: alamat IP dan catatan permintaan dasar untuk keamanan dan pembatasan akses.",
        ],
      },
      {
        heading: "2. Foto dan Google Drive",
        paragraphs: [
          "Shutrly membaca foto dari folder Google Drive yang Anda tautkan, hanya saat galeri ditampilkan atau pilihan dibuat. Kami tidak menyalin atau menyimpan foto Anda di server kami. Foto asli tetap berada di Google Drive Anda. Anda bertanggung jawab mengatur izin berbagi Drive dengan benar.",
        ],
      },
      {
        heading: "3. Cara kami menggunakan informasi",
        paragraphs: [
          "Kami menggunakan informasi untuk menjalankan layanan: menampilkan proyek dan galeri, menyimpan pilihan klien, mengirim email masuk dan reset kata sandi, mengirim email peluncuran kepada pendaftar daftar tunggu yang setuju, menjaga keamanan, dan memperbaiki gangguan. Kami tidak menjual informasi pribadi Anda dan tidak menggunakannya untuk iklan.",
        ],
      },
      {
        heading: "4. Penyedia layanan",
        paragraphs: [
          "Kami menggunakan penyedia layanan pihak ketiga untuk menyimpan data, mengirim email, menjalankan aplikasi, dan login dengan Google. Penyedia hanya memproses data sesuai instruksi kami dan tidak boleh menggunakannya untuk tujuan lain.",
          "Pesan WhatsApp dikirim oleh Anda sendiri dari WhatsApp Anda. Shutrly hanya membuat tautan berisi teks yang sudah disiapkan. Kami tidak membaca atau menyimpan percakapan WhatsApp.",
        ],
      },
      {
        heading: "5. Email",
        paragraphs: [
          "Email yang dikirim Shutrly berisi tautan masuk, reset kata sandi, dan pemberitahuan layanan. Pendaftar daftar tunggu hanya menerima email peluncuran, dan dapat meminta dihapus kapan saja.",
        ],
      },
      {
        heading: "6. Cookie dan sesi",
        paragraphs: [
          "Shutrly menggunakan cookie untuk menjaga sesi login dan menyimpan preferensi bahasa. Kami tidak memakai cookie iklan. Jika cookie dimatikan, login mungkin tidak berfungsi.",
        ],
      },
      {
        heading: "7. Keamanan",
        paragraphs: [
          "Kami menerapkan langkah pengamanan teknis dan organisasi yang wajar, termasuk koneksi terenkripsi, kontrol akses, pembatasan permintaan, dan penyimpanan kata sandi dalam bentuk terenkripsi. Tidak ada metode penyimpanan atau transmisi elektronik yang sepenuhnya aman. Anda bertanggung jawab menjaga kata sandi akun dan kata sandi galeri.",
        ],
      },
      {
        heading: "8. Penyimpanan dan penghapusan",
        paragraphs: [
          "Data akun dan bisnis disimpan selama akun aktif. Data klien dan galeri disimpan selama proyek masih dikelola, atau sampai Anda menghapusnya. Kontak daftar tunggu disimpan sampai daftar ditutup atau Anda meminta dihapus. Yang belum pernah diundang dihapus paling lambat 12 bulan setelah mendaftar.",
          "Permintaan penghapusan akun dapat dikirim ke hello@shutrly.space. Sebagian catatan keamanan atau kewajiban hukum dapat tetap disimpan sesuai ketentuan yang berlaku.",
        ],
      },
      {
        heading: "9. Tanggung jawab pengguna bisnis",
        paragraphs: [
          "Jika Anda memasukkan data klien atau foto orang lain, Anda bertanggung jawab memastikan dasar hukum dan persetujuan yang diperlukan. Shutrly memproses data itu atas nama Anda.",
        ],
      },
      {
        heading: "10. Hak Anda",
        paragraphs: [
          "Sesuai UU Pelindungan Data Pribadi (UU 27/2022), Anda dapat meminta akses, perbaikan, salinan, pembatasan, atau penghapusan data pribadi Anda, serta mencabut persetujuan. Permintaan akan diverifikasi untuk melindungi akun Anda dan data pihak lain.",
        ],
      },
      {
        heading: "11. Perubahan kebijakan dan kontak",
        paragraphs: [
          "Kami dapat memperbarui kebijakan ini. Versi terbaru dan tanggal pembaruannya tersedia di halaman ini. Untuk pertanyaan atau permintaan terkait privasi, hubungi hello@shutrly.space.",
        ],
      },
    ],
    contactEmail: "hello@shutrly.space",
  },
};
