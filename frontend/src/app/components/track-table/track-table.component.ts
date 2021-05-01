import {Component, OnInit} from '@angular/core';
import {Track} from "../../models";

@Component({
	selector: 'track-table',
	templateUrl: './track-table.component.html',
	styleUrls: ['./track-table.component.sass']
})
export class TrackTableComponent implements OnInit {
	tracks: Track[]
	show_headers: boolean

	constructor() {
	}

	ngOnInit(): void {
	}

}
