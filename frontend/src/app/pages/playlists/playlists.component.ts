import {Component, OnInit} from "@angular/core"
import {ActivatedRoute} from "@angular/router"
import {print} from "../../utils"

@Component({
	selector: "playlists",
	templateUrl: "./playlists.component.html",
	styleUrls: ["./playlists.component.sass"],
})
export class PlaylistsComponent implements OnInit {
	name: string = ""
	constructor(private route: ActivatedRoute) {}

	ngOnInit(): void {
		this.route.params.subscribe(params => {
			this.name = params["name"] || ""
			print(this.name)
		})
	}
}
