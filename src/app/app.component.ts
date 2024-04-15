import { Component, computed, inject, model } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SsbQuery, SsbService } from "./ssb.service";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
// @ts-ignore
import JSONstat from "jsonstat-toolkit";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatOption, MatSelect } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { switchMap } from "rxjs";


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, MatFormField, MatSelect, MatOption, MatLabel, FormsModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    private readonly JSONstat = JSONstat;

    private ssbService = inject(SsbService);

    public title = 'Statistikkportal';

    public region = model<string>('1506');
    public regions = [
        {label: 'Molde', value: '1506'},
        {label: 'Hustadvika', value: '1579'},
        {label: 'Aukra', value: '1547'},
        {label: 'Gjemnes', value: '1557'},
    ]

    private query = computed(() => ({
        query: [
            {
                code: "Region",
                selection: {
                    filter: "vs:Kommune",
                    values: [
                        this.region()
                    ]
                }
            },
            {
                code: "Tid",
                selection: {
                    filter: "item",
                    values: [
                        "2020",
                        "2021",
                        "2022",
                        "2023",
                        "2024"
                    ]
                }
            }
        ],
        response: {
            format: "json-stat2"
        }
    } as SsbQuery))

    public dataset = toSignal(
        toObservable(this.query).pipe(
            switchMap(query => this.ssbService.getTable(11342, query)
            )
        ));

    private tableData = computed(() => {
        const data = this.dataset();
        if (!data) return [];

        console.log(JSONstat(data).toTable());
        return JSONstat(data).toTable();
    });

    public columns = computed(() => this.tableData()[0]);
    public rows = computed(() => this.tableData().slice(1));

}
