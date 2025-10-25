// app.js - now includes Quick Location View ✅
(() => {
  let dataset = [];

  function $id(id) { return document.getElementById(id); }

  function setStatus(msg, isError = false) {
    const s = $id('status');
    if (s) {
      s.innerText = msg;
      s.style.color = isError ? 'crimson' : '';
    }
    console.log('[STATUS]', msg);
  }

  function safeText(x) {
    if (x === null || x === undefined) return '';
    return String(x);
  }

  // ✅ NEW: Quick Location View ────────────────
  function renderQuickView(matches) {
    const card = $id('quickViewCard');
    const container = $id('quickView');

    if (!card || !container) return; // safety

    if (!matches || matches.length === 0) {
      card.classList.add('d-none');
      container.innerHTML = "";
      return;
    }

    card.classList.remove('d-none');

    let html = `
      <table class="table table-sm table-bordered mb-0">
        <thead>
          <tr>
            <th>MATERIAL_ID</th>
            <th>ZONE</th>
            <th>STORAGE_BIN</th>
          </tr>
        </thead>
        <tbody>
    `;

    matches.forEach(m => {
      html += `
        <tr>
          <td>${safeText(m.MATERIAL_ID)}</td>
          <td>${safeText(m.ZONE)}</td>
          <td>${safeText(m.STORAGE_BIN)}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  }

  // ✅ Main match table (unchanged)
  function renderMatches(matches) {
    const container = $id('matches');
    if (!container) return;

    if (!matches || matches.length === 0) {
      container.innerHTML = '<div class="text-muted">No matches.</div>';
      return;
    }

    const fieldOrder = [
      "MATERIAL_ID",
      "MATERIAL_DESCRIPTION",
      "ZONE",
      "STORAGE_BIN",
      "BATCH",
      "VENDOR_NAME",
      "BARCODE_NUMBER"
    ];

    let html = '<table class="table table-sm table-hover mb-0"><thead><tr>';
    fieldOrder.forEach(k => html += `<th>${k}</th>`);
    html += '</tr></thead><tbody>';

    matches.forEach(row => {
      html += '<tr>';
      fieldOrder.forEach(k => html += `<td>${safeText(row[k])}</td>`);
      html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function doSearch() {
    const input = $id('searchInput');
    if (!input) {
      console.error('searchInput missing');
      return;
    }

    const q = input.value.trim();
    if (!q) {
      setStatus('Enter a number to search.');
      return;
    }

    const matches = dataset.filter(r =>
      safeText(r.BARCODE_NUMBER).trim() === q ||
      safeText(r.MATERIAL_ID).trim() === q
    );

    if (!matches || matches.length === 0) {
      $id('notFound')?.classList.remove('d-none');
      renderMatches([]);
      renderQuickView([]); // ✅ clear quick view
      setStatus('No record found.');
    } else {
      $id('notFound')?.classList.add('d-none');
      renderMatches(matches);
      renderQuickView(matches); // ✅ show quick list
      setStatus(`${matches.length} record(s) found.`);
    }
  }

  function attachListeners() {
    const btn = $id('searchBtn');
    const input = $id('searchInput');
    btn?.addEventListener('click', doSearch);
    input?.addEventListener('keydown', e => {
      if (e.key === 'Enter') doSearch();
    });
  }

  async function loadData() {
    try {
      setStatus('Loading local data...');
      const resp = await fetch('warehouse_data.json', { cache: 'no-cache' });
      if (!resp.ok) throw new Error('fetch failed ' + resp.status);
      const data = await resp.json();
      if (!Array.isArray(data)) throw new Error("Data not array");
      dataset = data;
      setStatus(`Loaded ${dataset.length} records.`);
      console.log("Sample:", dataset.slice(0,3));
    } catch (err) {
      console.error(err);
      setStatus("Failed to load data file. Use local server.", true);
      renderMatches([]);
      renderQuickView([]);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    attachListeners();
    loadData();
  });
})();
