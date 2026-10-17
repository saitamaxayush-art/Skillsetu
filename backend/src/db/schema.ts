import { db } from './connection.js'

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'candidate',
      language TEXT DEFAULT 'hi',
      age_range TEXT DEFAULT '25-35',
      gender TEXT,
      village_town TEXT DEFAULT 'Hadapsar',
      district TEXT DEFAULT 'Pune',
      state TEXT DEFAULT 'Maharashtra',
      pincode TEXT DEFAULT '411028',
      nearest_city TEXT DEFAULT 'Pune',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS access_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      mobility_limits TEXT DEFAULT 'none',
      can_travel_km INTEGER DEFAULT 15,
      travel_mode TEXT DEFAULT 'bus',
      wfh_only INTEGER DEFAULT 0,
      available_hours INTEGER DEFAULT 8,
      available_days TEXT DEFAULT 'Mon-Sat',
      childcare_limits INTEGER DEFAULT 0,
      has_smartphone INTEGER DEFAULT 1,
      internet_quality TEXT DEFAULT 'good',
      literacy_level TEXT DEFAULT 'basic',
      languages_spoken TEXT DEFAULT 'hi,mr,en',
      education_level TEXT DEFAULT '10th Pass',
      certifications TEXT DEFAULT '',
      max_commute INTEGER DEFAULT 45,
      min_pay INTEGER DEFAULT 12000,
      max_hours INTEGER DEFAULT 48,
      last_bus INTEGER DEFAULT 1080,
      home_by INTEGER DEFAULT 1110,
      wheelchair INTEGER DEFAULT 0,
      screen_reader INTEGER DEFAULT 0,
      remote INTEGER DEFAULT 0,
      neuro INTEGER DEFAULT 0,
      language INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      skill_id TEXT NOT NULL,
      years_exp REAL DEFAULT 1,
      how_learned TEXT DEFAULT 'self',
      what_made TEXT DEFAULT '',
      work_style TEXT DEFAULT 'alone',
      tools_owned TEXT DEFAULT '',
      monthly_income INTEGER DEFAULT 0,
      next_goal TEXT DEFAULT 'earn_more',
      level TEXT DEFAULT 'Beginner',
      quiz_score INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, skill_id)
    );

    CREATE TABLE IF NOT EXISTS skill_questions (
      id TEXT PRIMARY KEY,
      skill_id TEXT NOT NULL,
      question_en TEXT NOT NULL,
      question_hi TEXT NOT NULL,
      options_en_json TEXT NOT NULL,
      options_hi_json TEXT NOT NULL,
      correct_answer_index INTEGER NOT NULL,
      level TEXT NOT NULL,
      scenario_en TEXT,
      scenario_hi TEXT
    );

    CREATE TABLE IF NOT EXISTS user_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_role TEXT NOT NULL,
      goal_type TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_hi TEXT NOT NULL,
      org TEXT NOT NULL,
      kind TEXT NOT NULL,
      skill TEXT NOT NULL,
      area_en TEXT NOT NULL,
      area_hi TEXT NOT NULL,
      pay INTEGER NOT NULL,
      hours INTEGER NOT NULL,
      mins INTEGER NOT NULL,
      cost INTEGER NOT NULL,
      work_from_home INTEGER DEFAULT 0,
      physical_demand TEXT DEFAULT 'low',
      contact_phone TEXT NOT NULL,
      contact_whatsapp TEXT NOT NULL,
      contact_email TEXT,
      posting_en TEXT NOT NULL,
      posting_hi TEXT NOT NULL,
      req_skills_json TEXT NOT NULL,
      req_level TEXT DEFAULT 'Beginner',
      lat REAL,
      lng REAL,
      access_json TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'applied',
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      UNIQUE(user_id, opportunity_id)
    );

    CREATE TABLE IF NOT EXISTS learning_resources (
      id TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_hi TEXT NOT NULL,
      provider_en TEXT NOT NULL,
      provider_hi TEXT NOT NULL,
      type TEXT NOT NULL,
      mode TEXT NOT NULL,
      cost INTEGER NOT NULL DEFAULT 0,
      duration_en TEXT NOT NULL,
      duration_hi TEXT NOT NULL,
      level TEXT NOT NULL,
      skill TEXT NOT NULL,
      language TEXT DEFAULT 'Hindi / English',
      link TEXT,
      address_en TEXT,
      address_hi TEXT,
      distance_km REAL DEFAULT 0,
      badge_en TEXT DEFAULT 'Free',
      badge_hi TEXT DEFAULT 'निःशुल्क'
    );

    CREATE TABLE IF NOT EXISTS career_roadmaps (
      id TEXT PRIMARY KEY,
      target_role TEXT UNIQUE NOT NULL,
      title_en TEXT NOT NULL,
      title_hi TEXT NOT NULL,
      stages_json TEXT NOT NULL,
      adjacent_roles_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_career_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_role TEXT NOT NULL,
      completed_steps_json TEXT DEFAULT '[]',
      current_stage INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, target_role)
    );

    CREATE TABLE IF NOT EXISTS community_supply_demand (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      area TEXT NOT NULL,
      skill TEXT NOT NULL,
      supply INTEGER NOT NULL,
      demand INTEGER NOT NULL,
      UNIQUE(area, skill)
    );

    CREATE TABLE IF NOT EXISTS commute_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_area TEXT NOT NULL,
      to_area TEXT NOT NULL,
      departure_min INTEGER DEFAULT 0,
      mins INTEGER NOT NULL,
      cost INTEGER NOT NULL,
      last_bus_min INTEGER,
      provider TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(from_area, to_area, departure_min)
    );

    CREATE TABLE IF NOT EXISTS sms_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      step TEXT NOT NULL DEFAULT 'INIT',
      language TEXT DEFAULT 'hi',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS work_verifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      trade TEXT NOT NULL,
      experience_years REAL DEFAULT 1,
      description TEXT NOT NULL,
      tools_used TEXT DEFAULT '',
      video_url TEXT,
      video_name TEXT,
      video_duration TEXT DEFAULT '01:30',
      verification_score INTEGER DEFAULT 88,
      status TEXT DEFAULT 'verified',
      certificate_id TEXT UNIQUE NOT NULL,
      checks_json TEXT DEFAULT '[]',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

export default initializeDatabase
