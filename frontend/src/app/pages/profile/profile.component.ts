import {Component, OnInit} from "@angular/core"

@Component({
	selector: "profile",
	templateUrl: "./profile.component.html",
	styleUrls: ["./profile.component.sass"],
})
export class ProfileComponent implements OnInit {
	name: string = "Anthony"

	constructor() {}

	ngOnInit(): void {}
}
