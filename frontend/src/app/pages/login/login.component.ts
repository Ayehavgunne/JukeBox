import {Component, ElementRef, OnInit, ViewChild} from "@angular/core"
import {FormBuilder, FormGroup, Validators} from "@angular/forms"
import {Router} from "@angular/router"
import {AuthService} from "../../services/auth.service"
import {PlaylistsService} from "../../services/playlists.service"
import {SetupService} from "../../services/setup.service"

@Component({
	selector: "login",
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.sass"],
})
export class LoginComponent implements OnInit {
	@ViewChild("username_input") username_input: ElementRef<HTMLInputElement>
	form: FormGroup

	constructor(
		private form_builder: FormBuilder,
		private auth_service: AuthService,
		private router: Router,
		private setup_service: SetupService,
		private playlist_service: PlaylistsService,
	) {
		this.form = this.form_builder.group({
			username: ["", Validators.required],
			password: ["", Validators.required],
		})
	}

	ngOnInit(): void {
		setTimeout(() => {
			this.username_input.nativeElement.focus()
		}, 200)
	}

	async login() {
		const val = this.form.value
		this.playlist_service.current_playlist = ""
		if (val.username && val.password) {
			this.auth_service.login(val.username, val.password).then(async response => {
				if (response === "Success") {
					await this.setup_service.setup()
					this.router.navigateByUrl("/").then()
				}
			})
		}
	}
}
