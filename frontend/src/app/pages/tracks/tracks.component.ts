import {Component, OnInit} from "@angular/core"
import {ActivatedRoute} from "@angular/router"
import {Track} from "../../models"
import {print} from "../../utils"

@Component({
	selector: "tracks",
	templateUrl: "./tracks.component.html",
	styleUrls: ["./tracks.component.sass"],
})
export class TracksComponent implements OnInit {
	track?: Track
	track_id: number = 0

	constructor(private route: ActivatedRoute) {}

	ngOnInit(): void {
		this.route.params.subscribe(params => {
			this.track_id = Number(params["track"] || 0)
			print(this.track_id)
		})
	}
}
