import {Injectable} from "@angular/core"
import {Observable} from "rxjs"
import {Artist, Track} from "../models"
import {HttpClient} from "@angular/common/http"
import {UserService} from "./user.service"

@Injectable({
	providedIn: "root",
})
export class ArtistsService {
	url: string = "/artists"
	loved_artists: number[]

	constructor(private http: HttpClient, private user_service: UserService) {}

	get_artist(artist_id: number): Observable<Artist> {
		return this.http.get<Artist>(`${this.url}/${artist_id}`)
	}

	get_artists(): Observable<Artist[]> {
		return this.http.get<Artist[]>(`${this.url}`)
	}

	get_loved_artists(): Observable<number[]> {
		return this.http.get<number[]>(
			`/love/artist/${this.user_service.current_user.user_id}`,
		)
	}

	get_tracks(artist_id: number): Observable<Track[]> {
		return this.http.get<Track[]>(`${this.url}/${artist_id}/tracks`)
	}

	change_artist_love(artist_id: number, is_loved: boolean): Promise<string> {
		let url: string = `/love/artist/${this.user_service.current_user.user_id}/${artist_id}`
		let method = "PUT"
		if (!is_loved) {
			method = "DELETE"
			this.loved_artists.splice(this.loved_artists.indexOf(artist_id), 1)
		} else {
			this.loved_artists.push(artist_id)
		}
		return fetch(url, {method: method}).then(response => {
			return response.text()
		})
	}
}
