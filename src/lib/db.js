// D1 Database Helper
// Cloudflare Workers'da process.env.DB olarak binding gelir
// Development'da mock/local D1 kullanılır

export async function getDB() {
    try {
        // Cloudflare Pages Environment (getRequestContext is only available in Edge/Workers)
        const { getRequestContext } = await import('@cloudflare/next-on-pages');
        const context = getRequestContext();
        if (context?.env?.DB) {
            return context.env.DB;
        }
    } catch (e) {
        // Fallback for non-cloudflare environments (local dev)
        if (process.env.DB) {
            return process.env.DB;
        }
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
