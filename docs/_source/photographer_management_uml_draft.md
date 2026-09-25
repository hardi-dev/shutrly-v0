# Photographer Management Platform — UML Draft

**Status:** Draft domain yang diselaraskan dengan `photographer_management_platform_blueprint.md` (2026-09-25). Dokumen ini memuat keputusan produk/domain; detail diagram formal, arsitektur teknis, keamanan, dan pemetaan database ada di blueprint.

## 1. Scope Produk

Platform ini ditujukan untuk bisnis photography yang dapat dimulai dari satu owner/photographer, tetapi tetap mendukung beberapa brand melalui Workspace dan penggunaan freelancer sebagai resource internal.

Freelancer belum memiliki akses langsung ke sistem pada versi awal dan hanya dikelola sebagai `TeamMember`.

Platform dirancang agar dapat berkembang tanpa terlalu bergantung pada satu storage provider atau satu jenis layanan photography.

Platform mencakup:

- Authentication & account management
- Workspace / brand management
- Workspace source / storage configuration
- Workspace communication template
- Client management
- Service category
- Service item definition / reusable item library
- Service
- Service item
- Service-specific booking field definition
- Project
- Project item
- Project field value
- Project add-on
- Session
- Team member / freelancer
- Project assignment
- Private gallery
- Gallery source
- External photo source integration
- Google Drive sebagai source provider pada phase awal
- Google Drive folder link yang disiapkan manual oleh Owner; aplikasi membaca metadata saja
- Selection group / photo selection entitlement
- Photo selection oleh client
- Invoice
- Invoice item
- Payment
- WhatsApp sharing via prefilled message template

Untuk MVP, akses internal hanya untuk Owner. Nilai paket dibatasi pada angka dan rentang; harga memakai IDR tanpa kalkulasi pajak. Drizzle ORM, Next.js, Neon PostgreSQL, Better Auth, dan Cloudflare adalah pilihan implementasi, bukan domain class.

---

# 2. Actor

## 2.1 Owner / Photographer

Owner adalah pengguna utama sistem dan memiliki akses untuk mengelola operasional photography business pada Workspace yang dimilikinya.

Use case utama:

### Authentication & Account

- Register
- Login
- Logout
- Verify Email
- Forgot Password
- Reset Password
- Update Profile
- Change Password

### Workspace

- Login
- Manage Workspace
- Manage Workspace Branding
- Manage Source / Storage Configuration
- Manage Message Templates

### Service Setup

- Manage Service Category
- Manage Service Item Definition
- Manage Service
- Configure Service Items
- Set Service Item Values
- Configure Service-specific Booking Fields

### Client & Project

- Manage Client
- Create Project
- Select Service for Project
- Fill Service-specific Booking Fields
- Customize Project Items
- Manage Project Add-ons
- Manage Project Status

### Session & Team

- Manage Session
- Manage Team Member / Freelancer
- Assign Team Member to Project

### Gallery

- Create / Manage Private Gallery
- Add Gallery Source
- Configure Gallery Password
- Rotate Gallery Password
- Sync / Load Photos from Gallery Source
- Publish Final Delivery dari folder `edited` / `print` yang dibuat dan diisi manual di Google Drive
- Associate Photo with Session
- View Client Photo Selection
- Share Gallery via WhatsApp

### Photo Selection

- Configure selection entitlement through Project Items
- Manage additional selection entitlement through Project Add-ons
- View Selection Groups
- View Submitted Client Selections

### Billing

- Create Invoice
- Manage Invoice Items
- Add Project Add-on to Invoice
- Record Payment
- Void catatan Payment yang salah (dengan audit)
- Set nominal Discount pada draft Invoice
- Share Invoice via WhatsApp
- Share Payment Reminder via WhatsApp
- Share Final Delivery via WhatsApp

---

## 2.2 Client

Client tidak perlu memiliki account pada MVP.

Client mengakses resource melalui private link yang diberikan oleh Photographer.

Use case utama:

- Access Private Gallery
- Enter Gallery Password
- View Photos
- View Available Selection Groups
- Select Photos for a Selection Group
- Set Quantity for applicable selections such as Print
- Submit Photo Selection
- View Invoice
- Download Final Result

Client memakai token Project yang sama pada link Gallery dan Invoice terbit; Gallery juga wajib menggunakan password. File hasil akhir tampil sebagai download di Gallery yang sama setelah Owner mempublikasikan final delivery.

Contoh Selection Group yang dapat dilihat Client:

```text
Edited Photos
12 / 25 selected

Printed Photos
4 / 8 selected
```

Client tidak perlu mengetahui apakah limit tersebut berasal dari package awal atau tambahan Add-on.

---

## 2.3 Freelancer / Team Member

Freelancer **bukan Actor** pada MVP karena belum memiliki akses langsung ke sistem.

Freelancer direpresentasikan sebagai `TeamMember` dan dikelola oleh Owner.

Data Freelancer dapat digunakan untuk:

- Assignment ke Project
- Menentukan role pada Project
- Mencatat fee
- Mencatat status assignment
- Menyimpan informasi kontak dan catatan internal

Contoh role:

- Lead Photographer
- Second Shooter
- Assistant
- Editor

Pada phase berikutnya, `TeamMember` dapat dikembangkan menjadi Actor apabila Freelancer diberikan account dan akses langsung ke platform.

---

## 2.6 External Source Provider

External source provider bukan user manusia, tetapi merupakan sistem eksternal yang digunakan oleh platform sebagai sumber file foto.

Pada phase awal:

```text
Google Drive
```

Arsitektur disiapkan agar nantinya dapat mendukung provider lain seperti:

```text
Dropbox
OneDrive
S3
Custom Source
```

Konfigurasi provider dikelola melalui:

```text
WorkspaceSourceConfig
```

Sedangkan folder/resource konkret yang digunakan oleh Gallery direpresentasikan melalui:

```text
GallerySource
```

---

# 2.4 Authentication & Account Management

Authentication digunakan oleh internal user / Owner untuk mengakses platform.

Pada MVP, `User` merepresentasikan account internal milik Owner/Photographer.

`Client` bukan bagian dari authentication user dan tidak perlu login.

## User

```text
User
- id
- name
- email
- emailVerifiedAt
- status
- createdAt
- updatedAt
```

Secara implementasi, konsep `User` dipetakan ke satu tabel `user` milik Better Auth dengan ekstensi status dan waktu verifikasi. Password/credential, session, dan proses verifikasi dikelola Better Auth; tidak ada tabel User domain kedua. `User.id` mengikuti tipe ID Better Auth (`AuthUserId`), tidak diasumsikan UUID.

Possible `status`:

```text
ACTIVE
SUSPENDED
DISABLED
```

Use case:

- Register
- Login
- Logout
- Verify Email
- Forgot Password
- Reset Password
- Update Profile
- Change Password

Flow register:

```text
Register
   ↓
Create User
   ↓
Verify Email
   ↓
Create First Workspace
   ↓
Enter Application
```

Relationship pada MVP:

```text
User 1 ------ 0..* Workspace
```

