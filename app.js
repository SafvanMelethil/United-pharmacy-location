// GTIN Search App - Updated
(() => {
  let dataset = [];
  const $ = id => document.getElementById(id);

  function setStatus(msg, isError = false) {
    const s = $('status');
    if (s) {
      s.innerText = msg;
      s.style.color = isError ? 'crimson' : '';
    }
    console.log('[STATUS]', msg);
  }

  const clean = x => String(x || '').trim();

  // ✅ Robust GTIN extraction for mixed-content barcodes
  function extractGTIN(barcode) {
    if (!barcode) return '';
    const stripped = barcode.replace(/\s+/g, '');
    let match = stripped.match(/01(\d{13,14})/); // GS1 standard
    let gtin = match ? match[1] : (stripped.match(/(\d{13,14})/)?.[1] || stripped);
    // Remove leading zeros to match your JSON
    return gtin.replace(/^0+/, '');
  }

  function renderQuickView(matches) {
    const card = $('quickViewCard');
    const container = $('quickView');
    if (!matches.length) { card.classList.add('d-none'); container.innerHTML = ''; return; }
    card.classList.remove('d-none');
    container.innerHTML = `
      <table class="table table-sm table-bordered mb-0">
        <thead><tr><th>MATERIAL_ID</th><th>ZONE</th><th>STORAGE_BIN</th></tr></thead>
        <tbody>
          ${matches.map(m => `<tr>
            <td>${clean(m.MATERIAL_ID)}</td>
            <td>${clean(m.ZONE)}</td>
            <td>${clean(m.STORAGE_BIN)}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  function renderMatches(matches) {
    const container = $('matches');
    if (!matches.length) { container.innerHTML = '<div class="text-muted">No matches.</div>'; return; }

    const fields = ["MATERIAL_ID","MATERIAL_DESCRIPTION","ZONE","STORAGE_BIN","BATCH","VENDOR_NAME","BARCODE_NUMBER"];
    container.innerHTML = `
      <table class="table table-sm table-hover mb-0">
        <thead><tr>${fields.map(f => `<th>${f}</th>`).join('')}</tr></thead>
        <tbody>
          ${matches.map(r => `<tr>${fields.map(f => `<td>${clean(r[f])}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>`;
  }

  function doSearch(inputValue) {
    const rawInput = inputValue || $('searchInput').value;
    const q = extractGTIN(rawInput);

    if (!q) { setStatus('Scan or enter GTIN / Barcode to search.', true); return; }

    // ✅ Normalize both JSON and input by stripping leading zeros
    const matches = dataset.filter(r =>
      clean(r.BARCODE_NUMBER).replace(/^0+/, '') === q ||
      clean(r.MATERIAL_ID).replace(/^0+/, '') === q
    );

    if (!matches.length) {
      $('notFound').classList.remove('d-none');
      renderMatches([]);
      renderQuickView([]);
      setStatus('No record found.', true);
    } else {
      $('notFound').classList.add('d-none');
      renderMatches(matches);
      renderQuickView(matches);
      setStatus(`${matches.length} record(s) found.`);
    }

    if ($('scanInput')) { $('scanInput').value = ''; $('scanInput').focus(); }
  }

  function attachListeners() {
    $('searchInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    $('searchBtn')?.addEventListener('click', () => doSearch());
    $('scanInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(e.target.value); });
  }

  async function loadData() {
    try {
      setStatus('Loading data...');
      const resp = await fetch('warehouse_data.json', { cache: 'no-cache' });
      dataset = await resp.json();
      setStatus(`✅ Loaded ${dataset.length} records.`);
    } catch {
      setStatus('❌ Failed to load warehouse_data.json', true);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    attachListeners();
    loadData();
    $('scanInput')?.focus();
  });
})();
