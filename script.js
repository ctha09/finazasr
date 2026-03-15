document.addEventListener('DOMContentLoaded', () => {
    // Carga de datos
    let transactions = JSON.parse(localStorage.getItem('finance_v6_data')) || [];
    let isDark = true;

    // Elementos del DOM
    const listEl = document.getElementById('list');
    const themeBtn = document.getElementById('themeBtn');
    const addBtn = document.getElementById('addBtn');
    const clearBtn = document.getElementById('clearBtn');
    const modal = document.getElementById('chartModal');
    
    // --- INICIALIZAR GRÁFICAS ---
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Balance', data: [], borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.4 }] },
        options: { 
            responsive: true, maintainAspectRatio: false,
            layout: { padding: { right: 40, top: 20, left: 10, bottom: 10 } },
            plugins: { legend: { display: false } },
            scales: { 
                y: { ticks: { color: '#94a3b8', callback: v => '$' + v.toLocaleString() }, grid: { color: 'rgba(148, 163, 184, 0.05)' } },
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
            }
        }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { labels: ['Comida', 'Ocio', 'Salud', 'Transporte', 'Otros'], datasets: [{ data: [0,0,0,0,0], backgroundColor: ['#fbbf24', '#3b82f6', '#f87171', '#10b981', '#94a3b8'], borderWidth: 0 }] },
        options: { 
            responsive: true, maintainAspectRatio: false,
            layout: { padding: 25 },
            plugins: { legend: { position: window.innerWidth < 768 ? 'bottom' : 'right', labels: { color: '#94a3b8', font: { size: 12 } } } }
        }
    });

    // --- FUNCIONES ---
    function updateUI() {
        let balance = 0, income = 0, expenses = 0;
        let categories = { "Comida": 0, "Ocio": 0, "Salud": 0, "Transporte": 0, "Otros": 0 };
        let lineData = [], lineLabels = [];

        listEl.innerHTML = '';

        transactions.forEach((t, index) => {
            if(t.cat === 'Ingreso') {
                balance += t.amt; income += t.amt;
            } else {
                balance -= t.amt; expenses += t.amt;
                categories[t.cat] !== undefined ? categories[t.cat] += t.amt : categories["Otros"] += t.amt;
            }

            lineData.push(balance);
            lineLabels.push(t.desc);

            listEl.innerHTML += `
                <div class="t-item">
                    <div>
                        <strong style="display:block">${t.desc}</strong>
                        <small style="color:var(--text-muted)">${t.cat}</small>
                    </div>
                    <div style="font-weight:800; color: ${t.cat === 'Ingreso' ? 'var(--success)' : 'var(--danger)'}">
                        ${t.cat === 'Ingreso' ? '+' : '-'}$${t.amt.toLocaleString()}
                    </div>
                </div>`;
        });

        // Actualizar KPIs
        document.getElementById('kpi-balance').innerText = `$${balance.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${income.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${expenses.toLocaleString()}`;

        // Actualizar Gráficas
        lineChart.data.labels = lineLabels;
        lineChart.data.datasets[0].data = lineData;
        lineChart.update();

        pieChart.data.datasets[0].data = Object.values(categories);
        pieChart.update();

        // Guardar
        localStorage.setItem('finance_v6_data', JSON.stringify(transactions));
    }

    // --- EVENTOS ---
    addBtn.addEventListener('click', () => {
        const desc = document.getElementById('desc').value;
        const amt = parseFloat(document.getElementById('amt').value);
        const cat = document.getElementById('cat').value;

        if(!desc || isNaN(amt)) return alert("Completa los campos correctamente");

        transactions.push({ desc, amt, cat });
        updateUI();

        document.getElementById('desc').value = '';
        document.getElementById('amt').value = '';
    });

    clearBtn.addEventListener('click', () => {
        if(confirm("¿Seguro que quieres borrar todos los datos?")) {
            transactions = [];
            updateUI();
        }
    });

    themeBtn.addEventListener('click', () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeBtn.innerText = isDark ? '🌙 MODO OSCURO' : '☀️ MODO CLARO';
        updateUI();
    });

    // --- ZOOM LOGIC ---
    let zoomedChart;
    function openZoom(source) {
        modal.style.display = "block";
        if(zoomedChart) zoomedChart.destroy();
        const ctx = document.getElementById('zoomedChart').getContext('2d');
        zoomedChart = new Chart(ctx, {
            type: source.config.type,
            data: JSON.parse(JSON.stringify(source.data)),
            options: { ...source.options, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { color: isDark ? '#fff' : '#333' } } } }
        });
    }

    document.getElementById('lineBox').onclick = () => openZoom(lineChart);
    document.getElementById('pieBox').onclick = () => openZoom(pieChart);
    document.querySelector('.close-modal').onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if(e.target == modal) modal.style.display = "none"; };

    // Inicio
    updateUI();
});
