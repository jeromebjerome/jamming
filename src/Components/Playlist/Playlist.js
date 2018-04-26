
import React from 'react';

import {TrackList} from './../TrackList/TrackList';

import './Playlist.css';

export class Playlist extends React.Component {

    constructor(props) {
        super(props);
        this.handleNameChange = this.handleNameChange.bind(this);
    }

    handleNameChange(e) {
        this.props.onNameChange(e.target.value);
    }

    render() {
        return(
            <div className="Playlist">
                <input value="New Playlist" onChange={this.handleNameChange}/>
                <TrackList name={this.props.name} isRemoval={this.props.isRemoval} tracks={this.props.tracks} onRemove={this.props.onRemove}/>
                <a className="Playlist-save" onClick={this.props.onSave}>SAVE TO SPOTIFY</a>
            </div>
        );
    };
};
