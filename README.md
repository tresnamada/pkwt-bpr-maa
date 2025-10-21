# 🏦 Sistem PKWT BPR MAA

Sistem manajemen PKWT (Perjanjian Kerja Waktu Tertentu) dan evaluasi kinerja karyawan untuk Bank BPR MAA. Aplikasi web modern yang dibangun dengan Next.js 14, TypeScript, dan Firebase.

## 📋 Deskripsi

Sistem ini menyediakan solusi terintegrasi untuk mengelola:
- **Database Pelamar**: Manajemen data pelamar kerja dengan tracking status rekrutmen
- **Rapot Kompetensi OPS**: Evaluasi kinerja karyawan operasional berdasarkan jabatan
- **Knowledge Management**: Tracking nilai karyawan per triwulan (TW1, TW2, TW3)
- **Multi-Branch Support**: Dukungan untuk berbagai cabang BPR MAA

## ✨ Fitur Utama

### 🔐 Autentikasi & Otorisasi
- Login dengan email/password menggunakan Firebase Auth
- Role-based access control (Super Admin & Branch Admin)
- Protected routes untuk keamanan halaman
- Session management otomatis

### 👥 Manajemen Pelamar
- CRUD data pelamar lengkap dengan foto
- Upload dokumen (CV, KTP, Ijazah, dll)
- Filter multi-kriteria (cabang, posisi, status, hasil akhir)
- Export data pelamar
- Tracking status rekrutmen real-time
- Email notification otomatis

### 📊 Evaluasi Kinerja (Skills)
- Form evaluasi dengan 4 tingkat penilaian:
  - 🔴 **Kurang**: Belum mampu mandiri
  - 🟡 **Cukup**: Mandiri tapi sering error
  - 🔵 **Baik**: Sesuai standar
  - 🟢 **Mahir**: Mampu mencari solusi alternatif
- Expandable card untuk detail evaluasi
- Filter berdasarkan jabatan
- Pencarian karyawan dan unit
- Cetak rapot kinerja

### 📚 Knowledge Management
- Input nilai triwulan (TW1, TW2, TW3)
- Tabel interaktif dengan color-coded scores
- Filter per cabang
- Import data dari CSV
- Tracking tanggal evaluasi

### 🎨 UI/UX Modern
- Responsive design (Mobile, Tablet, Desktop)
- Gradient backgrounds & smooth animations
- Loading states & empty states
- Toast notifications untuk feedback
- Confirmation dialogs untuk aksi penting

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components dengan Headless UI patterns
- **Icons**: Heroicons (SVG)
- **Image Optimization**: Next.js Image component

### Backend & Database
- **BaaS**: Firebase
  - Authentication (Email/Password)
  - Firestore Database (NoSQL)
  - Storage (File uploads)
- **Email Service**: Resend API

### Development Tools
- **Package Manager**: npm/yarn/pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript strict mode

## 🚀 Getting Started

### Prerequisites

Pastikan Anda telah menginstall:
- Node.js 18.x atau lebih tinggi
- npm, yarn, atau pnpm
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd pkwt
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 3. Setup Environment Variables

Buat file `.env.local` di root directory dengan konfigurasi berikut:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Resend Email Configuration
RESEND_API_KEY=re_your_api_key_here
SENDER_EMAIL=onboarding@resend.dev
ADMIN_EMAILS=admin@bprmaa.com
```

**Cara mendapatkan credentials:**

#### Firebase:
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru atau pilih existing project
3. Pergi ke Project Settings > General
4. Scroll ke "Your apps" dan pilih Web app
5. Copy semua config values

#### Resend:
1. Daftar di [Resend](https://resend.com/)
2. Pergi ke [API Keys](https://resend.com/api-keys)
3. Generate new API key
4. Copy key tersebut

**Important Notes:**
- Jangan ada spasi di sekitar tanda `=`
- Jangan gunakan quotes kecuali value mengandung spasi
- Restart dev server setelah mengubah environment variables
- Jangan commit file `.env.local` ke Git

### 4. Setup Firebase

#### a. Firestore Database
Buat collections berikut:

```
/applicants
  - id (auto-generated)
  - name: string
  - email: string
  - phone: string
  - position: string
  - branch: string
  - status: string
  - hasilAkhir: string
  - photoURL: string (optional)
  - documents: array
  - createdAt: timestamp
  - updatedAt: timestamp

/evaluations
  - id (auto-generated)
  - employeeName: string
  - position: string
  - unit: string
  - questions: array
  - overallNotes: string
  - evaluatedBy: string
  - createdAt: timestamp

/knowledge
  - id (auto-generated)
  - name: string
  - branch: string
  - score: number
  - tw1: number
  - tw2: number
  - tw3: number
  - createdAt: timestamp
  - createdBy: string

/users
  - email: string (document ID)
  - role: string ('super_admin' | 'branch_admin')
  - branch: string (optional, for branch_admin)
  - createdAt: timestamp