Artinya satu User / Owner dapat memiliki beberapa Workspace / brand.
Jumlahnya dapat nol setelah registrasi sebelum Workspace pertama dibuat.

Jika pada phase berikutnya satu Workspace dapat memiliki beberapa internal user, model dapat dikembangkan dengan entity:

```text
WorkspaceMember
- id
- workspaceId
- userId
- role
- status
```

Sehingga relationship dapat berubah menjadi:

```text
User * ------ * Workspace
      via WorkspaceMember
```

Untuk MVP saat ini, `WorkspaceMember` belum diperlukan.

---

# 2.5 Communication via WhatsApp

Pada MVP, komunikasi ke Client dilakukan melalui WhatsApp dengan pola:

```text
System generates message
        ↓
Owner clicks "Share via WhatsApp"
        ↓
WhatsApp opens with prefilled text
        ↓
Owner reviews and sends manually
```

Platform tidak mengirim pesan langsung melalui WhatsApp API pada phase awal.

Karena itu, sistem belum perlu menyimpan message history atau delivery status.

Contoh template Gallery:

```text
Halo {{clientName}},

Gallery untuk project {{projectTitle}} sudah tersedia.

Silakan akses:
{{galleryUrl}}

Password:
{{galleryPassword}}
```

Contoh template Invoice:

```text
Halo {{clientName}},

Invoice untuk {{projectTitle}} sudah tersedia.

Total: {{invoiceTotal}}
Due date: {{dueDate}}

Lihat invoice:
{{invoiceUrl}}
```

Use case terkait:

- Share Gallery via WhatsApp
- Share Invoice via WhatsApp
- Share Payment Reminder via WhatsApp
- Share Final Delivery via WhatsApp
- Share Selection Reminder via WhatsApp

Pada MVP:

```text
MessageTemplate
= diperlukan

Message / MessageLog
= belum diperlukan
```

Jika di phase berikutnya platform menggunakan WhatsApp Business API, barulah dapat ditambahkan entity seperti `Message`, `providerMessageId`, `deliveryStatus`, `sentAt`, dan `failedAt`.

Untuk template yang memuat `{{galleryPassword}}`, sistem hanya menyimpan hash password Gallery. Saat ingin berbagi lagi, Owner wajib memasukkan ulang password untuk diverifikasi; plaintext tidak disimpan. Password akan muncul dalam tautan/draf pesan WhatsApp yang telah diisi, sehingga Owner perlu meninjau pesan sebelum mengirim. Rotasi password menonaktifkan password dan sesi Gallery lama; Owner harus membagikan password baru.

---

# 2.7 User vs Client

`User` dan `Client` adalah dua konsep berbeda.

```text
User
= internal authenticated account
= Owner / Photographer

Client
= customer record
= tidak login pada MVP
```

Client mengakses gallery dan invoice melalui private/shared link, bukan melalui authenticated account.

---

# 3. Workspace

Workspace merepresentasikan satu brand/business photography.

Satu Owner dapat memiliki beberapa Workspace.

Contoh:

```text
Owner
├── Workspace: Aster Wedding
├── Workspace: Aster Family
└── Workspace: Aster Commercial
```

Masing-masing Workspace dapat memiliki:

- Branding
- Client
- Service
- Project
- Team Member
- Invoice
- Payment
- Source / Storage Provider Configuration

### Class: Workspace

```text
Workspace
- id
- ownerUserId
- name
- brandName
- email
- phone
- address
- logoUrl
- invoicePrefix
- defaultCurrency
- isActive
```

Relationship:

```text
User 1 ------ 0..* Workspace
```

`defaultCurrency` hanya `IDR` pada MVP; kode disimpan agar mata uang lain dapat didukung nanti. Semua data milik Workspace harus tetap terisolasi menurut `workspaceId`.

## 3.0 MessageTemplate

`MessageTemplate` adalah template komunikasi reusable pada level Workspace.

Class:

```text
MessageTemplate
- id
- workspaceId
- name
- type
- channel
- content
- isActive
- createdAt
- updatedAt
```

Possible `type`:

```text
GALLERY_SHARE
INVOICE_SHARE
PAYMENT_REMINDER
FINAL_DELIVERY
SELECTION_REMINDER
```

Untuk phase awal:

```text
channel = WHATSAPP
```

Model tetap generic agar nantinya dapat mendukung:

```text
EMAIL
SMS
```

Relationship:

```text
Workspace 1 ------ 0..* MessageTemplate
```

Template dapat menggunakan variable seperti:

```text
{{clientName}}
{{projectTitle}}
{{galleryUrl}}
{{galleryPassword}}
{{invoiceTotal}}
{{dueDate}}
{{invoiceUrl}}
```

---

## 3.1 WorkspaceSourceConfig

`WorkspaceSourceConfig` menyimpan konfigurasi source/storage provider pada level Workspace.

Tujuannya agar konfigurasi provider tidak disimpan berulang di setiap Gallery.

Untuk phase awal, provider yang didukung cukup:

```text
GOOGLE_DRIVE
```

Namun model disiapkan agar nantinya dapat mendukung provider lain, misalnya:

```text
DROPBOX
ONEDRIVE
S3
CUSTOM_URL
```

Class:

```text
WorkspaceSourceConfig
- id
- workspaceId
- provider
- displayName
- configData
- isActive
- createdAt
- updatedAt
```

Catatan:

- `provider` menentukan jenis source/storage.
- `displayName` adalah nama konfigurasi yang mudah dikenali Owner.
- `configData` menyimpan konfigurasi provider-specific.
- Untuk MVP berbasis public/shared Google Drive link, konfigurasi ini dapat dibuat minimal.
- Dalam MVP, Owner menempelkan tautan folder Google Drive yang dibagikan sebagai “Anyone with the link”. Tidak ada OAuth Owner atau service account; API key Google Cloud milik aplikasi berada di server secret, bukan di `configData` maupun Gallery.
- Integrasi ini hanya membaca metadata folder/file publik. Aplikasi tidak membuat folder atau mengunggah file ke Google Drive.
- Jika integrasi privat ditambahkan kemudian, pengelolaan credential perlu dirancang khusus; jangan menyimpan secret mentah dalam `configData`.

Relationship:

```text
Workspace 1 ------ 0..* WorkspaceSourceConfig
```

Contoh:

```text
Workspace: Aster Wedding

WorkspaceSourceConfig:
- Google Drive Main
- Google Drive Archive
```

---


# 4. Service Structure

Service menggunakan struktur fleksibel dengan library/master item pada level Workspace:

```text
Workspace
   |
   +---- ServiceItemDefinition
   |
   +---- ServiceCategory
            |
            v
         Service
            |
            v
        ServiceItem
```

`ServiceItemDefinition` menjawab **item ini apa**, sedangkan `ServiceItem` menjawab **berapa value item tersebut pada service tertentu**.

## 4.1 ServiceCategory

Contoh:

- Wedding
- Prewedding
- Family
- Maternity
- Product Photography
- Commercial

```text
ServiceCategory
- id
- workspaceId
- name
- description
- isActive
```

