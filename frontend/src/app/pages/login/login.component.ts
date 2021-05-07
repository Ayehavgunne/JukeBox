import {Component, OnInit} from "@angular/core"
import {FormBuilder, FormGroup, Validators} from "@angular/forms"
import {Router} from "@angular/router"
import {AuthService} from "../../services/auth.service"
import {UserService} from "../../services/user.service"
import {CookiesService} from "../../services/cookies.service"
import {PlaylistsService} from "../../services/playlists.service"
import {print} from "../../utils"

@Component({
	selector: "login",
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.sass"],
})
export class LoginComponent implements OnInit {
	form: FormGroup

	constructor(
		private form_builder: FormBuilder,
		private auth_service: AuthService,
		private router: Router,
		private user_service: UserService,
		private cookies_service: CookiesService,
		public playlist_service: PlaylistsService,
	) {
		this.form = this.form_builder.group({
			username: ["", Validators.required],
			password: ["", Validators.required],
		})
	}

	ngOnInit(): void {}

	login() {
		const val = this.form.value
		if (val.username && val.password) {
			this.auth_service.login(val.username, val.password).then(async response => {
				if (response === "Success") {
					if (this.user_service.current_user === undefined) {
						let user_id = Number(this.cookies_service.get("user_id") || 0)
						let user = await this.user_service
							.get_user_by_id(user_id)
							.toPromise()
						this.user_service.set_current_user(user)
					}
					this.playlist_service
						.get_names(this.user_service.current_user.user_id)
						.subscribe(names => {
							this.playlist_service.names = names
						})
					this.router.navigateByUrl("/").then()
				} else {
					this.router.navigateByUrl("/login").then()
				}
			})
		}
	}
}
