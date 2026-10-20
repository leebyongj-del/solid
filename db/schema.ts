import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const classrooms = sqliteTable('classrooms',{code:text('code').primaryKey(),title:text('title').notNull(),teacherHash:text('teacher_hash').notNull(),phase:integer('phase').notNull().default(0),created:text('created').notNull(),analysisCount:integer('analysis_count').notNull().default(0)});
export const discoveries = sqliteTable('discoveries',{id:text('id').primaryKey(),code:text('code').notNull(),participantId:text('participant_id'),group:text('group_name').notNull(),title:text('title').notNull(),guess:text('guess').notNull(),reason:text('reason').notNull(),model:text('model').notNull(),reflection:text('reflection').notNull().default(''),status:text('status').notNull().default('탐구 중'),editHash:text('edit_hash').notNull(),photoKey:text('photo_key').notNull(),created:text('created').notNull()});

export const participants = sqliteTable('participants',{id:text('id').primaryKey(),code:text('code').notNull(),groupName:text('group_name').notNull(),tokenHash:text('token_hash').notNull(),created:text('created').notNull()});

export const teacherLoginAttempts = sqliteTable('teacher_login_attempts',{key:text('key').primaryKey(),failures:integer('failures').notNull().default(0),started:integer('started').notNull()});
