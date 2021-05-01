import {Injectable} from "@angular/core"
import {HttpClient} from "@angular/common/http"
import {Observable} from "rxjs"
import {Track} from "../models"

@Injectable({
	providedIn: "root",
})
export class PlaylistsService {
	url: string = "/playlists"
	names: string[]

	constructor(private http: HttpClient) {}

	get_names(user_id: number): Observable<string[]> {
		return this.http.get<string[]>(`${this.url}/${user_id}`)
	}

	get_tracks(user_id: number, name: string): Observable<Track[]> {
		return this.http.get<Track[]>(`${this.url}/${user_id}/${name}`)
	}

	delete_playlist(user_id: number, name: string): Observable<void> {
		if (this.names.includes(name)) {
			this.names.splice(this.names.indexOf(name), 1)
		}
		return this.http.delete<void>(`${this.url}/${user_id}/${name}`)
	}

	rename_playlist(
		user_id: number,
		old_name: string,
		new_name: string,
	): Observable<void> {
		return this.http.get<void>(`${this.url}/${user_id}/${old_name}/${new_name}`)
	}

	add_to_playlist(name: string, track_id: number, user_id: number): Observable<void> {
		if (!this.names.includes(name)) {
			this.names.push(name)
		}
		return this.http.put<void>(`${this.url}/${name}/${track_id}/${user_id}`, "")
	}

	delete_from_playlist(
		name: string,
		track_id: number,
		user_id: number,
	): Observable<void> {
		return this.http.delete<void>(`${this.url}/${name}/${track_id}/${user_id}`)
	}
}
