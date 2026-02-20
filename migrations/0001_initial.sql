-- =============================================
-- Doğum Kliniği Kriz & Operasyon Yönetimi MVP
-- D1 Database - Initial Migration
-- =============================================

-- Klinikler (Multi-tenant)
CREATE TABLE IF NOT EXISTS clinics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Kullanıcılar
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'nurse' CHECK(role IN ('admin','doctor','nurse','secretary','superadmin')),
  phone TEXT,
  department TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

-- Kriz Kodları Tanımları
CREATE TABLE IF NOT EXISTS crisis_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#EF4444',
  description TEXT,
  target_roles TEXT DEFAULT 'doctor,nurse',
  severity INTEGER DEFAULT 3 CHECK(severity BETWEEN 1 AND 5),
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

-- Tetiklenen Kriz Alarmları
CREATE TABLE IF NOT EXISTS crisis_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  crisis_code_id INTEGER NOT NULL,
  triggered_by INTEGER NOT NULL,
  patient_id INTEGER,
  location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active','acknowledged','resolved','cancelled')),
  resolved_at TEXT,
  resolved_by INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  FOREIGN KEY (crisis_code_id) REFERENCES crisis_codes(id),
  FOREIGN KEY (triggered_by) REFERENCES users(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Alarm Onaylama Kayıtları
CREATE TABLE IF NOT EXISTS crisis_acknowledgments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alert_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  acknowledged_at TEXT DEFAULT (datetime('now')),
  notes TEXT,
  FOREIGN KEY (alert_id) REFERENCES crisis_alerts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Ameliyathane Odaları
CREATE TABLE IF NOT EXISTS operating_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  room_type TEXT DEFAULT 'general' CHECK(room_type IN ('general','csection','emergency','labor')),
  capacity INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

-- Operasyonlar / Ameliyatlar
CREATE TABLE IF NOT EXISTS operations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  room_id INTEGER NOT NULL,
  patient_id INTEGER,
  doctor_id INTEGER NOT NULL,
  anesthetist_id INTEGER,
  operation_type TEXT NOT NULL,
  description TEXT,
  scheduled_start TEXT NOT NULL,
  scheduled_end TEXT NOT NULL,
  actual_start TEXT,
  actual_end TEXT,
  status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled','in_progress','completed','cancelled','postponed')),
  priority TEXT DEFAULT 'normal' CHECK(priority IN ('low','normal','high','emergency')),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  FOREIGN KEY (room_id) REFERENCES operating_rooms(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES users(id),
  FOREIGN KEY (anesthetist_id) REFERENCES users(id)
);

-- Hastalar
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  tc_no TEXT,
  name TEXT NOT NULL,
  birth_date TEXT,
  phone TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  blood_type TEXT,
  gestational_week INTEGER,
  risk_level TEXT DEFAULT 'low' CHECK(risk_level IN ('low','medium','high','critical')),
  status TEXT DEFAULT 'admitted' CHECK(status IN ('admitted','in_labor','in_surgery','postpartum','discharged')),
  admission_date TEXT DEFAULT (datetime('now')),
  discharge_date TEXT,
  room_number TEXT,
  bed_number TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

-- Hasta Süreç Adımları
CREATE TABLE IF NOT EXISTS patient_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('admission','examination','lab_result','ultrasound','medication','surgery_prep','surgery','postop','discharge','note')),
  title TEXT NOT NULL,
  description TEXT,
  created_by INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Denetim İzleri (KVKK)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  details TEXT,
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- SEED DATA - Demo Klinik ve Kullanıcılar
-- =============================================

-- Demo Klinik
INSERT INTO clinics (name, address, phone, email) VALUES
('Örnek Doğum Kliniği', 'Atatürk Cad. No:42, Muğla', '0252 214 00 00', 'info@ornekdogum.com');

