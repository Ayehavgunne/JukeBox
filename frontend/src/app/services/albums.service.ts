import {Injectable} from "@angular/core"
import {HttpClient} from "@angular/common/http"
import {Observable} from "rxjs"
import {Album, Track} from "../models"

@Injectable({
	providedIn: "root",
})
export class AlbumsService {
	url: string = "/albums"

	constructor(private http: HttpClient) {}

	get_album(album_id: number): Observable<Album> {
		return this.http.get<Album>(`${this.url}/${album_id}`)
	}

	get_albums(artist_id?: number): Observable<Album[]> {
		if (artist_id) {
			return this.http.get<Album[]>(`/artists/${artist_id}/albums`)
		}
		return this.http.get<Album[]>(`${this.url}`)
	}

	get_tracks(album_id: number): Observable<Track[]> {
		return this.http.get<Track[]>(`${this.url}/${album_id}/tracks`)
	}
}
