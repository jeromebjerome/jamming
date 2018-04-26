import React, { Component } from 'react';

import {SearchBar} from './../SearchBar/SearchBar';
import {Playlist} from './../Playlist/Playlist';
import {SearchResults} from './../SearchResults/SearchResults';

import Spotify from  './../../util/Spotify';

import './App.css';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      searchResults: [],
      /*
      [{id: 1, name: 'Eleanor Rigby', artist: 'The Beatles', album: 'Revolver', uri: ''},
      {id: 2, name: 'Stairway to heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV', uri: ''},
      {id: 3, name: 'New year day', artist: 'U2', album: 'The Unforgettable fire', uri: ''}],
      */
      playlistName: "New playlist",
      playlistTracks: [],
    }

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  savePlaylist() {
    //console.log("App::savePlaylist");
    let trackURIs = [];
    const N = this.state.playlistTracks.length;
    for(let i=0; i<N; i++) {
      trackURIs.push(this.state.playlistTracks[i].uri);
    }
    Spotify.savePlaylist(this.state.playlistName, trackURIs)
  }

  search(term) {
      //console.log("App::search = " + term);
      if(term) {
        Spotify.search(term).then(liste=>{
            //console.log("in the then of search");
            if(liste) {
                //console.log("search was ok");
                this.setState({searchResults: liste});
            }
        })
      }
  }

  updatePlaylistName(name) {
    //console.log("App::updatePlaylistName");
    this.setState({playlistName: name});
  }

  removeTrack(track ) {
    //console.log("App::removeTrack");
    const N = this.state.playlistTracks.length;
    let i = 0;
    while(i < N) {
      if(track.id === this.state.playlistTracks[i].id) {
          this.state.playlistTracks.splice(i, 1);
          this.forceUpdate();
          return;
      }
      i++;
    }
  }

  addTrack(track) {
    //console.log("App::addTrack");
    const N = this.state.playlistTracks.length;
    let i = 0;
    let existe = false;
    while(i < N && existe === false) {
      if(track.id === this.state.playlistTracks[i].id) {
          existe = true;
      }
      i++;
    }
    if(existe === false) {
        //console.log("adding a track to the playlist");
        this.state.playlistTracks.push(track);
        this.forceUpdate();
    }
  }

  render() {
      return(
          <div>
            <h1>Ja<span className="highlight">mmm</span>ing</h1>
            <div className="App">
                <SearchBar onSearch={this.search}/>
              <div className="App-playlist">
                <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} isRemoval={false}/>
                <Playlist name={this.state.playlistName} tracks={this.state.playlistTracks} onNameChange={this.updatePlaylistName} onSave={this.savePlaylist} isRemoval={true} onRemove={this.removeTrack}/>
              </div>
            </div>
          </div>
      );
  }
}

export default App;