-- Demo Kullanıcılar (şifre: admin123 -> bcrypt hash)
INSERT INTO users (clinic_id, name, email, password_hash, role, department, phone) VALUES
(1, 'Dr. Ayşe Yılmaz', 'admin@klinik.com', '$2a$10$8K1p/a5bV8fG0Yd8G1eWQOZS8rGH5bYTHW3CkP9N7.JCkjYdq5Gy2', 'admin', 'Yönetim', '0532 100 0001'),
(1, 'Dr. Mehmet Kaya', 'doktor@klinik.com', '$2a$10$8K1p/a5bV8fG0Yd8G1eWQOZS8rGH5bYTHW3CkP9N7.JCkjYdq5Gy2', 'doctor', 'Kadın Doğum', '0532 100 0002'),
(1, 'Hemşire Fatma Demir', 'hemsire@klinik.com', '$2a$10$8K1p/a5bV8fG0Yd8G1eWQOZS8rGH5bYTHW3CkP9N7.JCkjYdq5Gy2', 'nurse', 'Doğumhane', '0532 100 0003'),
(1, 'Sekreter Zeynep Ak', 'sekreter@klinik.com', '$2a$10$8K1p/a5bV8fG0Yd8G1eWQOZS8rGH5bYTHW3CkP9N7.JCkjYdq5Gy2', 'secretary', 'Resepsiyon', '0532 100 0004');

-- Kriz Kodları
INSERT INTO crisis_codes (clinic_id, code, name, color, description, target_roles, severity) VALUES
(1, 'CODE_BLUE', 'Kod Mavi - Kardiyak Arrest', '#3B82F6', 'Kardiyak veya solunumsal arrest durumu', 'doctor,nurse', 5),
(1, 'CODE_PINK', 'Kod Pembe - Yenidoğan Acil', '#EC4899', 'Yenidoğan bebek acil durumu', 'doctor,nurse', 5),
(1, 'CODE_RED', 'Kod Kırmızı - Acil Sezaryen', '#EF4444', 'Acil sezaryen ameliyatı gereksinimi', 'doctor,nurse', 5),
(1, 'CODE_ORANGE', 'Kod Turuncu - PPH (Postpartum Kanama)', '#F97316', 'Doğum sonrası aşırı kanama', 'doctor,nurse', 4),
(1, 'CODE_YELLOW', 'Kod Sarı - Preeklampsi', '#EAB308', 'Ağır preeklampsi veya eklampsi', 'doctor,nurse', 4),
(1, 'CODE_GREEN', 'Kod Yeşil - Tahliye', '#22C55E', 'Acil tahliye gerekliliği (yangın, deprem vb.)', 'doctor,nurse,secretary', 3);

-- Ameliyathane Odaları
INSERT INTO operating_rooms (clinic_id, name, room_type) VALUES
(1, 'Ameliyathane 1 - Ana Salon', 'csection'),
(1, 'Ameliyathane 2 - Acil', 'emergency'),
(1, 'Doğumhane 1', 'labor'),
(1, 'Doğumhane 2', 'labor');

-- Demo Hastalar
INSERT INTO patients (clinic_id, name, tc_no, birth_date, phone, blood_type, gestational_week, risk_level, status, room_number, bed_number, emergency_contact, emergency_phone, notes) VALUES
(1, 'Elif Sarı', '12345678901', '1992-05-15', '0532 200 0001', 'A Rh+', 38, 'low', 'admitted', '201', 'A', 'Ahmet Sarı', '0532 200 0002', 'Normal gebelik takibi'),
(1, 'Merve Çelik', '23456789012', '1988-11-22', '0532 200 0003', 'B Rh+', 36, 'high', 'in_labor', '202', 'B', 'Can Çelik', '0532 200 0004', 'Gestasyonel diyabet mevcut'),
(1, 'Ayça Koç', '34567890123', '1995-03-08', '0532 200 0005', '0 Rh-', 40, 'medium', 'in_surgery', '203', 'A', 'Burak Koç', '0532 200 0006', 'Planlı sezaryen - çoğul gebelik'),
(1, 'Deniz Aydın', '45678901234', '1990-07-30', '0532 200 0007', 'AB Rh+', 39, 'low', 'postpartum', '204', 'B', 'Emre Aydın', '0532 200 0008', 'Normal doğum gerçekleşti');

-- Demo Operasyonlar
INSERT INTO operations (clinic_id, room_id, patient_id, doctor_id, operation_type, description, scheduled_start, scheduled_end, status, priority) VALUES
(1, 1, 3, 2, 'Sezaryen', 'Planlı sezaryen - çoğul gebelik', datetime('now', '+2 hours'), datetime('now', '+3 hours'), 'scheduled', 'high'),
(1, 3, 2, 2, 'Normal Doğum Takibi', 'Aktif travay takibi', datetime('now', '-1 hours'), datetime('now', '+1 hours'), 'in_progress', 'normal');
