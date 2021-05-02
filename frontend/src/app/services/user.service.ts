import {ChangeDetectorRef, Injectable} from "@angular/core"
import {HttpClient, HttpHeaders} from "@angular/common/http"
import {Observable} from "rxjs"
import {UserQueryResponse, User, ModalConfig} from "../models"
import {CookiesService} from "./cookies.service"
import {PlaylistsService} from "./playlists.service"
import {ModalComponent} from "../components/modal/modal.component"

@Injectable({
	providedIn: "root",
})
export class UserService {
	private url: string = "/users"
	current_user: User

	constructor(private http: HttpClient) {}

	get_user_by_id(user_id: number): Observable<UserQueryResponse> {
		return this.http.get<UserQueryResponse>(`${this.url}/${user_id}`)
	}

	get_user_by_name(username: string): Observable<UserQueryResponse> {
		return this.http.get<UserQueryResponse>(`${this.url}/${username}`)
	}

	get_users(): Observable<User[]> {
		return this.http.get<User[]>(this.url)
	}

	create_user(username: string): Observable<UserQueryResponse> {
		return this.http.put<UserQueryResponse>(`${this.url}/${username}`, HttpHeaders)
	}

	async set_current_user(
		cookies_service: CookiesService,
		playlist_service: PlaylistsService,
		modal: ModalComponent,
		modal_config: ModalConfig,
		change_detector: ChangeDetectorRef,
	) {
		let user_id = Number(cookies_service.get("user_id") || 0)
		if (user_id) {
			let user = await this.get_user_by_id(user_id).toPromise()
			if (user.error !== "User does not exist") {
				this.current_user = {
					username: user.username,
					user_id: user.user_id,
				}
				playlist_service.names = await playlist_service
					.get_names(this.current_user.user_id)
					.toPromise()
				return
			}
		}
		let username: string = await this.get_username(
			modal,
			modal_config,
			change_detector,
		)
		if (username) {
			let user = await this.get_user_by_name(username).toPromise()
			if (user.error === "User does not exist") {
				user = await this.create_user(username).toPromise()
				this.current_user = {
					username: user.username,
					user_id: user.user_id,
				}
				cookies_service.set("user_id", user.user_id + "")
				playlist_service.names = await playlist_service
					.get_names(this.current_user.user_id)
					.toPromise()
			} else {
				this.current_user = {
					username: user.username,
					user_id: user.user_id,
				}
				cookies_service.set("user_id", user.user_id + "")
				playlist_service.names = await playlist_service
					.get_names(this.current_user.user_id)
					.toPromise()
			}
		}
	}

	async get_username(
		modal: ModalComponent,
		modal_config: ModalConfig,
		change_detector: ChangeDetectorRef,
	): Promise<string> {
		modal_config.modal_title = "What is your username?"
		modal_config.show_dismiss_button = false
		modal.show()
		change_detector.detectChanges()
		let response = await modal.get_response()
		return response.input
	}
}
