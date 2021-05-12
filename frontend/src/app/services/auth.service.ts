import {Injectable} from "@angular/core"
import {UserService} from "./user.service"

@Injectable({
	providedIn: "root",
})
export class AuthService {
	constructor(private user_service: UserService) {}

	login(username: string, password: string) {
		return fetch("/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: username,
				password: password,
			}),
		})
			.then(response => {
				return response.json()
			})
			.then(response => {
				if (response.message === "Authenticated") {
					this.user_service.set_current_user(response.user)
					return "Success"
				} else {
					return "Failed"
				}
			})
	}
}
