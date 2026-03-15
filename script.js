document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_elite_v5')) || [];
    let isDark = true;

    // --- GRÁFICAS CONFIG ---
    const lineChart = new Chart(document.getElementById('lineChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Balance', data: [], borderColor: '#6366f1', tension: 0.4, fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)' }] },
        options: { 
            responsive: true, maintainAspectRatio: false,
            layout: { padding: { right: 40, top: 20, left: 10, bottom: 10 } },
            plugins: { legend: { display: false } },
            scales: { 
                y: { ticks: { color: '#94a3b8', callback: v => '$' + v.toLocaleString() }, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
            }
        }
    });

    const pieChart = new Chart(document.getElementById('pieChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: ['Comida', 'Ocio', 'Salud', 'Transporte', 'Otros'], datasets: [{ data: [0,0,0,0,0], backgroundColor: ['#fbbf24', '#3b82f6', '#f87171', '#10b981', '#94a3b8'], borderWeight: 0 }] },
        options: { 
            responsive: true, maintainAspectRatio: false,
            layout: { padding: 20 },
            plugins: { legend: { position: window.innerWidth < 768 ? 'bottom' : 'right', labels: { color: '#94a3b8', padding: 15 } } }
        }
    });

    // --- ACTUALIZAR DATOS ---
    function updateUI() {
        let bal = 0, inc = 0, exp = 0;
        let cats = { "Comida": 0, "Ocio": 0, "Salud": 0, "Transporte": 0, "Otros": 0 };
        document.getElementById('list').innerHTML = '';
        let lineD = [], lineL = [];

        transactions.forEach(t => {
            if(t.cat === 'Ingreso') { bal += t.amt; inc += t.amt; }
            else { bal -= t.amt; exp += t.amt; cats[t.cat] !== undefined ? cats[t.cat] += t.amt : cats["Otros"] += t.amt; }
            lineD.push(bal); lineL.push(t.desc);

            document.getElementById('list').innerHTML += `
                <div class="t-item">
                    <div><b>${t.desc}</b><br><small style="color:var(--text-muted)">${t.cat}</small></div>
                    <div style="font-weight:800; color:${t.cat === 'Ingreso' ? 'var(--success)' : 'var(--danger)'}">
                        ${t.cat === 'Ingreso' ? '+' : '-'}$${t.amt.toLocaleString()}
                    </div>
                </div>`;
        });

        document.getElementById('kpi-balance').innerText = `$${bal.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${inc.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${exp.toLocaleString()}`;
        
        lineChart.data.labels = lineL; lineChart.data.datasets[0].data = lineD;
        lineChart.update();
        pieChart.data.datasets[0].data = Object.values(cats);
        pieChart.update();

        localStorage.setItem('finance_elite_v5', JSON.stringify(transactions));
    }

    // --- EVENTOS ---
    document.getElementById('addBtn').addEventListener('click', () => {
        const d = document.getElementById('desc').value, a = parseFloat(document.getElementById('amt').value), c = document.getElementById('cat').value;
        if(!d || isNaN(a)) return;
        transactions.push({ desc: d, amt: a, cat: c });
        updateUI();
        document.getElementById('desc').value = ''; document.getElementById('amt').value = '';
    });

    document.getElementById('themeBtn').addEventListener('click', () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        document.getElementById('themeBtn').innerText = isDark ? '🌙 MODO OSCURO' : '☀️ MODO CLARO';
        updateUI();
    });

    // --- ZOOM MODAL ---
    const modal = document.getElementById('chartModal');
    let zoomedChart;
    function openZoom(src) {
        modal.style.display = "block";
        if(zoomedChart) zoomedChart.destroy();
        zoomedChart = new Chart(document.getElementById('zoomedChart').getContext('2d'), {
            type: src.config.type,
            data: src.data,
            options: { ...src.options, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { color: isDark?'#fff':'#333'} } } }
        });
    }

    document.getElementById('lineChart').onclick = () => openZoom(lineChart);
    document.getElementById('pieChart').onclick = () => openZoom(pieChart);
    document.querySelector('.close-modal').onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if(e.target == modal) modal.style.display="none"; };
    document.getElementById('clearBtn').onclick = () => { if(confirm("¿Borrar todo?")) {transactions=[]; updateUI();}};

    updateUI();
});
