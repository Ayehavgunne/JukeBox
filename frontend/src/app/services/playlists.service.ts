import {Injectable} from "@angular/core"
import {HttpClient} from "@angular/common/http"
import {Observable} from "rxjs"
import {Track} from "../models"

@Injectable({
	providedIn: "root",
})
export class PlaylistsService {
	url: string = "/playlists"
	names: string[] = []
	current_playlist: string = ""
	tracks: Track[]

	constructor(private http: HttpClient) {}

	other_names(): string[] {
		return this.names.filter(item => {
			return item !== this.current_playlist
		})
	}

	get_names(user_id: number): Observable<string[]> {
		return this.http.get<string[]>(`${this.url}/${user_id}`)
	}

	get_tracks(user_id: number, name: string): Observable<Track[]> {
		return this.http.get<Track[]>(`${this.url}/${user_id}/${name}`)
	}

	delete_playlist(user_id: number, name: string): Observable<string[]> {
		if (this.names.includes(name)) {
			this.names.splice(this.names.indexOf(name), 1)
		}
		return this.http.delete<string[]>(`${this.url}/${user_id}/${name}`)
	}

	rename_playlist(
		user_id: number,
		old_name: string,
		new_name: string,
	): Observable<string[]> {
		return this.http.get<string[]>(`${this.url}/${user_id}/${old_name}/${new_name}`)
	}

	add_to_playlist(
		name: string,
		track_id: number,
		user_id: number,
	): Observable<string> {
		if (!this.names.includes(name)) {
			this.names.push(name)
		}
		return this.http.put(`${this.url}/${name}/${track_id}/${user_id}`, "", {
			responseType: "text",
		})
	}

	delete_from_playlist(
		name: string,
		track_id: number,
		user_id: number,
	): Observable<string> {
		return this.http.delete(`${this.url}/${name}/${track_id}/${user_id}`, {
			responseType: "text",
		})
	}
}