Relationship:

```text
Workspace       1 ------ 0..* ServiceCategory
ServiceCategory 1 ------ 0..* Service
```

---

## 4.2 Service

Service adalah layanan photography yang dijual.

Contoh:

- Wedding Full Day
- Prewedding Basic
- Family Indoor
- Product Photography 20 Items

```text
Service
- id
- workspaceId
- categoryId
- name
- description
- basePrice
- currency
- isActive
```

`currency` hanya `IDR` pada MVP. Service adalah template; harga dan currency yang disepakati disalin ke Project saat dibuat.

---

## 4.3 ServiceItemDefinition

`ServiceItemDefinition` adalah master/library item yang reusable pada level Workspace.

Tujuannya agar item yang common dan repetitif tidak perlu didefinisikan ulang pada setiap Service.

Contoh item:

```text
Edited Photos
Printed Photos
Person
Duration
Outfit
Album
Makeup
```

Class:

```text
ServiceItemDefinition
- id
- workspaceId
- name
- valueType
- unit
- selectionRequired
- selectionType
- isActive
- sortOrder
```

Possible `valueType`:

```text
NUMBER
RANGE
```

MVP hanya menerima `NUMBER` dan `RANGE` untuk item paket. `BOOLEAN`, `TEXT`, atau struktur gabungan ditunda; ini tidak membatasi field input booking milik `ServiceFieldDefinition`. Jika `selectionRequired = true`, definition wajib `NUMBER` dengan nilai bilangan bulat non-negatif.

Contoh:

```text
Edited Photos
valueType          = NUMBER
unit               = photos
selectionRequired  = true
selectionType      = EDIT
```

```text
Printed Photos
valueType          = NUMBER
unit               = photos
selectionRequired  = true
selectionType      = PRINT
```

```text
Person
valueType          = RANGE
unit               = persons
selectionRequired  = false
```

Relationship:

```text
Workspace 1 ------ 0..* ServiceItemDefinition
```

Workspace dapat memiliki library seperti:

```text
Service Item Library
├── Number of Photos
├── Edited Photos
├── Printed Photos
├── Person
├── Duration
├── Outfit
├── Album
└── Makeup
```

Owner tetap dapat membuat custom definition.

---

## 4.4 ServiceItem

`ServiceItem` adalah penggunaan sebuah `ServiceItemDefinition` pada Service tertentu.

Class:

```text
ServiceItem
- id
- serviceId
- definitionId
- value
- sortOrder
```

Contoh:

```text
Service: Prewedding Basic

Edited Photos  -> definition EDITED_PHOTOS -> value = {"value":20}
Printed Photos -> definition PRINTED_PHOTOS -> value = {"value":5}
Person         -> definition PERSON         -> value = {"min":1,"max":2}
```

Service lain dapat menggunakan definition yang sama dengan value berbeda:

```text
Service: Prewedding Premium

Edited Photos  -> same definition -> value = {"value":40}
Printed Photos -> same definition -> value = {"value":10}
Person         -> same definition -> value = {"min":1,"max":4}
```

`value` disimpan sebagai JSONB terstruktur: `NUMBER` = `{ "value": nonNegativeDecimal }`; `RANGE` = `{ "min": nonNegativeDecimal, "max": nonNegativeDecimal }` dengan `min <= max`. Bentuk ini divalidasi saat tulis dan disalin ke `ProjectItem`.

Relationship:

```text
Service               1 ------ 0..* ServiceItem
ServiceItemDefinition 1 ------ 0..* ServiceItem
```

Dengan model ini:

```text
ServiceItemDefinition
= item ini APA

ServiceItem
= berapa VALUE item ini pada Service tersebut
```

---

# 4.5 ServiceFieldDefinition

`ServiceFieldDefinition` mendefinisikan field input tambahan yang diperlukan saat membuat booking/project untuk Service tertentu.

Konsep ini digunakan untuk data yang spesifik terhadap jenis layanan dan tidak cocok disimpan sebagai attribute tetap pada `Project`.

Contoh:

```text
Service: Graduation Photography

Booking fields:
- Campus Name
- Faculty
- Graduation Date
```

Class:

```text
ServiceFieldDefinition
- id
- serviceId
- name
- key
- fieldType
- isRequired
- options
- placeholder
- sortOrder
```

Possible `fieldType`:

```text
TEXT
NUMBER
DATE
BOOLEAN
SELECT
TEXTAREA
```

Contoh:

```text
name       = "Campus Name"
key        = "campus_name"
fieldType  = TEXT
isRequired = true
```

Relationship:

```text
Service 1 ------ 0..* ServiceFieldDefinition
```

`ServiceFieldDefinition` berbeda dari `ServiceItemDefinition`.

```text
ServiceItemDefinition
= mendefinisikan benefit / entitlement package

ServiceFieldDefinition
= mendefinisikan data yang perlu diinput saat booking
```

Contoh:

```text
ServiceItem:
Edited Photos = 20
Printed Photos = 5

Service Booking Fields:
Campus Name
Faculty
Graduation Date
```

---

# 4.6 ProjectFieldValue

`ProjectFieldValue` menyimpan value aktual dari `ServiceFieldDefinition` saat Project dibuat.

Class:

```text
ProjectFieldValue
- id
- projectId
- fieldDefinitionId (nullable; referensi asal)
- fieldName
- fieldKey
- fieldType
- value
```

`fieldName`, `fieldKey`, dan `fieldType` wajib menjadi snapshot agar perubahan atau pengarsipan definition tidak mengubah makna data Project lama. Satu Project hanya memiliki satu value untuk setiap `fieldKey` logis.

Contoh:

```text
Project:
Graduation Photo - Andi

ProjectFieldValue:
Campus Name     = Universitas Indonesia
Faculty         = Teknik
Graduation Date = 10 Oktober 2026
```

Relationship:

```text
Project                1 ------ 0..* ProjectFieldValue
ServiceFieldDefinition 0..1 ------ 0..* ProjectFieldValue
```

Flow:

```text
Service
  |
  +---- ServiceFieldDefinition
          |
          | create project
          v
Project
  |
  +---- ProjectFieldValue
```

---

# 5. Client

Client merupakan customer dari Workspace.

```text
Client
- id
- workspaceId
- name
- phone
- whatsappNumber
- email
- address
- notes
```

Relationship:

```text
Workspace 1 ------ 0..* Client
Client    1 ------ 0..* Project
```

---

# 6. Project

Project adalah pekerjaan photography untuk satu client.

```text
Project
- id
- workspaceId
- clientId
- serviceId
- clientAccessToken
- title
- eventDate
- location
- agreedPrice
- currency
- status
- completedAt (nullable)
- completedByUserId (nullable)
- notes
```

`clientAccessToken` adalah token acak berentropi tinggi yang dibuat sekali untuk Project. Link Gallery dan setiap Invoice terbit dalam Project yang sama menggunakannya; rotasi token memutus semua link lama. `currency` adalah snapshot currency Service (hanya IDR pada MVP). Setelah `DELIVERED`, Owner dapat menandai Project `COMPLETED` secara manual; simpan aktor/waktunya dan tampilkan peringatan saldo Invoice yang belum lunas tanpa memblokir tindakan.

