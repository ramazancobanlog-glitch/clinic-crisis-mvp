// D1 Database Helper
// Cloudflare Workers'da process.env.DB olarak binding gelir
// Development'da mock/local D1 kullanılır

export function getDB(context) {
    // Cloudflare Pages'de env binding
    if (context?.env?.DB) {
        return context.env.DB;
    }
    // Next.js local development - process.env üzerinden
    if (process.env.DB) {
        return process.env.DB;
    }
    return null;
}

export async function query(db, sql, params = []) {
    if (!db) {
        throw new Error('Database connection not available');
    }
    const result = await db.prepare(sql).bind(...params).all();
    return result.results || [];
}

export async function queryOne(db, sql, params = []) {
    if (!db) {
        throw new Error('Database connection not available');
    }
    const result = await db.prepare(sql).bind(...params).first();
    return result;
}

export async function execute(db, sql, params = []) {
    if (!db) {
        throw new Error('Database connection not available');
    }
    return await db.prepare(sql).bind(...params).run();
}

export async function auditLog(db, { clinicId, userId, action, entityType, entityId, details, ipAddress }) {
    return execute(db,
        `INSERT INTO audit_logs (clinic_id, user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [clinicId, userId, action, entityType, entityId, details || null, ipAddress || null]
    );
}
