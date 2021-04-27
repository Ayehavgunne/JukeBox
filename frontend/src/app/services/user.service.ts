import {Injectable} from "@angular/core"
import {HttpClient, HttpHeaders} from "@angular/common/http"
import {Observable} from "rxjs"
import {UserQueryResponse, User} from "../models"

@Injectable({
	providedIn: "root",
})
export class UserService {
	url: string = "/users"

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
}