Service menjadi template untuk pembuatan Project.

Harga atau benefit yang sudah disepakati client disimpan secara independen di Project agar perubahan Service di masa depan tidak mengubah project lama.

Contoh:

```text
Service:
Wedding Full Day
basePrice = Rp8.000.000

ServiceItem:
Edited Photos = 100

          ↓

Project:
Wedding Andi & Rina
agreedPrice = Rp7.500.000

ProjectItem:
Edited Photos = 120
```

---

# 7. ProjectItem

Ketika Service dipilih untuk membuat Project, ServiceItem dicopy menjadi ProjectItem.

```text
Service
   |
   +---- ServiceItem
   +---- ServiceItem

        ↓ copy

Project
   |
   +---- ProjectItem
   +---- ProjectItem
```

Tujuannya agar isi deal client tidak berubah jika Service template atau ServiceItemDefinition diubah.

`ProjectItem` menyimpan snapshot dari definition pada saat Project dibuat, termasuk `name`, `valueType`, `unit`, `selectionRequired`, dan `selectionType`.
`ServiceItem`/definition yang berubah kemudian tidak mengubah `ProjectItem`. Value snapshot menggunakan bentuk JSONB `NUMBER`/`RANGE` yang sama; `ProjectItem` adalah sumber deal historis, sedangkan `serviceId` tetap referensi template asal.

Class:

```text
ProjectItem
- id
- projectId
- sourceServiceItemId
- sourceDefinitionId
- name
- valueType
- value
- unit
- selectionRequired
- selectionType
- sortOrder
```

Contoh:

```text
SERVICE

Wedding Basic
- 300 Photos
- 50 Edited
- 10 Prints
- Rp8.000.000

          ↓ Create Project

PROJECT

Wedding Andi
- 300 Photos
- 60 Edited
- 10 Prints
- agreedPrice = Rp7.500.000
```

Relationship:

```text
Project 1 ------ 0..* ProjectItem
```

Secara kardinalitas penyimpanan, Project `DRAFT` bisa memiliki `0..*` item untuk sementara. Saat Project dibuat dari Service, snapshot seluruh item yang tersedia dilakukan atomik.

---

# 8. Session

Satu Project dapat terdiri dari beberapa sesi photography.

Contoh:

```text
Project: Prewedding Andi & Rina

Sessions:
├── Studio
├── Outdoor
└── Sunset
```

Class:

```text
Session
- id
- projectId
- name
- sessionDate
- startTime
- endTime
- location
- notes
- status
```

Relationship:

```text
Project 1 ------ 0..* Session
```

---

# 9. Team Member / Freelancer

Freelancer belum memiliki account dan akses sistem.

Freelancer disimpan sebagai resource internal.

```text
TeamMember
- id
- workspaceId
- name
- phone
- role
- defaultFee
- notes
```

Contoh role:

- Lead Photographer
- Second Shooter
- Assistant
- Editor

Relationship:

```text
Workspace 1 ------ 0..* TeamMember
```

---

# 10. ProjectAssignment

ProjectAssignment menghubungkan Project dengan TeamMember.

```text
ProjectAssignment
- id
- projectId
- teamMemberId
- role
- fee
- status
```

Relationship:

```text
Project    1 ------ 0..* ProjectAssignment
TeamMember 1 ------ 0..* ProjectAssignment
```

Dengan model ini:

- Project dapat dikerjakan Owner sendiri
- Project dapat memiliki satu freelancer
- Project dapat memiliki beberapa freelancer
- Fee dapat berbeda untuk setiap project

---

# 11. Gallery

Untuk MVP, **satu Project memiliki maksimal satu Gallery**.

Gallery adalah client-facing proofing area dan tidak menyimpan file foto secara langsung.

Konfigurasi provider/storage berada di level Workspace melalui `WorkspaceSourceConfig`.

Gallery yang telah dipublikasikan menggunakan satu atau lebih `GallerySource` yang menunjuk ke resource konkret seperti Google Drive folder/shared link. Gallery draft boleh belum memiliki source.

Client tidak menerima source link langsung dari aplikasi. Namun pada MVP folder Drive dibagikan “Anyone with the link”; siapa pun yang memperoleh tautan Drive langsung dapat melewati password Gallery. Owner perlu diberi peringatan ini.

Client menerima private link dari platform.

Contoh:

```text
photoapp.com/g/{projectClientAccessToken}
```

Class:

```text
Gallery
- id
- projectId
- title
- slug (optional; display-only)
- passwordHash
- passwordVersion
- status
- publishedAt (nullable)
- finalDeliveryPublishedAt (nullable)
- expiresAt (nullable)
```

Gallery tidak memiliki token akses terpisah: token milik Project. Password wajib pada MVP dan hanya hash yang disimpan. Owner boleh merotasi password; versi bertambah dan sesi Gallery yang diautentikasi dengan versi lama tidak berlaku lagi. `Gallery.status` mengikuti `DRAFT → PUBLISHED → EXPIRED/ARCHIVED`. Publikasi awal perlu password hash dan sedikitnya satu source aktif yang dapat diakses. Publikasi final delivery perlu minimal satu file `EDITED`/`PRINT` yang sudah tersinkron dan otomatis mengubah Project menjadi `DELIVERED`, tetapi bukan `COMPLETED`.

Relationship:

```text
Project 1 ------ 0..1 Gallery
```

## 11.1 GallerySource

`GallerySource` merepresentasikan folder/resource konkret yang digunakan oleh sebuah Gallery.

Class:

```text
GallerySource
- id
- galleryId
- workspaceSourceConfigId
- sourceUrl
- externalResourceId
- resourceKey (optional)
- isActive
- syncStatus
- lastSyncedAt (nullable)
- lastSyncError (nullable)
- createdAt
```

Relationship:

```text
Gallery               1 ------ 0..* GallerySource
WorkspaceSourceConfig 1 ------ 0..* GallerySource
```

Gallery draft boleh belum memiliki source; minimal satu source aktif yang dapat diakses wajib sebelum publish. Pada MVP, `sourceUrl` adalah folder root Google Drive yang ditempel Owner. Simpan folder ID dan resource key opsional untuk akses resource yang memerlukannya. Sinkronisasi harus idempotent berdasarkan `(gallerySourceId, externalFileId)` dan mencatat hasil/error. Aplikasi hanya membaca metadata folder dan file, tidak menulis ke Drive.

Dengan model ini, satu Gallery dapat mengambil foto dari beberapa source/resource.

Contoh phase awal:

```text
Gallery: Wedding Andi

GallerySources:
- Google Drive Folder A
- Google Drive Folder B
```

Di masa depan, model yang sama dapat mendukung:

```text
- Google Drive
- Dropbox
- OneDrive
- S3
```

tanpa perlu mengubah struktur utama Gallery.

---

# 12. Photo

Photo merupakan metadata / reference dari file eksternal di Google Drive.

