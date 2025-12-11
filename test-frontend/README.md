# Jeopardy API Test Frontend

Frontend sederhana untuk testing API Jeopardy.

## Cara Penggunaan

### 1. Setup Backend

```bash
# Di folder project utama
bun install
bun docker:up:dev       # Jalankan database
bun migrate:dev         # Migrasi database
bun seed:dev            # Isi data dummy
bun start:dev           # Jalankan server
```

### 2. Buka Frontend

Buka file `index.html` langsung di browser:

- Double-click file `index.html`, atau
- Gunakan Live Server extension di VS Code, atau
- Jalankan: `npx serve .` di folder test-frontend

### 3. Test API

1. **Login** - Gunakan akun super admin:
   - Email: `super@admin.com`
   - Password: `super_admin`

2. **Create Game** - Tab "Create Game":
   - Isi nama game
   - Upload thumbnail (atau biarkan kosong untuk dummy)
   - Click "Create Game"

3. **Play Game** - Tab "Play":
   - Masukkan Game ID
   - Click "Load Game"
   - Klik nilai uang pada board untuk menjawab

## API Endpoints yang Ditest

| Method | Endpoint                             | Deskripsi      |
| ------ | ------------------------------------ | -------------- |
| POST   | `/api/auth/login`                    | Login          |
| POST   | `/api/auth/register`                 | Register       |
| GET    | `/api/game`                          | List games     |
| GET    | `/api/game/templates`                | Game templates |
| POST   | `/api/game/jeopardy`                 | Create game    |
| GET    | `/api/game/jeopardy/:id`             | Get detail     |
| GET    | `/api/game/jeopardy/:id/play/public` | Get play data  |
| PATCH  | `/api/game/jeopardy/:id`             | Update game    |
| DELETE | `/api/game/jeopardy/:id`             | Delete game    |
| POST   | `/api/game/jeopardy/:id/check`       | Check answer   |

## Notes

- Folder ini ada di `.gitignore`, tidak akan ter-commit
- Pastikan backend berjalan di `http://localhost:4000`
- Jika ada CORS error, pastikan backend sudah dikonfigurasi dengan benar
