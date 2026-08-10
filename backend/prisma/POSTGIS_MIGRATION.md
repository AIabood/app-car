# PostGIS Migration Instructions

ملف SQL: `prisma/migrations/20260806_enable_postgis.sql`

الخطوات المقترحة:

1. **احفظ نسخة احتياطية من قاعدة البيانات** قبل أي تغيّر.

2. **تشغيل السكريبت** (باستخدام `psql` أو عميل DB آخر):

```bash
psql "$DATABASE_URL" -f prisma/migrations/20260806_enable_postgis.sql
```

أو على شكل خطوات تفاعلية داخل `psql`:

```sql
-- داخل psql
\i prisma/migrations/20260806_enable_postgis.sql
```

3. **تحقق من النتائج:**

- تأكد أن الأعمدة `location` مملوءة:

```sql
SELECT id, ST_AsText(location) FROM trip_points LIMIT 5;
```

- تأكد من وجود الفهارس GiST.

4. **خطوات لاحقة:**

- بعد التحقق، يمكنك تعديل `prisma/schema.prisma` (تمّت إضافة الحقول Unsupported بالفعل) وتشغيل `prisma migrate dev` أو إنشاء migration مخصص.
- عندما تتأكّد أن `location` صحيح، احذف أعمدة `latitude`/`longitude` عبر migration مرحلي:
  a. إيقاف الكتابة إلى الحقول القديمة في التطبيق.
  b. تشغيل `ALTER TABLE ... DROP COLUMN latitude, DROP COLUMN longitude;` في سكريبت migration.

5. **ملاحظات أمان وحقوق الوصول:**

- `CREATE EXTENSION` يتطلّب صلاحيات مناسبة على قاعدة البيانات. شغّل السكريبت بواسطة مستخدم يمتلك صلاحية إنشاء امتدادات، أو اطلب من مسؤول DB تشغيله.

6. **التراجع (rollback):**

- انسخ الأعمدة القديمة قبل الحذف إذا لزم:

```sql
ALTER TABLE trip_points ADD COLUMN latitude_backup double precision;
UPDATE trip_points SET latitude_backup = ST_Y(ST_SetSRID(location::geometry,4326));
```

- لا توجد طريقة سحرية لإلغاء `CREATE EXTENSION` إن تمّت. تأكّد من خطة التراجع قبل التنفيذ.
