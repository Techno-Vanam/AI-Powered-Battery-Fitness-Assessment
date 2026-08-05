import { getDatabase } from '../database';
import { v4 as uuidv4 } from 'uuid';

export interface Athlete {
  id: string;
  name: string;
  gender: string;
  dateOfBirth: string | null;
  phone: string | null;
  heightCategory: string | null;
  coachName: string | null;
  schoolAcademy: string | null;
  state: string | null;
  district: string | null;
  createdAt: number;
  updatedAt: number;
}

export type AthleteInput = {
  id?: string;
  name: string;
  gender: string;
  dateOfBirth?: string | null;
  phone?: string | null;
  heightCategory?: string | null;
  coachName?: string | null;
  schoolAcademy?: string | null;
  state?: string | null;
  district?: string | null;
};

function rowToAthlete(row: any): Athlete {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    dateOfBirth: row.dateOfBirth ?? null,
    phone: row.phone ?? null,
    heightCategory: row.heightCategory ?? null,
    coachName: row.coachName ?? null,
    schoolAcademy: row.schoolAcademy ?? null,
    state: row.state ?? null,
    district: row.district ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const AthleteRepository = {
  async existsById(id: string): Promise<boolean> {
    const db = getDatabase();
    const [res] = await db.executeSql('SELECT 1 FROM athletes WHERE id = ?;', [id]);
    return res.rows.length > 0;
  },

  async insert(input: AthleteInput): Promise<Athlete> {
    const db = getDatabase();
    const now = Date.now();
    const id = input.id && input.id.trim().length > 0 ? input.id.trim() : uuidv4();
    
    await db.executeSql(
      `INSERT INTO athletes 
         (id, name, gender, dateOfBirth, phone, heightCategory, coachName, schoolAcademy, state, district, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        input.name,
        input.gender,
        input.dateOfBirth ?? null,
        input.phone ?? null,
        input.heightCategory ?? null,
        input.coachName ?? null,
        input.schoolAcademy ?? null,
        input.state ?? null,
        input.district ?? null,
        now,
        now,
      ],
    );
    return {
      id,
      name: input.name,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth ?? null,
      phone: input.phone ?? null,
      heightCategory: input.heightCategory ?? null,
      coachName: input.coachName ?? null,
      schoolAcademy: input.schoolAcademy ?? null,
      state: input.state ?? null,
      district: input.district ?? null,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(id: string, input: Omit<AthleteInput, 'id'>): Promise<Athlete> {
    const db = getDatabase();
    const now = Date.now();
    await db.executeSql(
      `UPDATE athletes SET
         name = ?,
         gender = ?,
         dateOfBirth = ?,
         phone = ?,
         heightCategory = ?,
         coachName = ?,
         schoolAcademy = ?,
         state = ?,
         district = ?,
         updatedAt = ?
       WHERE id = ?;`,
      [
        input.name,
        input.gender,
        input.dateOfBirth ?? null,
        input.phone ?? null,
        input.heightCategory ?? null,
        input.coachName ?? null,
        input.schoolAcademy ?? null,
        input.state ?? null,
        input.district ?? null,
        now,
        id,
      ],
    );
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Athlete with ID ${id} not found`);
    return existing;
  },

  async upsert(input: AthleteInput): Promise<Athlete> {
    const id = input.id ?? uuidv4();
    const exists = await this.existsById(id);
    if (exists) {
      return this.update(id, input);
    } else {
      return this.insert({ ...input, id });
    }
  },

  async findById(id: string): Promise<Athlete | null> {
    const db = getDatabase();
    const [res] = await db.executeSql('SELECT * FROM athletes WHERE id = ?;', [id]);
    if (res.rows.length === 0) return null;
    return rowToAthlete(res.rows.item(0));
  },

  async findByNameOrId(query: string): Promise<Athlete[]> {
    const db = getDatabase();
    const q = `%${query.trim()}%`;
    const [res] = await db.executeSql(
      `SELECT * FROM athletes 
       WHERE name LIKE ? OR id LIKE ? OR schoolAcademy LIKE ? OR coachName LIKE ?
       ORDER BY name ASC;`,
      [q, q, q, q],
    );
    const athletes: Athlete[] = [];
    for (let i = 0; i < res.rows.length; i++) {
      athletes.push(rowToAthlete(res.rows.item(i)));
    }
    return athletes;
  },

  async getAll(): Promise<Athlete[]> {
    const db = getDatabase();
    const [res] = await db.executeSql('SELECT * FROM athletes ORDER BY createdAt DESC;');
    const athletes: Athlete[] = [];
    for (let i = 0; i < res.rows.length; i++) {
      athletes.push(rowToAthlete(res.rows.item(i)));
    }
    return athletes;
  },

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.executeSql('DELETE FROM athletes WHERE id = ?;', [id]);
  },
};
