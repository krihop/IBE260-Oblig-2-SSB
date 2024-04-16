"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const JSONstat = require("jsonstat-toolkit");
// Constants
const SSB_API_URL = 'https://data.ssb.no/api/v0/no/table/11342';
const port = 3000;
// Express app setup
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname)));
// Middleware for CORS
app.use(function (inRequest, inResponse, inNext) {
    inResponse.header('Access-Control-Allow-Origin', '*');
    inResponse.header('Access-Control-Allow-Methods', 'GET,POST');
    inResponse.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    inNext();
});
// Start server
app.listen(port, () => {
    console.log(`Server started, listening on port ${port}.`);
});
// API endpoint for fetching SSB data
app.post('/get-ssb-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('Received a POST request');
    const query = JSON.stringify(req.body);
    // console.log('Query:', query);
    try {
        const response = yield JSONstat(SSB_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: query
        });
        const dataset = response;
        const jsonStatData = JSONstat(response);
        const tableData = jsonStatData.Dataset(0).toTable();
        if (dataset && tableData) {
            return res.status(200).json({ message: 'Data retrieval successful', dataset, table: tableData });
        }
        else {
            return res.status(400).json({ message: 'Error retrieving data' });
        }
    }
    catch (error) {
        console.error('Internal Server Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}));