```text
Photo
- id
- galleryId
- gallerySourceId
- sessionId
- externalFileId
- resourceKey (optional)
- fileName
- assetRole (PROOF | EDITED | PRINT)
- thumbnailMetadata (optional)
- isAvailable
- sortOrder
```

Foto gambar yang langsung berada di root folder adalah `PROOF`. File yang langsung berada di subfolder `edited` dan `print` adalah `EDITED` dan `PRINT`; nama subfolder tidak peka huruf besar/kecil. Subfolder lain dan nesting lebih dalam diabaikan pada MVP. Owner membuat subfolder dan mengunggah hasil akhir secara manual. Setiap file hasil akhir adalah row `Photo` dan download mandiri, tanpa relasi ke Photo `PROOF` asal. File final tersembunyi sampai final delivery dipublikasikan.

URL sumber/thumbnail/preview adalah metadata provider, bukan URL publik permanen untuk client. Aplikasi perlu mengendalikan akses media dan tidak membocorkan API key atau tautan folder Drive dalam respons client.

`sessionId` bersifat optional / nullable.

Dengan ini foto dapat diketahui berasal dari sesi tertentu.

Contoh:

```text
Project
├── Session: Studio
├── Session: Outdoor
├── Session: Sunset
└── Gallery
     ├── Photo -> Studio
     ├── Photo -> Studio
     ├── Photo -> Outdoor
     └── Photo -> Sunset
```

Relationship:

```text
Gallery       1 ------ 0..* Photo
GallerySource 1 ------ 0..* Photo
Session       0..1 ------ 0..* Photo
```

---

# 13. SelectionGroup & PhotoSelection

Selection tidak lagi menggunakan satu field `photoSelectionLimit` pada Project atau Gallery.

Alasannya karena satu Project dapat memiliki beberapa jenis selection, misalnya:

```text
Edited Photos = 20
Printed Photos = 5
Album Photos = 10
```

Masing-masing dapat memiliki limit yang berbeda dan dapat ditambah melalui Add-on.

## 13.1 SelectionGroup

`SelectionGroup` adalah entitlement / bucket selection yang ditampilkan ke client.

Contoh:

```text
Edited Photos
12 / 25 selected

Printed Photos
4 / 8 selected
```

Class:

```text
SelectionGroup
- id
- projectId
- sourceProjectItemId
- name
- selectionType
- baseLimit
- extraLimit
- unit
- status
- submittedAt (nullable)
- lockedAt (nullable)
- sortOrder
```

Catatan:

- `baseLimit` berasal dari `ProjectItem`.
- `extraLimit` adalah jumlah `quantity` seluruh `ProjectAddOn` berstatus `APPROVED` yang menargetkan group ini; pembaruannya transaksional saat approve/cancel.
- `effectiveLimit` **tidak disimpan**, tetapi dihitung sebagai `baseLimit + extraLimit`.
- Status group adalah `OPEN`, `SUBMITTED`, atau `LOCKED`; Client hanya dapat mengubah pilihan ketika `OPEN`. Submit satu kali dan tidak dapat dibuka kembali pada MVP. Owner dapat mengunci group setelah submit atau menutup group `OPEN` tanpa submission.
- `selectionType` dapat dipakai untuk kebutuhan UI atau behavior khusus seperti EDIT, PRINT, ALBUM, FRAME, dan lainnya.
- Secara domain, sistem tidak boleh bergantung hanya pada hardcoded type; `SelectionGroup` tetap merupakan sumber entitlement client.

Contoh:

```text
ProjectItem
Edited Photos = 20

ProjectAddOn
Extra Edited Photos = 5

SelectionGroup
Edited Photos
baseLimit      = 20
extraLimit     = 5
effectiveLimit = 25
```

## 13.2 PhotoSelection

`PhotoSelection` mencatat foto yang dipilih client pada sebuah SelectionGroup.

```text
PhotoSelection
- id
- selectionGroupId
- photoId
- quantity
- selectedAt
```

Status submit/lock hanya berada pada `SelectionGroup`, bukan tiap `PhotoSelection`. Satu pasangan `(selectionGroupId, photoId)` hanya memiliki satu row. Foto yang dipilih harus `PROOF` dari Gallery Project yang sama. Simpan dan validasi limit/quantity dalam transaksi agar dua permintaan bersamaan tidak melewati jatah.

`quantity` berguna untuk selection seperti Print.

Contoh:

```text
IMG_001.jpg
quantity = 2

IMG_005.jpg
quantity = 1
```

Total usage untuk print:

```text
2 + 1 = 3 prints
```

Untuk Edit, umumnya:

```text
usage = COUNT(PhotoSelection)
```

Untuk Print:

```text
usage = SUM(PhotoSelection.quantity)
```

Relationship:

```text
Project        1 ------ 0..* SelectionGroup
SelectionGroup 1 ------ 0..* PhotoSelection
Photo          1 ------ 0..* PhotoSelection
```

Secara implisit:

```text
SelectionGroup * ------ * Photo
             via PhotoSelection
```

Satu Photo dapat masuk ke lebih dari satu SelectionGroup.

Contoh:

```text
IMG_005.jpg
→ Edited Photos
→ Printed Photos
```

Client flow:

```text
Open Private Gallery
        ↓
Enter Password
        ↓
View Photos
        ↓
Choose Selection Group
        ↓
Select Photos
        ↓
Submit Selection
```

---

# 13A. ProjectAddOn

`ProjectAddOn` menyimpan tambahan yang dibeli client di luar entitlement awal Project.

Contoh:

- Extra Edited Photos
- Extra Printed Photos
- Extra Album Photos
- Extra Person
- Extra Hour
- Extra Session

Class:

```text
ProjectAddOn
- id
- projectId
- relatedProjectItemId (nullable)
- selectionGroupId (nullable)
- name
- quantity
- unit
- unitPrice
- totalAmount
- status
- createdAt
```

Possible status:

```text
DRAFT
APPROVED
CANCELLED
```

Contoh Extra Edit:

```text
ProjectItem
Edited Photos = 20

ProjectAddOn
Extra Edited Photos
quantity = 5
unitPrice = Rp50.000
totalAmount = Rp250.000
status = APPROVED
```

Effective entitlement:

```text
20 base + 5 extra = 25 Edited Photos
```

Contoh Extra Print:

```text
ProjectItem
Printed Photos = 5

ProjectAddOn
Extra Printed Photos
quantity = 3
unitPrice = Rp25.000
totalAmount = Rp75.000
status = APPROVED
```

Effective entitlement:

```text
5 base + 3 extra = 8 Printed Photos
```

`ProjectAddOn` berbeda dengan Discount:

```text
Add-on
→ menambah entitlement / service
→ biasanya menambah total invoice

Discount
→ mengurangi harga
→ tidak menambah entitlement
```

Relationship:

```text
Project        1 ------ 0..* ProjectAddOn
ProjectItem    0..1 ------ 0..* ProjectAddOn
SelectionGroup 0..1 ------ 0..* ProjectAddOn
```

