import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface SsbQuery {
    query: SsbQueryItem[];
    response: {
        format: string;
    };
}

export interface SsbQueryItem {
    code: string;
    selection: {
        filter: string;
        values: string[];
    };
}

export interface SsbApiResponse {
    version: string;
    class: string;
    label: string;
    source: string;
    updated: string;
    note: string[];
    role: {
        time: string[];
        geo: string[];
        metric: string[];
    };
    id: string[];
    size: number[];
    dimension: {
        Region: {
            label: string;
            category: {
                index: { [key: string]: number };
                label: { [key: string]: string };
            };
            extension: {
                elimination: boolean;
                show: string;
            };
            link: {
                describedby: { extension: { Region: string } }[];
            };
        };
        ContentsCode: {
            label: string;
            category: {
                index: { [key: string]: number };
                label: { [key: string]: string };
                unit: { [key: string]: { base: string; decimals: number } };
            };
            extension: {
                elimination: boolean;
                refperiod: { [key: string]: string };
                show: string;
            };
        };
        Tid: {
            label: string;
            category: {
                index: { [key: string]: number };
                label: { [key: string]: string };
            };
            extension: {
                elimination: boolean;
                show: string;
            };
        };
    };
    extension: {
        px: {
            infofile: string;
            tableid: string;
            decimals: number;
            "official-statistics": boolean;
            aggregallowed: boolean;
            language: string;
            matrix: string;
            "subject-code": string;
        };
        contact: {
            name: string;
            phone: string;
            mail: string;
            raw: string;
        }[];
    };
    value: number[];
}

@Injectable({
    providedIn: 'root'
})
export class SsbService {
    private http = inject(HttpClient);
    private apiUrl = 'https://data.ssb.no/api/v0';

    getTable(table: number, body: SsbQuery): Observable<SsbApiResponse> {
        const url = `${this.apiUrl}/no/table/${table}`;
        return this.http.post<SsbApiResponse>(url, body);
    }
}
