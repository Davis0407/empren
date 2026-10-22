let inventoryDataset = [ ];


document.addEventListener("DOMContentLoaded", function() {
    let today = new Date();
    document.getElementById("currentDateStr").innerText = today.toLocaleDateString('es-PE');
    calculateAndRenderGrid();
    setupMenuHighlighter(); 
});


function scrollToCalculations() {
    document.getElementById("dashboardContent").scrollIntoView({ behavior: 'smooth' });
}


function setupMenuHighlighter() {
    const sections = document.querySelectorAll("section");
    const menuItems = document.querySelectorAll(".menu-item");

    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.5 
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                
                menuItems.forEach(item => {
                    item.classList.remove("active");
                    if (item.getAttribute("href") === `#${id}`) {
                        item.classList.add("active");
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}


document.getElementById("stockForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let name = document.getElementById("itemName").value;
    let cost = parseFloat(document.getElementById("itemCost").value);
    let price = parseFloat(document.getElementById("itemPrice").value);
    let qty = parseInt(document.getElementById("itemQty").value);

    inventoryDataset.push({ name, cost, price, qty });
    calculateAndRenderGrid();
    this.reset();
});


function calculateAndRenderGrid() {
    let tbody = document.getElementById("excelTableBody");
    if(!tbody) return;
    tbody.innerHTML = "";

    let aggregateInversion = 0;
    let aggregateProfit = 0;

    inventoryDataset.forEach((item, index) => {
        let formulaInversionTotal = item.cost * item.qty; 
        let formulaUtilidadProyectada = (item.price - item.cost) * item.qty; 

        aggregateInversion += formulaInversionTotal;
        aggregateProfit += formulaUtilidadProyectada;

        let alertClass = item.qty < 5 ? "low-stock-alert" : "";

        tbody.innerHTML += `
            <tr>
                <td class="text-center excel-row-num">${index + 1}</td>
                <td class="${alertClass}"><i class="bi bi-box-seam me-2 text-secondary"></i>${item.name}</td>
                <td class="text-end ${alertClass} fw-bold">${item.qty} u</td>
                <td class="text-end">S/. ${item.cost.toFixed(2)}</td>
                <td class="text-end">S/. ${item.price.toFixed(2)}</td>
                <td class="text-end table-primary-cell">S/. ${formulaInversionTotal.toFixed(2)}</td>
                <td class="text-end table-success-cell">S/. ${formulaUtilidadProyectada.toFixed(2)}</td>
                <td class="text-center">
                    <button class="btn btn-premium-delete" onclick="deleteItem(${index})">
                        Eliminar
                    </button>
                </td>
            </tr>
        `;
    });

    let formulaMarginPct = aggregateInversion > 0 ? (aggregateProfit / aggregateInversion) * 100 : 0;

    document.getElementById("kpiTotalCost").innerText = `S/. ${aggregateInversion.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById("kpiTotalProfit").innerText = `S/. ${aggregateProfit.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById("kpiAvgMargin").innerText = `${formulaMarginPct.toFixed(2)}%`;
}


function deleteItem(index) {
    if (confirm(`¿Está seguro de eliminar el producto "${inventoryDataset[index].name}" de la hoja de cálculo?`)) {
        inventoryDataset.splice(index, 1);
        calculateAndRenderGrid();
    }
}


function exportExcelGrid() {
    if (inventoryDataset.length === 0) {
        alert("La cuadrícula de cálculo se encuentra vacía.");
        return;
    }

    let csvData = "data:text/csv;charset=utf-8,sep=,\n";
    csvData += "Fila,Producto,Cantidad,Costo Unitario,Precio Venta,Inversion Total,Utilidad Proyectada\n";

    inventoryDataset.forEach((item, index) => {
        let totalCost = item.cost * item.qty;
        let totalProfit = (item.price - item.cost) * item.qty;
        let cleanName = item.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        csvData += `${index + 1},${cleanName},${item.qty},S/. ${item.cost.toFixed(2)},S/. ${item.price.toFixed(2)},S/. ${totalCost.toFixed(2)},S/. ${totalProfit.toFixed(2)}\n`;
    });

    let encodedUri = encodeURI(csvData);
    let downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", "Hoja_Calculo_Stock_Vision.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}
