import {Component, OnInit} from "@angular/core"
import {ActivatedRoute} from "@angular/router"
import {print} from "../../utils"

@Component({
	selector: "albums",
	templateUrl: "./albums.component.html",
	styleUrls: ["./albums.component.sass"],
})
export class AlbumsComponent implements OnInit {
	album_id: number = 0

	constructor(private route: ActivatedRoute) {}

	ngOnInit(): void {
		this.route.params.subscribe(params => {
			this.album_id = Number(params["album"] || 0)
			print(this.album_id)
		})
	}
}
