import express, { Express, NextFunction, Request, Response } from 'express';
import path from 'path';
const JSONstat = require("jsonstat-toolkit");

// Constants
const SSB_API_URL = 'https://data.ssb.no/api/v0/no/table/11342';
const port: number = 3000;

// Express app setup
const app: Express = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Middleware for CORS
app.use(function(inRequest: Request, inResponse: Response, inNext: NextFunction) {
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
app.post('/get-ssb-data', async (req: Request, res: Response) => {
    // console.log('Received a POST request');

    const query = JSON.stringify(req.body);
    // console.log('Query:', query);

    try {
        const response = await JSONstat(SSB_API_URL, {
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
        } else {
            return res.status(400).json({ message: 'Error retrieving data' });
        }
    } catch (error) {
        console.error('Internal Server Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
