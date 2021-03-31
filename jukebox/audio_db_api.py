from logging import getLogger
from typing import Dict, Optional
from urllib.parse import quote_plus

import aiohttp


class AudioDBApi:
    def __init__(
        self, api_key: str = "1", version: str = "v1", response_format: str = "json"
    ) -> None:
        self.api_key = api_key
        self.root = (
            f"https://www.theaudiodb.com/api/{version}/{response_format}/{api_key}"
        )
        self.logger = getLogger(self.__class__.__name__)

    async def search_artist(
        self, artist_name: str, index: int = None
    ) -> Optional[Dict]:
        try:
            query = f"{self.root}/search.php?s={quote_plus(artist_name)}"
            async with aiohttp.ClientSession() as session:
                async with session.get(query) as response:
                    resp_json = await response.json()
                    if resp_json is None:
                        return None
                    if resp_json["artists"] is None and " " in artist_name:
                        return await self.search_artist(
                            artist_name.replace(" ", ""), index
                        )
                    if resp_json["artists"] is None:
                        return None
                    if index is not None:
                        return resp_json["artists"][index]
                    else:
                        return resp_json["artists"]
        except Exception as err:
            self.logger.exception(err)
            return None

    async def get_artist_image_url(
        self, artist_name: str, size: str = "ArtistThumb"
    ) -> Optional[str]:
        artist_info = await self.search_artist(artist_name, 0)
        return artist_info[f"str{size}"] if artist_info else None

    async def get_artist_image(
        self, artist_name: str, size: str = "ArtistThumb", existing_result: Dict = None
    ) -> Optional[bytes]:
        if existing_result is None:
            query = await self.get_artist_image_url(artist_name, size)
        else:
            query = existing_result[f"str{size}"]
        if query is None:
            return None
        async with aiohttp.ClientSession() as session:
            async with session.get(query) as response:
                return await response.read()

    async def get_artist_info(self, audio_db_artist_id: int) -> Dict:
        query = f"{self.root}/artist.php?i={audio_db_artist_id}"
