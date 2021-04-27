import {Component, OnInit} from "@angular/core"
import {ActivatedRoute} from "@angular/router"
import {print} from "../../utils"

@Component({
	selector: "artists",
	templateUrl: "./artists.component.html",
	styleUrls: ["./artists.component.sass"],
})
export class ArtistsComponent implements OnInit {
	artist_id: number = 0
	constructor(private route: ActivatedRoute) {}

	ngOnInit(): void {
		this.route.params.subscribe(params => {
			this.artist_id = Number(params["artist"] || 0)
			print(this.artist_id)
		})
	}
}