Jika add-on berkaitan dengan photo selection, `selectionGroupId` wajib diisi dan add-on tersebut menambah `extraLimit` pada group itu. Target harus berasal dari Project yang sama; bila `relatedProjectItemId` juga diisi, nilainya harus cocok dengan `SelectionGroup.sourceProjectItemId`. Target dan quantity add-on yang sudah disetujui tidak diubah di tempat. Pembatalan ditolak bila limit baru lebih kecil dari pilihan yang sudah tersimpan; add-on yang sudah ditagih melalui Invoice terbit memerlukan penyesuaian tagihan eksplisit.

Flow:

```text
ProjectItem
    |
    +---- SelectionGroup
    |       baseLimit
    |
    +---- ProjectAddOn
            |
            └── menambah extraLimit SelectionGroup
```

Contoh UI client:

```text
Edited Photos
20 / 25 selected

Printed Photos
6 / 8 selected
```

Client tidak perlu melihat "Extra Edit" sebagai bucket terpisah kecuali UX memang menginginkannya.

---

# 14. Invoice

Invoice terhubung ke Project.

```text
Invoice
- id
- workspaceId
- projectId
- invoiceNumber
- issueDate
- dueDate
- currency
- subtotal
- discount
- total
- status
```

Possible status:

```text
DRAFT
UNPAID
PARTIALLY_PAID
PAID
CANCELLED
```

Relationship:

```text
Project 1 ------ 0..* Invoice
```

`invoiceNumber` unik dalam satu Workspace. Maksimal satu Invoice `DRAFT` per Project, tetapi Project dapat memiliki beberapa Invoice yang sudah diterbitkan. Link Invoice terbit menggunakan token Project dan ID Invoice, misalnya `/i/{projectClientAccessToken}/{invoiceId}`; draft/cancelled hanya untuk Owner. Penerbitan membutuhkan sedikitnya satu InvoiceItem.

MVP hanya mendukung satu nominal `discount` non-negatif per Invoice draft, maksimal sebesar `subtotal`; `total = subtotal - discount`. Item dan discount menjadi tetap setelah Invoice terbit. Discount tidak mengubah entitlement Project. Currency Invoice mengikuti Project (`IDR` saja untuk MVP); tidak ada pajak otomatis, kurs, atau invoice campuran mata uang. Status `UNPAID`, `PARTIALLY_PAID`, dan `PAID` dihitung dari total Payment yang belum di-void, bukan diedit manual.

---

# 15. InvoiceItem

Invoice terdiri dari beberapa item.

```text
InvoiceItem
- id
- invoiceId
- projectAddOnId (nullable)
- description
- quantity
- unitPrice
- amount
```

Relationship:

```text
Invoice 1 ------ 0..* InvoiceItem
```

Invoice draft boleh memiliki nol item sementara; penerbitan mensyaratkan minimal satu. Deskripsi, quantity, unit price, dan amount adalah snapshot yang tidak boleh diam-diam berubah sesudah terbit. `InvoiceItem` mewarisi currency Invoice.

---

# 16. Payment

Payment mencatat pembayaran client.

```text
Payment
- id
- invoiceId
- paymentDate
- amount
- paymentMethod
- referenceNumber
- notes
- voidedAt (nullable)
- voidedByUserId (nullable)
```

Relationship:

```text
Invoice 1 ------ 0..* Payment
```

Owner mencatat Payment manual dengan nilai positif, tanggal, metode, dan referensi/catatan opsional. Nilai di atas sisa tagihan ditolak. Catatan keliru boleh di-void dengan aktor/waktu audit; row tetap disimpan, tetapi tidak dihitung dalam saldo dan status Invoice. Gateway, bukti bayar, refund, dan overpayment tidak masuk MVP. Payment mewarisi currency Invoice.

Dengan ini sistem dapat mendukung:

```text
Unpaid
↓
DP Paid / Partially Paid
↓
Paid
```

---

# 17. High-Level Class Diagram

Diagram ringkas berikut menunjukkan kepemilikan/arah hubungan, bukan minimum child pada setiap status. Kardinalitas yang berlaku untuk data tersimpan ada di §18; aturan minimum saat publish/issue ada di class terkait.

```text
User / Owner
   |
   +---- Workspace
            |
            +---- MessageTemplate
            |
            +---- WorkspaceSourceConfig
            |        |
            |        +---- GallerySource
            |
            +---- ServiceItemDefinition
            |        |
            |        +---- ServiceItem
            |
            +---- ServiceCategory
            |        |
            |        +---- Service
            |               |
            |               +---- ServiceItem
            |               |
            |               +---- ServiceFieldDefinition
            |
            +---- Client
            |       |
            |       +---- Project
            |               |   (clientAccessToken; currency snapshot)
            |               |
            |               +---- ProjectItem
            |               |
            |               +---- ProjectFieldValue
            |               |
            |               +---- ProjectAddOn
            |               |
            |               +---- SelectionGroup
            |               |       |
            |               |       +---- PhotoSelection
            |               |               |
            |               |               +---- Photo
            |               |
            |               +---- Session
            |               |
            |               +---- Gallery
            |               |   (passwordHash; finalDeliveryPublishedAt)
            |               |       |
            |               |       +---- GallerySource
            |               |               |
            |               |               +---- Photo
            |               |
            |               +---- ProjectAssignment
            |               |       |
            |               |       +---- TeamMember
            |               |
            |               +---- Invoice
            |                       |
            |                       +---- InvoiceItem
            |                       |
            |                       +---- Payment
            |
            +---- TeamMember
```

---

# 18. Cardinality Summary

```text
User                   1 ------ 0..* Workspace

Workspace              1 ------ 0..* Client
Workspace              1 ------ 0..* ServiceCategory
Workspace              1 ------ 0..* ServiceItemDefinition
Workspace              1 ------ 0..* TeamMember
Workspace              1 ------ 0..* Project
Workspace              1 ------ 0..* WorkspaceSourceConfig
Workspace              1 ------ 0..* MessageTemplate

ServiceCategory        1 ------ 0..* Service
Service                1 ------ 0..* ServiceItem
Service                1 ------ 0..* ServiceFieldDefinition
ServiceItemDefinition  1 ------ 0..* ServiceItem

Client                 1 ------ 0..* Project
Service                1 ------ 0..* Project (source template)

Project                1 ------ 0..* ProjectItem
Project                1 ------ 0..* ProjectFieldValue
Project                1 ------ 0..* ProjectAddOn
Project                1 ------ 0..* SelectionGroup
Project                1 ------ 0..* Session
Project                1 ------ 0..1 Gallery

ServiceFieldDefinition 0..1 ------ 0..* ProjectFieldValue (source)
ProjectItem            0..1 ------ 0..* ProjectAddOn
ProjectItem            0..1 ------ 0..* SelectionGroup (source)
SelectionGroup         0..1 ------ 0..* ProjectAddOn (target)

Gallery                1 ------ 0..* GallerySource
WorkspaceSourceConfig  1 ------ 0..* GallerySource
Gallery                1 ------ 0..* Photo
GallerySource          1 ------ 0..* Photo
Session                0..1 ------ 0..* Photo

SelectionGroup         1 ------ 0..* PhotoSelection
Photo                  1 ------ 0..* PhotoSelection

Project                1 ------ 0..* ProjectAssignment
TeamMember             1 ------ 0..* ProjectAssignment

Project                1 ------ 0..* Invoice
Invoice                1 ------ 0..* InvoiceItem
Invoice                1 ------ 0..* Payment
```

