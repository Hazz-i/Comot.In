# Comot.in - Video Downloader Platform

Comot.in adalah platform web untuk mengunduh video dari berbagai platform media sosial dengan antarmuka yang modern dan mudah digunakan. Aplikasi ini dibangun menggunakan React, TypeScript, dan Vite dengan sistem autentikasi dan dashboard yang lengkap.

## 📋 Deskripsi Program

Comot.in adalah aplikasi web yang memungkinkan pengguna untuk:

- **Download Video**: Mengunduh video dari berbagai platform media sosial
- **Preview Video**: Melihat preview video dan informasi sebelum mengunduh
- **Sistem Autentikasi**: Login dan registrasi pengguna dengan JWT token
- **Dashboard Pengguna**: Panel kontrol untuk mengelola aktivitas download
- **Admin Dashboard**: Panel admin untuk mengelola pengguna dan sistem
- **Responsive Design**: Antarmuka yang responsive untuk semua perangkat
- **Rate Limiting**: Sistem pembatasan download untuk pengguna non-premium

## 🛠️ Teknologi yang Digunakan

- **Frontend Framework**: React 19 dengan TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI (Dialog, Dropdown, Avatar, dll.)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Notifications**: Sonner (Toast notifications)
- **Icons**: Lucide React
- **Linting**: ESLint dengan TypeScript

## 📦 Persyaratan Sistem

Pastikan sistem Anda memiliki:

- **Node.js**: versi 18 atau lebih baru
- **npm** atau **pnpm**: Package manager
- **Docker** (opsional): Untuk deployment dengan container

## 🚀 Cara Instalasi

### Metode 1: Instalasi Manual

1. **Clone Repository**
   ```bash
   git clone https://github.com/username/comot.in-app.git
   cd comot.in-app
   ```

2. **Install Dependencies**
   
   Menggunakan pnpm (recommended):
   ```bash
   pnpm install
   ```
   
   Atau menggunakan npm:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   
   Buat file `.env` di root project:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_LOGIN_ENDPOINT=/login
   VITE_REGISTER_ENDPOINT=/register
   VITE_USER_ENDPOINT=/users/me
   ```

4. **Jalankan Development Server**
   ```bash
   pnpm dev
   ```
   atau
   ```bash
   npm run dev
   ```

5. **Akses Aplikasi**
   
   Buka browser dan akses `http://localhost:5173`

### Metode 2: Menggunakan Docker

1. **Build dan Jalankan dengan Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Akses Aplikasi**
   
   Aplikasi akan tersedia di `http://localhost:3000`

## 📝 Perintah yang Tersedia

- `pnpm dev` - Menjalankan development server
- `pnpm build` - Build aplikasi untuk production
- `pnpm preview` - Preview build production
- `pnpm lint` - Menjalankan ESLint untuk code quality

## 🏗️ Struktur Project

```
src/
├── components/          # Komponen reusable
│   ├── dashboard/      # Komponen dashboard
│   ├── modal/          # Modal components
│   └── ui/             # UI components (Button, Input, dll.)
├── layouts/            # Layout components
│   └── navbar/         # Header dan Footer
├── pages/              # Halaman utama
├── lib/                # Utility functions
├── constant/           # Konstanta aplikasi
└── assets/             # Asset statis
```

## 🔧 Konfigurasi Development

### ESLint Configuration

Untuk production, disarankan menggunakan konfigurasi type-aware:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

### Tailwind CSS

Project ini menggunakan Tailwind CSS v4 dengan konfigurasi modern. File konfigurasi tersedia di `@tailwindcss/vite`.

## 🎯 Fitur Utama

### 1. Homepage
- Interface untuk memasukkan URL video
- Preview video sebelum download
- Pemilihan resolusi dan format

### 2. Dashboard Pengguna
- Riwayat download
- Statistik penggunaan
- Manajemen profil

### 3. Admin Dashboard
- Manajemen pengguna
- Monitoring sistem
- Analytics dan reporting

### 4. Sistem Autentikasi
- Login/Register
- JWT token management
- Protected routes

## 🔒 Security Features

- **JWT Authentication**: Token-based authentication
- **Protected Routes**: Route protection untuk user dan admin
- **Rate Limiting**: Pembatasan request untuk mencegah abuse
- **Input Validation**: Validasi input untuk keamanan

## 🚀 Deployment

### Production Build

```bash
pnpm build
```

Build files akan tersedia di folder `dist/`

### Docker Deployment

```bash
docker build -t comot-in-app .
docker run -p 3000:80 comot-in-app
```

## 🤝 Contributing

1. Fork repository
2. Buat branch feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request 
6. selesei

## 📄 License

Project ini menggunakan lisensi MIT. Lihat file `LICENSE` untuk detail lebih lanjut.

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini atau hubungi tim development.

---

**Happy Coding! 🚀**