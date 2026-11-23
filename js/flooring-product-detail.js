(function() {
    const SUPABASE_URL = 'https://apxelbabvviuwqpfivtr.supabase.co';
    const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweGVsYmFidnZpdXdxcGZpdnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NjEyOTYsImV4cCI6MjA5OTIzNzI5Nn0.EWt2FRAkJH86Is9P_uDjKDXnJ0O1J2qdg_BuctQavvY';

    const SITE_ORIGIN = 'https://www.centralhomeco.com';
    const VERIFIED_SPECS = window.CENTRAL_HOME_FLOORING_SPECS || {};
    const PRODUCT_DOCUMENTS = window.CENTRAL_HOME_FLOORING_DOCUMENTS || {};

    function h() { return { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` }; }
    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    function fallbackDetails(p) {
        const specs = [
            ['Type', SECTION_LABEL[p.category] || p.category],
            ['Collection', p.collection],
            ['Species', p.species],
            ['Grade', p.grade],
            ['SKU', p.sku],
            ['Dimension', p.dimension || p.size],
            ['Coverage', p.coverage],
        ].filter(function(row) { return row[1]; }).map(function(row) { return { label: row[0], value: row[1] }; });
        return {
            brand: '',
            type: SECTION_LABEL[p.category] || p.category,
            overview: p.description || '',
            features: [],
            specifications: specs,
            sourceUrl: '',
        };
    }
    function valueFor(details, labels) {
        const wanted = Array.isArray(labels) ? labels : [labels];
        const match = (details.specifications || []).find(function(spec) { return wanted.includes(spec.label); });
        return match && match.value;
    }
    function renderProductDetails(p, details) {
        const kicker = document.getElementById('product-kicker');
        if (kicker) kicker.textContent = [details.brand, details.type].filter(Boolean).join(' · ') || 'Flooring';

        const quickRows = p.category === 'hardwood'
            ? [
                ['Type', details.type],
                ['Species', valueFor(details, 'Species')],
                ['Thickness', valueFor(details, 'Thickness')],
                ['Coverage', valueFor(details, 'Coverage')],
            ]
            : [
                ['Type', details.type],
                ['Dimension', valueFor(details, 'Dimension')],
                ['Wear Layer', valueFor(details, 'Wear Layer Thickness')],
                ['Coverage', valueFor(details, 'Coverage')],
            ];
        const quick = document.getElementById('product-quick-specs');
        quick.innerHTML = quickRows.filter(function(row) { return row[1]; }).map(function(row) {
            return `<div class="fp-quick-spec"><dt>${escapeHtml(row[0])}</dt><dd>${escapeHtml(row[1])}</dd></div>`;
        }).join('');

        const descEl = document.getElementById('product-description');
        if (details.overview) {
            descEl.textContent = details.overview;
            descEl.style.display = 'block';
        } else {
            descEl.style.display = 'none';
        }

        const featureSection = document.getElementById('product-features-section');
        const featureGrid = document.getElementById('product-features');
        if (details.features && details.features.length) {
            featureGrid.innerHTML = details.features.map(function(feature) {
                return `<div class="fp-feature">${escapeHtml(feature)}</div>`;
            }).join('');
            featureSection.style.display = 'block';
        } else {
            featureSection.style.display = 'none';
        }

        const specsSection = document.getElementById('product-specifications-section');
        const specsGrid = document.getElementById('product-specifications');
        if (details.specifications && details.specifications.length) {
            specsGrid.innerHTML = details.specifications.map(function(spec) {
                return `<div class="fp-spec-row"><div class="fp-spec-label">${escapeHtml(spec.label)}</div><div class="fp-spec-value">${escapeHtml(spec.value)}</div></div>`;
            }).join('');
            specsSection.style.display = 'block';
        } else {
            specsSection.style.display = 'none';
        }

        const docs = PRODUCT_DOCUMENTS[p.category] || [];
        const documentsSection = document.getElementById('product-documents-section');
        const documentsGrid = document.getElementById('product-documents');
        if (docs && docs.length) {
            documentsGrid.innerHTML = docs.map(function(doc) {
                return `<a class="fp-doc-link" href="${escapeHtml(doc.url)}" target="_blank" rel="noopener"><span>${escapeHtml(doc.label)}</span><span aria-hidden="true">PDF ↗</span></a>`;
            }).join('');
            documentsSection.style.display = 'block';
        } else {
            documentsSection.style.display = 'none';
        }
        const source = document.getElementById('product-source');
        if (source && details.sourceUrl) {
            source.innerHTML = `Specifications verified against the manufacturer listing. <a href="${escapeHtml(details.sourceUrl)}" target="_blank" rel="noopener">View source ↗</a>`;
        } else if (source) {
            source.textContent = '';
        }
    }
    function addProductStructuredData(p, details) {
        const data = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: p.name,
            image: p.image_url || undefined,
            description: details.overview || undefined,
            sku: valueFor(details, 'SKU') || p.sku || undefined,
            brand: details.brand ? { '@type': 'Brand', name: details.brand } : undefined,
            url: `${SITE_ORIGIN}/flooring-product-detail.html?id=${encodeURIComponent(String(p.id).trim())}`,
            additionalProperty: (details.specifications || []).map(function(spec) {
                return { '@type': 'PropertyValue', name: spec.label, value: spec.value };
            }),
        };
        Object.keys(data).forEach(function(key) { if (data[key] === undefined) delete data[key]; });
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }
    function upsertMeta(name, content) {
        let el = document.querySelector('meta[name="' + name + '"]');
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute('name', name);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    }
    function upsertCanonical(href) {
        let el = document.querySelector('link[rel="canonical"]');
        if (!el) {
            el = document.createElement('link');
            el.setAttribute('rel', 'canonical');
            document.head.appendChild(el);
        }
        el.setAttribute('href', href);
    }
    function markNotIndexable() {
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.remove();
        upsertMeta('robots', 'noindex, follow');
    }

    const SECTION_LABEL = { hardwood: 'Engineered Hardwood Flooring', wpc: 'WPC Luxury Vinyl Plank', spc: 'LVP Luxury Vinyl Plank' };

    const params = new URLSearchParams(window.location.search);
    const id = (params.get('id') || '').trim();

    if (id) {
        upsertCanonical(`${SITE_ORIGIN}/flooring-product-detail.html?id=${encodeURIComponent(id)}`);
    }

    // Global content (phone, hours, footer)
    fetch(`${SUPABASE_URL}/rest/v1/site_content?page=eq.global&select=content_key,content_type,value`, { headers: h() })
        .then(function(res) { return res.json(); })
        .then(function(rows) {
            if (!Array.isArray(rows)) return;
            rows.forEach(function(row) {
                if (!row.value) return;
                document.querySelectorAll('[data-ck="' + row.content_key + '"]').forEach(function(el) {
                    el.textContent = row.value;
                });
            });
        });

    if (!id) {
        document.title = 'Flooring Product Not Found | Central Home';
        markNotIndexable();
        document.getElementById('detail-content').innerHTML = '<p style="padding:60px;text-align:center;color:#888">Product not found. <a href="flooring.html">Back to Flooring</a></p>';
        return;
    }

    fetch(`${SUPABASE_URL}/rest/v1/flooring_products?id=eq.${encodeURIComponent(id)}&select=*`, { headers: h() })
        .then(function(res) { return res.json(); })
        .then(function(rows) {
            const p = rows && rows[0];
            if (!p) {
                document.title = 'Flooring Product Not Found | Central Home';
                markNotIndexable();
                document.getElementById('detail-content').innerHTML = '<p style="padding:60px;text-align:center;color:#888">Product not found. <a href="flooring.html">Back to Flooring</a></p>';
                return;
            }

            document.title = `${p.name} | Central Home`;
            upsertCanonical(`${SITE_ORIGIN}/flooring-product-detail.html?id=${encodeURIComponent(String(p.id).trim())}`);
            document.querySelectorAll('[data-ck="page-title"]').forEach(function(el) { el.textContent = p.name; });
            document.querySelectorAll('[data-ck="breadcrumb-name"]').forEach(function(el) { el.textContent = p.name; });
            const details = VERIFIED_SPECS[p.id] || fallbackDetails(p);
            if (details.overview) upsertMeta('description', details.overview);

            const img = document.querySelector('[data-ck="product-image"]');
            if (img && p.image_url) {
                img.src = p.image_url;
                img.alt = `${p.name} flooring`;
            }
            const cornerBadge = document.getElementById('product-corner-badge');
            if (cornerBadge && p.corner_image_url) {
                cornerBadge.src = p.corner_image_url;
                cornerBadge.className = 'fp-corner-badge ' + (p.corner_position === 'top-right' ? 'top-right' : 'top-left');
                cornerBadge.style.display = 'block';
            }

            renderProductDetails(p, details);
            addProductStructuredData(p, details);

            const inquiryLink = document.getElementById('product-inquiry-link');
            if (inquiryLink) {
                inquiryLink.href = 'contact.html?category=flooring&product=' + encodeURIComponent(p.name);
            }
        })
        .catch(function(err) { console.error('Flooring product load error:', err); });
})();
