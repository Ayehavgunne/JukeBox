import {Injectable} from "@angular/core"
import {HttpClient, HttpHeaders} from "@angular/common/http"
import {Observable} from "rxjs"
import {UserQueryResponse, User} from "../models"
import {CookiesService} from "./cookies.service"
import {print} from "../utils"

@Injectable({
	providedIn: "root",
})
export class UserService {
	private url: string = "/users"
	current_user: User

	constructor(private http: HttpClient, private cookies_service: CookiesService) {}

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

	set_current_user(user: User): void {
		this.cookies_service.set("user_id", user.user_id + "")
		this.current_user = user
	}
}
