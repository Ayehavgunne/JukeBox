import {Injectable} from "@angular/core"
import {Observable} from "rxjs"
import {Artist, Track} from "../models"
import {HttpClient} from "@angular/common/http"

@Injectable({
	providedIn: "root",
})
export class ArtistsService {
	url: string = "/artists"
	constructor(private http: HttpClient) {}

	get_artist(artist_id: number): Observable<Artist> {
		return this.http.get<Artist>(`${this.url}/${artist_id}`)
	}

	get_artists(): Observable<Artist[]> {
		return this.http.get<Artist[]>(`${this.url}`)
	}

	get_tracks(artist_id: number): Observable<Track[]> {
		return this.http.get<Track[]>(`${this.url}/${artist_id}/tracks`)
	}
}
