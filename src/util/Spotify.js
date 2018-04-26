
const CLIENT_ID = '7baa50c0fbc7458196dff89f7b0d7c48';

//const REDIRECT_URI = 'http://abyssin.surge.sh';
const REDIRECT_URI = 'http://localhost:3000/';

let USER_ACCESS_TOKEN = '';
let EXPIRATION_DATE = '';

// =================================================================================================================
// I moved getAccessToken outside the Spotify object because I wanted to use the promise
// architecture to avoid entering the search term twice. (In a previous version, I typed the term,
// clicked Search and then the window was redirected and the search executed before I got the authorization
// so I had to enter the search another time to actually get the results.
// Also it seems that the promise is not allowed with a function member of an object (binding problem??))
//
// Anyway, it still does not behav as I want; The window location change still executes asynchronously
// and causes imperfect behaviour.
// =================================================================================================================

function extractToken(url) {

    //console.log(url);
    
    let access_table = url.match(/access_token=([^&]*)/);
    if(access_table) {
        if(access_table.length > 0) {
            USER_ACCESS_TOKEN = access_table[1];
        }
    }

    let expire_table = url.match(/expires_in=([^&]*)/);
    if(expire_table) {
        if(expire_table.length > 0) {
            EXPIRATION_DATE = expire_table[1];
        }
    }

    //console.log('USER_ACCESS_TOKEN = ' + USER_ACCESS_TOKEN);
    //console.log('EXPIRATION_DATE = ' + EXPIRATION_DATE);

    if(USER_ACCESS_TOKEN) {

        return(true);
    }

    return(false);
}

function getAccessToken() {

    return new Promise(function (resolve, reject) {
    
        // Not used. In case the async fails to return the token
        // I would have looped the whole process
        // ======================================================
        //for(let i=0; i<1; i++) {

        //console.log("Spotify::getAccessToken");

            // 1) The acces token is set
            if(USER_ACCESS_TOKEN) {

                //console.log('access token exists ' + USER_ACCESS_TOKEN);
                resolve(USER_ACCESS_TOKEN);
            }
            else {

                // 2) The acces token is in the url
                if(extractToken(window.location.href)) {

                    //console.log('user token is set');
                    window.setTimeout(() => USER_ACCESS_TOKEN = '', EXPIRATION_DATE * 1000);
    window.history.pushState('Access Token', null, '/');
                    resolve(USER_ACCESS_TOKEN);
                }
                // 3) Redirect to get the token
                else {

                    let newurl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&state=test`;
                    ///console.log("url for redirection " + newurl);
                    window.location = newurl;
                    // Loop to wait for the access token
                    /*
                    // Another try to force wait until the token is set
                    // but makes the system hang
                    while(true) {
                        if(extractToken(window.location.href) != '') {
                            break;
                        }
                    }
                    */
                    resolve(USER_ACCESS_TOKEN);
                }
            }
    })
}

let Spotify = {

    search(term) {

        //console.log("Spotify::search " + term);

        // =================================================================================================================
        // Using the promise here so that App::search executes the full search
        // sequence before exiting.
        // =================================================================================================================

        return new Promise(function (resolve, reject) {

            getAccessToken().then(user_access_token => {
                
                if(user_access_token !== '') {

                    fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,
                    {
                        headers: {
                            Authorization: `Bearer ${user_access_token}`,
                        }
                    })
                    .then(response => {

                        //console.log("In the then of fetch");
                        
                        if (response.ok) {

                            //console.log("Spotify::search " + term);
                            response.json().then(function(data) {
                                    
                                //console.log("in the response.json()" + term);
                                //console.log("in the new promise");
                                
                                let tracks = [];
                                const N = data.tracks.items.length;
                                for(let j=0; j<N; j++) {
                                    let trak = {
                                        id: data.tracks.items[j].id,
                                        artist: data.tracks.items[j].album.artists[0].name,
                                        album: data.tracks.items[j].album.name,
                                        name: data.tracks.items[j].name,
                                        uri: data.tracks.items[j].uri,
                                    }
                                    tracks.push(trak);
                                    //console.log(trak);
                                }
                                //console.log("calling resolve");
                                resolve(tracks);
                            })
                        }
                    })
                }
            })
        })
    },

    // =================================================================================================================
    // The playlist save never worked. It seems that saving a laylist require a higher credential authorization.
    // I tried the function through the Spotify developer API tester and it failed too with error 403.
    // =================================================================================================================
    savePlaylist: function(playlistName, uris) {

        //console.log("Spotify::savePlaylist");
        //this.getAccessToken();
        getAccessToken();
        
        //console.log("uris length = ", uris.length);

    // =================================================================================================================
    // By the way, why is this test below false, even with uris.length = 4 ?????        
    // =================================================================================================================
        /*
        if(playlistName && uris.lenth>0) {
            console.log("vrai");
        }
        else {
            console.log("faux");
        }
        */

        ///if(playlistName && uris.lenth>0) {
        if(playlistName) {

            let acc_tok = USER_ACCESS_TOKEN;
            let aut_hdr = {headers: {Authorization: `Bearer ${acc_tok}`}};
            let user_id ='';
    
            // 1) get the user id
            fetch(`https://api.spotify.com/v1/me`, aut_hdr)
            .then(response => {
                if (response.ok) {
                    response.json().then(function(data) {
        
                        user_id = data['display_name'];
                        //console.log(user_id);
                        // 2) create the playlist
    // =================================================================================================================
    // This fetch fails with error: INSUFFICIENT SCOPE or error 403
    // Seems the implicit grant scheme is not the right level of authorization for accessing playlist functions.
    // =================================================================================================================
                        fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`,
                        {
                            method: 'POST',
                            body: {
                                body: JSON.stringify({ name: playlistName })
                            }, 
                            headers: {
                                Authorization: `Bearer ${acc_tok}`,
                                "Content-type": "application/json"
                            }
                        })
                        .then(response => {

                            // Never reached that step due to previous error
                            
                            //console.log("dans le then de fetch save playlist");
                            if (response.ok) {
                                // 3) save the tracks
                                fetch(`https://api.spotify.com/v1/users/${user_id}/playlists/${playlistName}/tracks`,
                                {
                                    method: 'POST',
                                    body: {
                                        body: JSON.stringify({ uris: uris })
                                    }, 
                                    headers: {
                                        Authorization: `Bearer ${acc_tok}`,
                                        "Content-type": "application/json"
                                    }
                                })
                            }
                        })
                    });
                }
            })
        }
        else {

            return;
        }
    },

};

export default Spotify;