Angka `0..*` mencakup tahap draft/onboarding dan layanan tanpa foto pilihan. Sebelum Gallery dipublikasikan wajib ada satu source aktif; sebelum Invoice diterbitkan wajib ada satu item. Semua relasi dalam satu Workspace harus divalidasi, termasuk relasi lintas Project seperti add-on, SelectionGroup, dan PhotoSelection.

---

# 19. Main Business Flow

## Authentication / Onboarding

```text
Register
  ↓
Verify Email
  ↓
Create First Workspace
  ↓
Configure Initial Workspace
  ↓
Enter Dashboard
```

## Returning User

```text
Login
  ↓
Select / Open Workspace
  ↓
Enter Dashboard
```


## Setup

```text
Owner
  ↓
Create Workspace
  ↓
Create Service Item Definitions
  ↓
Create Service Category
  ↓
Create Service
  ↓
Attach Service Items + Values
```

## Booking / Project

```text
Create Client
   ↓
Create Project
   ↓
Select Service
   ↓
Load ServiceFieldDefinition
   ↓
Fill Service-specific Booking Fields
   ↓
Save ProjectFieldValue
   ↓
Resolve ServiceItem + ServiceItemDefinition
   ↓
Copy Snapshot → ProjectItem
   ↓
Customize Deal
   ↓
Create Session(s)
   ↓
Assign Team Member if needed
```

## Photo Selection

```text
Shoot
  ↓
Owner menyiapkan folder root Google Drive "Anyone with the link"
  ↓
Owner menempelkan link, aplikasi memvalidasi lalu membuat GallerySource
  ↓
Sinkronkan file root sebagai Photo PROOF
  ↓
Buat SelectionGroup dari ProjectItem yang eligible
  ↓
Publish Gallery (password hash + source aktif wajib)
  ↓
Bagikan /g/{projectClientAccessToken}
  ↓
Client Enters Password
  ↓
System Loads PROOF + SelectionGroup(s)
  ↓
Client Selects Photos selama group OPEN
  ↓
Client Submits Selection sekali (group SUBMITTED)
  ↓
Owner edits / prints, lalu membuat folder edited dan/atau print di root Drive
  ↓
Owner mengunggah hasil, sinkronisasi metadata, lalu review
  ↓
Owner publish final delivery → Project DELIVERED
  ↓
Client download hasil mandiri melalui Gallery dan password yang sama
  ↓
Owner boleh mark Project COMPLETED secara manual
```

Folder `edited`/`print` dibuat dan diisi oleh Owner di Google Drive, bukan oleh aplikasi. File final tidak dipasangkan dengan ID Photo proof pada MVP. Project tidak otomatis `COMPLETED` saat pembayaran lunas maupun saat final delivery dipublikasikan.

## Add-on

```text
Client Requests Extra
   ↓
Create ProjectAddOn
   ↓
Approve Add-on
   ↓
Validasi selectionGroupId dan Project yang sama (jika selection-related)
   ↓
Increase SelectionGroup extraLimit dalam transaksi
   ↓
Tambah InvoiceItem ke satu-satunya draft Invoice Project (atau buat draft)
   ↓
Hitung ulang subtotal, discount, dan total
```

Example:

```text
Edited Photos
Base  = 20
Extra = 5
Total = 25
```

---

## Communication

```text
Project / Gallery / Invoice
   ↓
Select MessageTemplate
   ↓
Jika template memakai galleryPassword: Owner masukkan ulang password
   ↓
Resolve Dynamic Variables
   ↓
Generate Prefilled WhatsApp Message
   ↓
Open WhatsApp
   ↓
Owner Sends Manually
```

---

## Billing

```text
Project
  ↓
Create Invoice
  ↓
Invoice Item + optional nominal discount (draft only)
  ↓
Issue Invoice (item wajib ada; line dan discount menjadi tetap)
  ↓
Share /i/{projectClientAccessToken}/{invoiceId}
  ↓
Owner mencatat Payment manual, tidak boleh melebihi sisa tagihan
  ↓
Status UNPAID / PARTIALLY_PAID / PAID dihitung dari Payment non-void
```

Payment yang salah di-void dengan audit, bukan dihapus; status dihitung ulang. Invoice terbit dapat lebih dari satu per Project, tetapi Invoice draft maksimal satu pada satu waktu.

---

# 20. Current MVP Core Classes

Final list sementara:

```text
User
Workspace
WorkspaceSourceConfig
MessageTemplate

ServiceItemDefinition
ServiceCategory
Service
ServiceItem
ServiceFieldDefinition

Client

Project
ProjectItem
ProjectFieldValue
ProjectAddOn
SelectionGroup
Session

TeamMember
ProjectAssignment

Gallery
GallerySource
Photo
PhotoSelection

Invoice
InvoiceItem
Payment
```

---

# 21. Current Design Decisions

Keputusan yang sudah disepakati:

