import {Component, OnInit} from "@angular/core"
import {ActivatedRoute} from "@angular/router"
import {Track} from "../../models"
import {print} from "../../utils"
import {TracksService} from "../../services/tracks.service"

@Component({
	selector: "tracks",
	templateUrl: "./tracks.component.html",
	styleUrls: ["./tracks.component.sass"],
})
export class TracksComponent implements OnInit {
	tracks?: Track[]
	show_headers: boolean = true

	constructor(private route: ActivatedRoute, private tracks_service: TracksService) {}

	ngOnInit(): void {
		this.route.params.subscribe(params => {
			let track_id = Number(params["track"] || 0)
			if (track_id) {
				this.tracks_service.get_tracks(track_id).subscribe(tracks => {
					this.tracks = tracks
				})
			} else {
				this.tracks_service.get_tracks().subscribe(tracks => {
					this.tracks = tracks
				})
			}
		})
	}
}
