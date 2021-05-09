import {Injectable} from "@angular/core"
import {HttpClient} from "@angular/common/http"
import {Observable} from "rxjs"
import {Album, Track} from "../models"
import {UserService} from "./user.service"

@Injectable({
	providedIn: "root",
})
export class AlbumsService {
	url: string = "/albums"
	loved_albums: number[]

	constructor(private http: HttpClient, private user_service: UserService) {}

	get_album(album_id: number): Observable<Album> {
		return this.http.get<Album>(`${this.url}/${album_id}`)
	}

	get_albums(artist_id?: number): Observable<Album[]> {
		if (artist_id) {
			return this.http.get<Album[]>(`/artists/${artist_id}/albums`)
		}
		return this.http.get<Album[]>(`${this.url}`)
	}

	get_loved_albums(): Observable<number[]> {
		return this.http.get<number[]>(
			`/love/album/${this.user_service.current_user.user_id}`,
		)
	}

	get_tracks(album_id: number): Observable<Track[]> {
		return this.http.get<Track[]>(`${this.url}/${album_id}/tracks`)
	}

	change_album_love(album_id: number, is_loved: boolean): Promise<string> {
		let url: string = `/love/album/${this.user_service.current_user.user_id}/${album_id}`
		let method = "PUT"
		if (!is_loved) {
			method = "DELETE"
			this.loved_albums.splice(this.loved_albums.indexOf(album_id), 1)
		} else {
			this.loved_albums.push(album_id)
		}
		return fetch(url, {method: method}).then(response => {
			return response.text()
		})
	}
}