```

#### b. Storage Rules
Setup storage untuk upload files:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /applicants/{applicantId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

#### c. Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{email} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.email == email;
    }
    
    match /applicants/{applicantId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /evaluations/{evaluationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /knowledge/{knowledgeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Create Admin User

Setelah setup Firebase, buat user admin pertama:

1. Jalankan aplikasi
2. Register user baru melalui halaman login
3. Buka Firebase Console > Firestore
4. Buat document di collection `users`:
   ```
   Document ID: admin@bprmaa.com
   Fields:
     - role: "super_admin"
     - createdAt: [timestamp]
   ```

### 6. Run Development Server

```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur Project

```
pkwt/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── applicants/          # Halaman manajemen pelamar
│   │   │   ├── add/            # Form tambah pelamar
│   │   │   ├── [id]/           # Detail & edit pelamar
│   │   │   └── page.tsx        # List pelamar
│   │   ├── dashboard/          # Dashboard utama
│   │   ├── performance/        # Evaluasi kinerja
│   │   │   ├── add/           # Form evaluasi baru
│   │   │   ├── [id]/          # Detail evaluasi
│   │   │   └── page.tsx       # List evaluasi & knowledge
│   │   ├── api/               # API routes
│   │   │   └── send-email/   # Email notification
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing/Login page
│   ├── components/            # Reusable components
│   │   ├── AlertProvider.tsx  # Alert/notification system
│   │   ├── LogoutButton.tsx   # Logout component
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── contexts/              # React contexts
│   │   ├── AlertContext.tsx   # Alert state management
│   │   └── AuthContext.tsx    # Auth state management
│   ├── lib/                   # Utilities & services
│   │   ├── firebase.ts        # Firebase config
│   │   ├── applicantService.ts # Applicant CRUD
│   │   └── performanceService.ts # Performance CRUD
│   └── types/                 # TypeScript types
│       ├── applicant.ts
│       └── performance.ts
├── public/                    # Static assets
│   └── Logo Bpr.png          # Logo BPR MAA
├── .env.local                # Environment variables (gitignored)
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS config
├── tsconfig.json             # TypeScript config
└── package.json              # Dependencies
```

## 🎯 Cara Penggunaan

### Login
1. Buka aplikasi di browser
2. Masukkan email dan password
3. Klik "Masuk"

### Mengelola Pelamar
1. Dari dashboard, klik "Database Pelamar"
2. Klik "+ Tambah Pelamar" untuk menambah data baru
3. Isi form lengkap dengan foto dan dokumen
4. Gunakan filter untuk mencari pelamar spesifik
5. Klik card pelamar untuk melihat detail/edit

### Evaluasi Kinerja
1. Dari dashboard, klik "Rapot Kompetensi OPS"
2. Tab "Skills": Klik "+ Tambah Evaluasi"
3. Pilih jabatan dan isi pertanyaan evaluasi
4. Klik card untuk expand dan lihat detail
5. Klik "Lihat Rapot" untuk cetak

### Knowledge Management
1. Di halaman Performance, pilih tab "Knowledge"
2. Klik "+ Tambah Karyawan"
3. Isi nama, cabang, dan nilai TW1-TW3
4. Gunakan filter cabang untuk melihat per branch
5. Data ditampilkan dalam tabel dengan color-coding

## 🔧 Konfigurasi

### Menambah Cabang Baru
Edit file yang relevan untuk menambah cabang:
- `src/app/applicants/add/page.tsx` (line ~150)
- `src/app/applicants/[id]/page.tsx` (line ~200)

### Menambah Posisi/Jabatan
Edit dropdown options di:
- `src/app/applicants/add/page.tsx`
- `src/app/performance/add/page.tsx`

### Customize Email Template
Edit file `src/app/api/send-email/route.ts`

## 📧 Email Notifications

Sistem mengirim email otomatis untuk:
- Pelamar baru ditambahkan
- Status pelamar diupdate
- Hasil akhir rekrutmen

Template email dapat dikustomisasi di API route.

## 🔒 Security Best Practices

- ✅ Environment variables untuk sensitive data
- ✅ Firebase security rules
- ✅ Protected routes dengan authentication
- ✅ Role-based access control
- ✅ Input validation & sanitization
- ✅ File upload restrictions

## 🐛 Troubleshooting

### Port 3000 sudah digunakan
```bash
# Gunakan port lain
npm run dev -- -p 3001
```

### Firebase connection error
- Cek `.env.local` sudah benar
- Pastikan Firebase project aktif
- Verify API keys valid

### Email tidak terkirim
- Cek Resend API key
- Verify sender email sudah verified di Resend
- Cek quota Resend account

### Build error
```bash
# Clear cache dan rebuild
rm -rf .next
npm run build
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
# Build production
npm run build

# Start production server
npm start
```

## 📝 License

Proprietary - Bank BPR MAA

## 👥 Contributors

- Development Team BPR MAA

## 📞 Support

Untuk bantuan teknis, hubungi tim IT BPR MAA.

---

**Built with ❤️ for Bank BPR MAA**
