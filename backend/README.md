# Smart Driving Assistant (SDA) - Backend

Node.js + Fastify + TypeScript + PostgreSQL + PostGIS + Prisma

## المتطلبات

- Node.js 20+
- PostgreSQL 15+ مع PostGIS
- pgAdmin (مثبت مع PostgreSQL على Windows)

---

## الخطوة 1: إعداد PostgreSQL على Windows

### 1.1 افتح pgAdmin
- ابحث في Start Menu عن **pgAdmin 4**
- سجّل دخول بكلمة مرور postgres التي اخترتها عند التثبيت

### 1.2 أنشئ قاعدة البيانات
1. Right-click على **Databases** → **Create** → **Database**
2. Name: `sda_db`
3. Save

### 1.3 فعّل PostGIS
1. افتح **Query Tool** على `sda_db`
2. نفّذ:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
SELECT PostGIS_Version();
```

إذا ظهر رقم إصدار → PostGIS يعمل ✅

---

## الخطوة 2: إعداد Backend

```powershell
cd backend
npm install
```

### 2.1 أنشئ ملف `.env`

```powershell
copy .env.example .env
```

عدّل `.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/sda_db?schema=public"
JWT_SECRET=your-long-secret-key-here
PORT=3000
```

> غيّر `YOUR_PASSWORD` بكلمة مرور postgres الحقيقية.

### 2.2 أنشئ الجداول

```powershell
npm run db:generate
npm run db:migrate
```

عند السؤال عن اسم migration اكتب: `init`

### 2.3 (اختياري) بيانات تجريبية

```powershell
npm run db:seed
```

---

## الخطوة 3: تشغيل السيرفر

```powershell
npm run dev
```

افتح المتصفح:
- http://localhost:3000/api/health

---

## API Endpoints (MVP)

| Method | Endpoint | الوصف |
|--------|----------|--------|
| GET | `/api/health` | فحص السيرفر وقاعدة البيانات |
| POST | `/api/auth/register` | تسجيل حساب |
| POST | `/api/auth/login` | تسجيل دخول |
| GET | `/api/auth/me` | الملف الشخصي (يتطلب token) |
| GET | `/api/cameras` | كل الكاميرات |
| GET | `/api/cameras/nearby?lat=31.95&lng=35.91` | كاميرات قريبة |

---

## اختبار سريع (PowerShell)

### تسجيل مستخدم
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/auth/register" `
  -ContentType "application/json" `
  -Body '{"email":"driver@test.com","password":"123456","fullName":"Test Driver"}'
```

### فحص الصحة
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```

### كاميرات قريبة
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/cameras/nearby?lat=31.9539&lng=35.9106"
```

---

## الخطوات القادمة (بالترتيب)

1. ✅ PostgreSQL + PostGIS
2. ✅ Backend MVP (Auth + Cameras + Health)
3. ⏳ Trips API (FR-32 → FR-35)
4. ⏳ Community Reports (FR-41 → FR-44)
5. ⏳ Driving Analytics (FR-36 → FR-40)
6. ⏳ React Native App

---

## هيكل المشروع

```
backend/
├── prisma/
│   ├── schema.prisma      # نموذج البيانات
│   ├── init-postgis.sql   # تفعيل PostGIS
│   └── seed.ts            # بيانات تجريبية
├── src/
│   ├── app.ts             # نقطة البداية
│   ├── plugins/           # DB, JWT
│   └── modules/
│       ├── auth/
│       ├── cameras/
│       └── health/
└── package.json
```

---

## مشاكل شائعة

### psql غير معروف في PowerShell
استخدم **pgAdmin Query Tool** بدلاً من psql، أو أضف PostgreSQL إلى PATH:
```
C:\Program Files\PostgreSQL\16\bin
```

### خطأ اتصال بقاعدة البيانات
- تأكد أن خدمة PostgreSQL تعمل (Services → postgresql-x64-16)
- تأكد من كلمة المرور في `.env`
- تأكد أن المنفذ 5432 مفتوح

### PostGIS غير موجود
أعد تثبيت PostgreSQL Stack Builder واختر PostGIS extension.
