import {Component} from "@angular/core"

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.sass"],
})
export class AppComponent {
	title = "Jukebox"
	playlists: string[] = ["favs", "teest"]
	username: string = "Anthony"
}
