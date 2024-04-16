import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true  // Ensure this flag is set to true
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    // Initialization logic here
  }
}

 // Checkbox class representing checkbox properties
class Checkbox {
  name: string;
  type: string;
  checked: boolean;
  id: string;
  value: string;

  // Constructor to initialize checkbox properties
  constructor(name: string, id: string, value: string) {
    this.name = name;
    this.type = "checkbox";
    this.checked = false;
    this.id = id;
    this.value = value;
  }
}

interface CheckboxData {
  values: string[];
  valueArray: string[];
}

// Data structure for checkboxes
const checkboxesData: { [key: string]: CheckboxData } = {
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
function createCheckboxes(containerId: string, values: string[], valueArray: string[]): void {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = values.map((item, index) => {
      const checkbox = new Checkbox(containerId, item, valueArray[index]);
      return `<input type="${checkbox.type}" id="${checkbox.id}" name="${checkbox.name}" value="${checkbox.value}"><label for="${checkbox.id}">${checkbox.id}</label><br>`;
    }).join('');
  } else {
    console.error(`Error: Container with ID ${containerId} not found.`);
  }
}

// Function to retrieve checked values from checkboxes
function getCheckedValues(): string {
  const checkedValues: string[][] = Object.keys(checkboxesData).map(containerId => {
    const container = document.getElementById(containerId);
    if (container) {
      return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map((item: Element) => (item as HTMLInputElement).value);
    } else {
      console.error(`Error: Container with ID ${containerId} not found.`);
      return [];
    }
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

// Function to create and style table dynamically
function createTable(data: any[]): HTMLTableElement | null {
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
function calculateStatistics(values: string[]): { avg: string; min: number; max: number; median: number } {
  const nonZeroValues = values.filter(val => val !== '-').map(Number);
  const sum = nonZeroValues.reduce((acc, val) => acc + val, 0);
  const avg = (sum / nonZeroValues.length).toFixed(2);
  const min = Math.min(...nonZeroValues);
  const max = Math.max(...nonZeroValues);
  const sortedValues = nonZeroValues.sort((a, b) => a - b);
  const median = sortedValues.length % 2 === 0 ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2 : sortedValues[(sortedValues.length - 1) / 2];
  return { avg, min, max, median };
}

// Function to update mathematical table
function updateMathTable(data: any[]): void {
    const values = data.slice(1).map(row => row[3]);
    const { avg, min, max, median } = calculateStatistics(values);
    // Format average dynamically to remove trailing zeros
    const formattedAvg = parseFloat(avg).toFixed(parseFloat(avg) % 1 !== 0 ? 2 : 0);
    const mathTable = document.getElementById('Math_table');
    if (mathTable) {
      mathTable.innerHTML = `
        <table>
          <tr><td>Average</td><td>${formattedAvg}</td></tr>
          <tr><td>Min</td><td>${min}</td></tr>
          <tr><td>Max</td><td>${max}</td></tr>
          <tr><td>Median</td><td>${median}</td></tr>
        </table>
      `;
    } else {
      console.error('Error: Math_table element not found.');
    }
  }
  

  // Function to handle API call
async function API_callFunction(): Promise<void> {
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
    if (SSB_table) {
      SSB_table.innerHTML = "";
      const table = createTable(tableData);
      if (table) {
        SSB_table.appendChild(table);
        updateMathTable(tableData);
      } else {
        console.error('Error: Unable to create table.');
      }
    } else {
      console.error('Error: SSB_table element not found.');
      }
      } catch (error) {
      console.error(error);
      }
      }
      
      // Initialize checkboxes and attach event listener to button on DOMContentLoaded event
      document.addEventListener('DOMContentLoaded', () => {
      Object.keys(checkboxesData).forEach(key => {
      createCheckboxes(key, checkboxesData[key].values, checkboxesData[key].valueArray);
      });
      
      const checkVariablesBtn = document.getElementById('check_variables');
      if (checkVariablesBtn) {
      checkVariablesBtn.addEventListener('click', API_callFunction);
      } else {
      console.error('Error: check_variables button element not found.');
      }
      });
