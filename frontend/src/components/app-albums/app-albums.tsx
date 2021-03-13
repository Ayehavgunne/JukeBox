import {Component, Host, h} from '@stencil/core';

@Component({
    tag: 'app-albums',
    styleUrl: 'app-albums.css',
    shadow: true,
})
export class AppAlbums {

    render() {
        return (
            <Host>
                <slot></slot>
            </Host>
        );
    }

}
