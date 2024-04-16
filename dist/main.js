// Class for creating checkboxes
class Checkbox {
    constructor(name, id, value) {
        this.name = name;
        this.type = "checkbox";
        this.checked = false;
        this.id = id;
        this.value = value;
    }
}

// Data for checkboxes
const checkboxesData = {
    selection1: {
        values: ["Befolkning", "Areal", "Landareal", "Innbyggere"],
        valueArray: ["Folkemengde", "ArealKm2", "LandArealKm2", "FolkeLandArealKm2"]
    },
    selection2: {
        values: Array.from({ length: 5 }, (_, i) => `${2020 + i}`),
        valueArray: Array.from({ length: 5 }, (_, i) => `${2020 + i}`)
    },
    selection3: {
        values: ["1506 Molde", "1579 Hustadvika", "1547 Aukra", "1557 Gjemnes"],
        valueArray: ["1506", "1579", "1547", "1557"]
    }
};

// Function to create checkboxes dynamically
function createCheckboxes(containerId, values, valueArray) {
    const container = document.getElementById(containerId);
    container.innerHTML = values.map((item, index) => {
        const checkbox = new Checkbox(containerId, item, valueArray[index]);
        return `<input type="${checkbox.type}" id="${checkbox.id}" name="${checkbox.name}" value="${checkbox.value}"><label for="${checkbox.id}">${checkbox.id}</label><br>`;
    }).join('');
}

// Function to get checked values from checkboxes
function getCheckedValues() {
    const checkedValues = Object.keys(checkboxesData).map(containerId => {
        const container = document.getElementById(containerId);
        return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(item => item.value);
    });
    if (checkedValues.some(arr => arr.length === 0)) {
        throw new Error('At least one checkbox must be checked in each array');
    }
    return JSON.stringify({
        "query": checkedValues.map((values, index) => ({
            "code": index === 0 ? "ContentsCode" : (index === 1 ? "Tid" : "Region"),
            "selection": {
                "filter": "item",
                "values": values
            }
        })),
        "response": {
            "format": "json-stat2"
        }
    });
}

// Function to create table from data
function createTable(data) {
    if (!data || data.length === 0) {
        console.error('Error: Invalid data received');
        return null;
    }

    const table = document.createElement('table');
    const header = table.createTHead();
    const row = header.insertRow(0);
    ["Region", "Statistikkvariabel", "År", "Verdi"].forEach(headerText => {
        const cell = row.insertCell();
        cell.textContent = headerText;
    });
    row.classList.add('header-row');

    const body = table.createTBody();
    let lastRegion = '';
    for (let i = 1; i < data.length; i++) {
        const row = body.insertRow(i - 1);
        for (let j = 0; j < data[i].length; j++) {
            const cell = row.insertCell(j);
            if (data[i][j] === 0) {
                data[i][j] = '-';
            } else {
                cell.textContent = data[i][j];
            }
            if (j === 0) {
                cell.classList.add('region-name');
                if (data[i][j] === lastRegion) {
                    cell.classList.add('repeated-region');
                }
                lastRegion = data[i][j];
            }
        }
    }
    return table;
}

// Function to calculate statistics
function calculateStatistics(values) {
    const nonZeroValues = values.filter(val => val !== '-').map(Number);
    const sum = nonZeroValues.reduce((acc, val) => acc + val, 0);
    const avg = (sum / nonZeroValues.length).toFixed(2);
    const min = Math.min(...nonZeroValues);
    const max = Math.max(...nonZeroValues);
    const sortedValues = nonZeroValues.sort((a, b) => a - b);
    const median = sortedValues.length % 2 === 0 ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2 : sortedValues[(sortedValues.length - 1) / 2];
    return { avg, min, max, median };
}

// Function to update math table with statistics
function updateMathTable(data) {
    const values = data.slice(1).map(row => row[3]);
    const { avg, min, max, median } = calculateStatistics(values);
    const mathTable = document.getElementById('Math_table');
    mathTable.innerHTML = `
        <table>
            <tr><td>Average</td><td>${avg}</td></tr>
            <tr><td>Min</td><td>${min}</td></tr>
            <tr><td>Max</td><td>${max}</td></tr>
            <tr><td>Median</td><td>${median}</td></tr>
        </table>
    `;
}

// Function to handle API call and update table
async function API_callFunction() {
    try {
        const JSON_query = getCheckedValues();
        const response = await fetch('http://localhost:3000/get-ssb-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON_query,
        });

        const queryResponse = await response.json();
        const tableData = queryResponse.table;
        const SSB_table = document.getElementById('SSB_table');
        SSB_table.innerHTML = "";
        const table = createTable(tableData);
        if (table) {
            SSB_table.appendChild(table);
            updateMathTable(tableData);
        } else {
            console.error('Error: Unable to create table.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Create checkboxes on page load
Object.keys(checkboxesData).forEach(key => {
    createCheckboxes(key, checkboxesData[key].values, checkboxesData[key].valueArray);
});

// Add event listener for checkbox click
document.getElementById('check_variables').addEventListener('click', API_callFunction);
