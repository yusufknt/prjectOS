# KESİN VE NET MİMARİ — ProjectOS (v1.0)

## 1. Proje Adı
**ProjectOS** — *Kişisel Proje ve Geliştirme Yönetim Uygulaması*

---

## 2. Amaç
Uzun süren yazılım projelerinde nerede kaldığını unutmamak, Git durumunu görmek, günlük geliştirme notları tutmak ve tüm projeleri tek ekranda yönetmek.

---

## 3. Kesin Teknoloji Seçimi

| Katman | Teknoloji |
| :--- | :--- |
| **Desktop Framework** | Tauri 2 |
| **Frontend** | React 19 + TypeScript |
| **UI** | Tailwind CSS + shadcn/ui |
| **Animasyon** | Framer Motion |
| **State Management** | Zustand |
| **Veritabanı** | SQLite |
| **ORM** | Drizzle ORM |
| **Git Entegrasyonu** | simple-git |
| **Markdown** | react-markdown |
| **Form Yönetimi** | React Hook Form + Zod |
| **Build Tool** | Vite |

---

## 4. Neden Tauri?
Bu proje için en doğru seçim olmasının sebepleri:
- Windows ve macOS'ta yerel (native) performansla çalışır.
- Electron'dan çok daha az RAM kullanır ve çok daha hafif bir çıktı sunar.
- Çok daha hızlı açılır (`< 2 saniye` soğuk açılış).
- Modern masaüstü uygulama mimarisi ve güvenlik sunar.
- Uzun vadeli kullanım ve sürdürülebilirlik için idealdir.

---

## 5. Klasör Yapısı

```text
project-os/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── ui/
│   │   └── common/
│   ├── pages/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── git/
│   │   ├── notes/
│   │   ├── tasks/
│   │   ├── timeline/
│   │   └── settings/
│   ├── hooks/
│   ├── store/
│   ├── services/
│   ├── lib/
│   └── types/
├── src-tauri/
│   ├── src/
│   └── tauri.conf.json
├── drizzle/
└── database/
```

---

## 6. Veritabanı Şeması

### `projects` (Ana Tablo)
| Alan | Tip | Açıklama |
| :--- | :--- | :--- |
| `id` | TEXT | Primary Key (UUID) |
| `name` | TEXT | Proje adı |
| `description` | TEXT | Proje açıklaması |
| `local_path` | TEXT | Yerel dizin yolu (`C:\Users\...`) |
| `repository` | TEXT | Git remote repository URL |
| `status` | TEXT | `active`, `pending`, `completed`, `archived` |
| `progress` | INTEGER | Yüzde olarak ilerleme (0-100) |
| `created_at` | DATETIME | Oluşturulma tarihi |
| `updated_at` | DATETIME | Güncellenme tarihi |

### `notes` (Markdown Notları)
| Alan | Tip | Açıklama |
| :--- | :--- | :--- |
| `id` | TEXT | Primary Key |
| `project_id` | TEXT | Foreign Key (`projects.id`) |
| `title` | TEXT | Not başlığı |
| `content` | TEXT | Markdown içerik |
| `created_at` | DATETIME | Oluşturulma tarihi |
| `updated_at` | DATETIME | Güncellenme tarihi |

### `tasks` (Görevler / Kanban)
| Alan | Tip | Açıklama |
| :--- | :--- | :--- |
| `id` | TEXT | Primary Key |
| `project_id` | TEXT | Foreign Key (`projects.id`) |
| `title` | TEXT | Görev başlığı |
| `description` | TEXT | Görev detayı |
| `status` | TEXT | `todo`, `in_progress`, `done` |
| `priority` | TEXT | `low`, `medium`, `high` |
| `created_at` | DATETIME | Oluşturulma tarihi |

### `timeline` (Zaman Akışı / Etkinlik Logları)
| Alan | Tip | Açıklama |
| :--- | :--- | :--- |
| `id` | TEXT | Primary Key |
| `project_id` | TEXT | Foreign Key (`projects.id`) |
| `type` | TEXT | `git_commit`, `note_created`, `task_updated`, `status_change` vb. |
| `content` | TEXT | Etkinlik detayı |
| `created_at` | DATETIME | Oluşturulma tarihi |

---

## 7. Git Özellikleri
Uygulama açıldığında ve periyodik olarak okunan otomatik bilgiler:
- **Aktif Branch**
- **Son Commit Mesajı ve Zamanı**
- **Son Push Zamanı**
- **Remote Repository URL**
- **Değişen Dosyalar (Modified / Staged)**
- **Untracked Dosyalar**
- **Ahead / Behind Durumu**

> **Not:** Git bilgileri uygulama açıldığında ve her 5 dakikada bir otomatik yenilenir.

---

## 8. Ana Ekran (Dashboard)
- **Aktif Projeler** ve **Bekleyen Projeler** kartları
- **Bugünkü Odak (Today's Focus)** bölümü
- **Son Aktiviteler, Son Commitler & Son Pushlar**
- **Genel İstatistikler (Proje sayısı, tamamlanan görev oranı vb.)**

---

## 9. Tasarım Kuralları

| Öğe | Karar |
| :--- | :--- |
| **Tema** | Açık tema varsayılan |
| **İkincil Tema** | Koyu tema (Dark Mode desteği) |
| **Font** | Inter |
| **Köşe Yuvarlaklığı** | 20px (`rounded-2xl` / `rounded-3xl`) |
| **Animasyon Süresi** | 150–250ms (Framer Motion ile akıcı geçişler) |
| **Tasarım Dili** | Apple + Linear + Arc (Modern Glassmorphism & Premium Minimalizm) |

---

## 10. Performans Hedefleri

| Metrik | Hedef | Açıklama |
| :--- | :--- | :--- |
| **Açılış Süresi** | `< 2 saniye` | Soğuk açılış hedefi |
| **Dashboard Yükleme** | `< 100 ms` | İlk veri yükleme |
| **SQLite Sorgu** | `< 20 ms` | Yerel sorgu hedefi |
| **Boşta RAM** | `< 200 MB` | Tauri avantajı |

---

## 11. V1 Özellikleri (Kapsam Dahilinde)
- [x] Proje Ekleme, Düzenleme, Silme
- [x] Git durumunu yerel yoldan otomatik okuma
- [x] Geliştirme Günlüğü (Dev Log)
- [x] Markdown destekli Notlar
- [x] Kanban Görev Sistemi (Todo / In Progress / Done)
- [x] Zaman Akışı (Timeline)
- [x] Global Arama (Command Palette)
- [x] Zengin Dashboard Görünümü
- [x] Açık / Koyu Tema (Apple Minimalist & Premium Görünüm)

---

## 12. V1'de OLMAYACAK (Kapsam Dışı)
- Git commit atma / push yapma (V1 salt okunur takip odaklıdır)
- Bulut senkronizasyonu
- Çoklu kullanıcı / Takım çalışması
- IDE olma / VS Code yerine geçme

---

## 13. Nihai Karar Özet Tablosu

| Bileşen | Karar |
| :--- | :--- |
| **Desktop** | Tauri 2 |
| **Frontend** | React 19 + TypeScript |
| **UI** | Tailwind CSS + shadcn/ui + Framer Motion |
| **Database** | SQLite + Drizzle ORM |
| **Git Entegrasyonu** | simple-git (Yerel okuma) |
| **Platform** | Windows + macOS |
| **Dil** | Tamamen Türkçe |
| **Tasarım** | Apple Minimalist / Premium Linear tarzı |