1. Sistem mendukung lebih dari satu brand melalui `Workspace`.
2. Satu Owner dapat memiliki banyak Workspace.
3. Freelancer belum memiliki login / akses sistem.
4. Freelancer direpresentasikan sebagai `TeamMember`.
5. Item service yang common/repetitif didefinisikan pada level Workspace melalui `ServiceItemDefinition`.
6. `ServiceItemDefinition` menyimpan master metadata seperti name, valueType, unit, selectionRequired, dan selectionType.
7. `ServiceItem` merepresentasikan penggunaan sebuah definition pada Service tertentu dan terutama menyimpan value per service.
8. Owner tetap dapat membuat custom ServiceItemDefinition pada Workspace.
9. Service dapat memiliki field booking dinamis melalui `ServiceFieldDefinition`.
10. `ServiceFieldDefinition` digunakan untuk data spesifik per service seperti Campus Name, Faculty, Graduation Date, Company Name, dan sejenisnya.
11. Value aktual dari field booking disimpan pada `ProjectFieldValue`.
12. `ProjectFieldValue` menyimpan snapshot metadata field agar perubahan definition tidak mengubah data project lama.
13. Service berfungsi sebagai template.
14. Saat Project dibuat, ServiceItem + ServiceItemDefinition dicopy menjadi snapshot `ProjectItem`.
15. ProjectItem menyimpan snapshot metadata agar perubahan template/definition di masa depan tidak mengubah deal lama.
16. Project dapat memiliki beberapa Session.
17. Project hanya memiliki maksimal satu Gallery untuk MVP.
18. Gallery tidak bergantung langsung pada satu provider tertentu.
19. Konfigurasi storage/source provider disimpan pada level Workspace melalui `WorkspaceSourceConfig`.
20. Phase awal hanya mengimplementasikan Google Drive.
21. Resource/folder konkret yang digunakan Gallery direpresentasikan oleh `GallerySource`.
22. Satu Gallery dapat memiliki beberapa GallerySource; Gallery draft boleh belum memiliki source, tetapi publish mensyaratkan sedikitnya satu source aktif yang dapat diakses.
23. Photo menyimpan `gallerySourceId` agar asal resource setiap foto tetap diketahui.
24. Client mengakses gallery melalui token Project berentropi tinggi + password Gallery; slug hanya tampilan opsional.
25. Client tidak wajib memiliki account pada MVP.
26. Photo dapat dikaitkan dengan Session secara optional.
27. Tidak ada satu field `photoSelectionLimit` global pada Project atau Gallery.
28. Selection entitlement direpresentasikan dengan `SelectionGroup`.
29. `SelectionGroup.baseLimit` berasal dari `ProjectItem`.
30. Extra entitlement direpresentasikan dengan `ProjectAddOn`.
31. Approved ProjectAddOn dapat menambah `SelectionGroup.extraLimit`.
32. Effective selection limit dihitung dari `baseLimit + extraLimit`, bukan kolom yang disimpan.
33. `PhotoSelection` terhubung ke `SelectionGroup`, bukan langsung ke ServiceItem.
34. Satu Photo dapat dipilih untuk lebih dari satu SelectionGroup, misalnya Edit dan Print.
35. `PhotoSelection.quantity` digunakan untuk kebutuhan seperti beberapa copy Print.
36. Add-on dan Discount adalah konsep berbeda: Add-on menambah entitlement/service, Discount hanya memengaruhi harga.
37. Invoice dan Payment terhubung ke Project, tetapi status pembayaran tidak otomatis mengubah status Project.
38. Komunikasi client pada MVP menggunakan WhatsApp dengan prefilled message, bukan direct API sending.
39. Template komunikasi reusable disimpan di level Workspace melalui `MessageTemplate`.
40. `MessageTemplate` menggunakan dynamic variables seperti clientName, projectTitle, galleryUrl, dan invoiceUrl.
41. Message history / delivery status belum disimpan pada MVP karena pengiriman final dilakukan manual oleh Owner di WhatsApp.
42. Integrasi WhatsApp Business API dapat ditambahkan pada phase berikutnya tanpa mengubah konsep MessageTemplate.


43. Authentication pada MVP hanya berlaku untuk internal `User` / Owner.
44. `Client` bukan authenticated user dan tidak perlu login pada MVP.
45. Flow onboarding awal adalah Register → Verify Email → Create First Workspace.
46. Satu User dapat memiliki beberapa Workspace pada MVP.
47. `WorkspaceMember` belum diperlukan pada MVP, tetapi dapat ditambahkan jika satu Workspace nantinya memiliki beberapa internal user.
48. Konsep `User` memakai satu tabel Better Auth `user`; credential/session dikelola Better Auth. Owner yang baru mendaftar boleh belum memiliki Workspace, sehingga kardinalitasnya `0..*`.
49. Seluruh data tenant dibatasi oleh `workspaceId`; relasi ke Client, Service, Project, dan entitas child tidak boleh menyeberang Workspace.
50. Satu Project memiliki satu `clientAccessToken` untuk Gallery dan semua Invoice terbitnya. Rotasi token membatalkan semua link lama Project itu; Invoice tetap diidentifikasi dengan ID Invoice.
51. Password Gallery hanya disimpan sebagai hash. Owner boleh merotasinya, menaikkan `passwordVersion`, membatalkan sesi Gallery lama, dan membagikan password baru. `{{galleryPassword}}` hanya dapat diisi setelah Owner memasukkan ulang password untuk diverifikasi.
52. Pada MVP, Owner memberikan tautan folder Google Drive “Anyone with the link”. API key aplikasi disimpan sebagai server secret dan hanya dipakai untuk membaca metadata publik; tidak ada OAuth Owner, pembuatan folder, atau upload oleh aplikasi. Tautan Drive langsung dapat melewati proteksi Gallery aplikasi.
53. Root folder Drive berisi Photo `PROOF`; subfolder `edited`/`print` yang dibuat dan diisi Owner menghasilkan Photo `EDITED`/`PRINT` yang mandiri. Subfolder lain/deep nesting diabaikan. Sinkronisasi metadata idempotent berdasarkan source dan external file ID.
54. Final delivery memakai Gallery link dan password yang sama. Owner meninjau hasil sync lalu mempublikasikan minimal satu file final, mencatat `finalDeliveryPublishedAt`, dan mengubah Project ke `DELIVERED`. Tidak ada pemetaan file final ke Photo proof pada MVP.
55. Project `COMPLETED` hanya melalui tindakan Owner setelah `DELIVERED`; catat aktor/waktu. Saldo Invoice belum lunas hanya memunculkan peringatan dan tidak memblokir completion.
56. `SelectionGroup` memegang status `OPEN`, `SUBMITTED`, `LOCKED`; `PhotoSelection` tidak memiliki status sendiri. Submit tidak bisa dibuka kembali pada MVP dan pilihan hanya dapat diubah selama `OPEN`.
57. `ProjectAddOn.selectionGroupId` wajib untuk perubahan entitlement selection. `extraLimit` adalah ringkasan transaksional dari add-on approved, sementara `effectiveLimit` dihitung. Pembatalan ditolak bila pilihan yang tersimpan akan melebihi limit baru; tagihan terbit perlu adjustment eksplisit.
58. Project dapat memiliki banyak Invoice terbit tetapi maksimal satu draft. Penerbitan membutuhkan item. Satu nominal discount opsional pada draft, `0 <= discount <= subtotal`, hanya mengurangi total Invoice dan menjadi tetap setelah terbit.
59. Payment dicatat Owner secara manual; amount positif tidak boleh melampaui sisa Invoice. Catatan keliru dapat di-void dengan audit. Status pembayaran berasal dari jumlah Payment non-void. Gateway, bukti bayar, refund, dan overpayment ditunda.
60. Mata uang MVP hanya IDR tanpa pajak otomatis. Kode currency tetap disimpan di Workspace, Service, Project snapshot, dan Invoice; Add-on/InvoiceItem/Payment mengikuti currency parent. Tidak ada campuran mata uang atau konversi kurs pada MVP.
61. Value item paket MVP hanya `NUMBER` dan `RANGE` berbentuk JSONB terstruktur. Contoh: 20 foto edit, 5 foto print, 1–2 orang. `selectionRequired` hanya pada NUMBER bilangan bulat. Tipe field booking dinamis tetap terpisah.
62. Detail teknis di blueprint menggunakan Next.js, Neon PostgreSQL, Better Auth, Cloudflare, dan Drizzle ORM; kelimanya bukan domain class.

---

## Status

Dokumen ini adalah **UML / Domain Model Draft yang sudah disinkronkan dengan blueprint MVP**. Keputusan 1–62 merupakan dasar domain saat ini; perluasan di masa depan tidak boleh diam-diam mengubah snapshot Project atau Invoice historis. Detail diagram formal dan implementasi berada pada `photographer_management_platform_blueprint.md`.
