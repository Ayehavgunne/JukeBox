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
		let track_id = Number(this.route.snapshot.paramMap.get("track"))
		print(track_id)
		this.track_id = track_id
	}
}
