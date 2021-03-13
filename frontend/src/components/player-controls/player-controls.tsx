import {Component, h} from '@stencil/core';

@Component({
    tag: 'player-controls',
    styleUrl: 'player-controls.css',
    shadow: true,
})
export class PlayerControls {

    render() {
        return (
            <div>
                <play-button/>
            </div>
        );
    }
}
