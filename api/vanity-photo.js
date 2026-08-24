const SUPABASE_URL = 'https://apxelbabvviuwqpfivtr.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VANITY_SLUG_PREFIX = 'bathroom-vanity-';

async function verifyUser(token) {
    if (!token) return false;
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${token}` }
    });
    return userRes.ok;
}

function cleanRow(row = {}) {
    const slug = String(row.slug || '').trim();
    if (!slug.startsWith(VANITY_SLUG_PREFIX)) {
        throw new Error('Invalid vanity photo slug');
    }
    return {
        slug,
        label: row.label || null,
        image_url: row.image_url || null,
        sort_order: Number(row.sort_order) || 0
    };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Server is missing Supabase service configuration' });

    const { action, id, row, token } = req.body || {};
    const signedIn = await verifyUser(token);
    if (!signedIn) return res.status(401).json({ error: 'Please sign in again' });

    try {
        if (action === 'delete') {
            if (!id) return res.status(400).json({ error: 'Missing photo id' });
            const deleteRes = await fetch(`${SUPABASE_URL}/rest/v1/outdoor_images?id=eq.${encodeURIComponent(id)}&slug=like.${VANITY_SLUG_PREFIX}*`, {
                method: 'DELETE',
                headers: {
                    'apikey': SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                    'Prefer': 'return=minimal'
                }
            });
            if (!deleteRes.ok) {
                const err = await deleteRes.json().catch(() => ({}));
                return res.status(deleteRes.status).json({ error: err.message || 'Photo could not be removed' });
            }
            return res.status(200).json({ ok: true });
        }

        if (action !== 'save') return res.status(400).json({ error: 'Unknown action' });

        const payload = cleanRow(row);
        const isInsert = !id || String(id).startsWith('__default_');
        const saveRes = await fetch(isInsert
            ? `${SUPABASE_URL}/rest/v1/outdoor_images`
            : `${SUPABASE_URL}/rest/v1/outdoor_images?id=eq.${encodeURIComponent(id)}&slug=like.${VANITY_SLUG_PREFIX}*`, {
            method: isInsert ? 'POST' : 'PATCH',
            headers: {
                'apikey': SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });

        if (!saveRes.ok) {
            const err = await saveRes.json().catch(() => ({}));
            return res.status(saveRes.status).json({ error: err.message || 'Photo could not be saved' });
        }
        return res.status(200).json({ ok: true });
    } catch (err) {
        return res.status(400).json({ error: err.message || 'Vanity photo request failed' });
    }
}
